import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { id, nombre, puesto, departamento } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: "Falta el id del puesto" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore("oficina");
    const puestos = (await store.get("puestos", { type: "json" })) || {};

    const nombreLimpio = (nombre || "").trim();
    if (!nombreLimpio) {
      delete puestos[id];
    } else {
      puestos[id] = {
        nombre: nombreLimpio,
        puesto: (puesto || "").trim(),
        departamento: (departamento || "").trim()
      };
    }

    await store.setJSON("puestos", puestos);

    return new Response(JSON.stringify({ success: true, puesto: puestos[id] || null }), {
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
  path: "/api/edit-oficina-puesto"
};
