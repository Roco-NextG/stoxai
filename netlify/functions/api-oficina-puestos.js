import { getStore } from "@netlify/blobs";

const SEED_PUESTOS = {};

export default async (request) => {
  try {
    const store = getStore("oficina");
    let puestos = await store.get("puestos", { type: "json" });

    if (!puestos) {
      puestos = SEED_PUESTOS;
      await store.setJSON("puestos", puestos);
    }

    return new Response(JSON.stringify({ puestos }), {
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
  path: "/api/oficina-puestos"
};
