// Puente temporal: reenvia al deploy de produccion vigente (6a75c5d2...) que
// aun contiene el codigo real de Fans, recuperado solo en el frontend.
// Sustituir por la funcion original en cuanto se recupere su codigo fuente.
const UPSTREAM = "https://6a75c5d20e8c8ee638de926b--stox-ai-system.netlify.app/api/ack-command";

export default async (request) => {
  try {
    const headers = {};
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) headers["X-API-KEY"] = apiKey;

    const init = { method: request.method, headers };
    if (request.method !== "GET" && request.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = await request.text();
    }

    const response = await fetch(UPSTREAM, init);
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/ack-command"
};
