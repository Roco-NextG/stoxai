export default async (request) => {
  try {
    const url = new URL(request.url);
    const response = await fetch(
      "https://stockserver.tail78d0c3.ts.net/glab-api/api/kanban/tarjetas" + url.search,
      { method: "GET", headers: { "x-api-key": "GlabAPI2026SecureKey" } }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/kanban-tarjetas" };
