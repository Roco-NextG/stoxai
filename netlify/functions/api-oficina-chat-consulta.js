import { getStore } from "@netlify/blobs";

const STOPWORDS = new Set([
  "que", "con", "una", "uno", "los", "las", "del", "por", "para", "como",
  "este", "esta", "esto", "tengo", "necesito", "necesitamos", "ayuda", "hola",
  "buenas", "porfavor", "favor", "gracias", "sobre", "quien", "quiero", "hacer"
]);

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function tokenizar(texto) {
  return normalizar(texto)
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

function contarCoincidencias(tokensConsulta, palabrasClave) {
  const setClave = palabrasClave.map((p) => normalizar(p));
  let score = 0;
  tokensConsulta.forEach((token) => {
    setClave.forEach((clave) => {
      if (clave === token) {
        score += 2;
      } else if (clave.length >= 4 && token.length >= 4 && (clave.includes(token) || token.includes(clave))) {
        score += 1;
      }
    });
  });
  return score;
}

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { texto } = await request.json();
    if (!texto || !texto.trim()) {
      return new Response(JSON.stringify({ error: "Escribe una consulta" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("oficina");
    const [keywords, puestos, historial] = await Promise.all([
      store.get("keywords", { type: "json" }).then((v) => v || []),
      store.get("puestos", { type: "json" }).then((v) => v || {}),
      store.get("chatFeedback", { type: "json" }).then((v) => v || [])
    ]);

    const tokensConsulta = tokenizar(texto);

    // Puntuacion base: palabras clave configuradas manualmente por departamento
    const scoreDepartamentos = {};
    keywords.forEach((k) => {
      scoreDepartamentos[k.departamento] = contarCoincidencias(tokensConsulta, k.palabras || []);
    });

    // Puntuacion extra: historial de consultas pasadas confirmadas como correctas
    historial
      .filter((h) => h.correcto)
      .forEach((h) => {
        const tokensHist = tokenizar(h.texto);
        const coincidencias = tokensConsulta.filter((t) => tokensHist.includes(t)).length;
        if (coincidencias > 0 && h.departamentoSugerido) {
          scoreDepartamentos[h.departamentoSugerido] =
            (scoreDepartamentos[h.departamentoSugerido] || 0) + coincidencias * 2;
        }
      });

    const departamentosOrdenados = Object.keys(scoreDepartamentos)
      .map((d) => ({ departamento: d, score: scoreDepartamentos[d] }))
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score);

    if (departamentosOrdenados.length === 0) {
      return new Response(JSON.stringify({ sugerencias: [], mensaje: "No encontre ninguna coincidencia clara. Prueba con otras palabras." }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const mejorScore = departamentosOrdenados[0].score;
    const topDepartamentos = departamentosOrdenados.filter((d) => d.score === mejorScore).slice(0, 3);

    const sugerencias = topDepartamentos.map((dep) => {
      const empleados = Object.keys(puestos)
        .filter((id) => puestos[id].departamento === dep.departamento)
        .map((id) => ({ id, nombre: puestos[id].nombre, puesto: puestos[id].puesto }));
      return { departamento: dep.departamento, score: dep.score, empleados };
    });

    return new Response(JSON.stringify({ sugerencias }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/oficina-chat-consulta"
};
