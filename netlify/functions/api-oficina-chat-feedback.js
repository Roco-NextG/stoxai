import { getStore } from "@netlify/blobs";

const MAX_HISTORIAL = 500;

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { texto, departamentoSugerido, empleadoSugerido, correcto } = await request.json();

    if (!texto || !departamentoSugerido || typeof correcto !== "boolean") {
      return new Response(JSON.stringify({ success: false, message: "Faltan datos del feedback" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("oficina");
    const historial = (await store.get("chatFeedback", { type: "json" })) || [];

    historial.push({
      id: crypto.randomUUID(),
      texto,
      departamentoSugerido,
      empleadoSugerido: empleadoSugerido || null,
      correcto,
      timestamp: Date.now()
    });

    const recortado = historial.slice(-MAX_HISTORIAL);
    await store.setJSON("chatFeedback", recortado);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/oficina-chat-feedback"
};
