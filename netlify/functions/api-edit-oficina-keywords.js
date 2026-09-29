import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { departamento, palabras } = await request.json();

    if (!departamento || !Array.isArray(palabras)) {
      return new Response(JSON.stringify({ success: false, message: "Faltan departamento o palabras" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("oficina");
    const keywords = (await store.get("keywords", { type: "json" })) || [];

    const palabrasLimpias = palabras
      .map((p) => String(p).trim().toLowerCase())
      .filter((p) => p.length > 0);

    const index = keywords.findIndex((k) => k.departamento === departamento);
    if (index === -1) {
      keywords.push({ departamento, palabras: palabrasLimpias });
    } else {
      keywords[index].palabras = palabrasLimpias;
    }

    await store.setJSON("keywords", keywords);

    return new Response(JSON.stringify({ success: true, keywords }), {
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
  path: "/api/edit-oficina-keywords"
};
