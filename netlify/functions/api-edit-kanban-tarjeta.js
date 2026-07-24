export default async (request) => {
  try {
    const { id, ...rest } = await request.json();
    const response = await fetch(
      `https://stockserver.tail78d0c3.ts.net/glab-api/api/kanban/tarjetas/${id}`,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rest) }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/edit-kanban-tarjeta" };
