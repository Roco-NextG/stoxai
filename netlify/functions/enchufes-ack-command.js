import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.headers.get("x-api-key") !== process.env.API_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { id } = await request.json();
    const store = getStore("enchufes");
    const queue = (await store.get("queue", { type: "json" })) || [];
    const index = queue.findIndex((cmd) => cmd.id === id);

    if (index === -1) {
      return new Response(JSON.stringify({ success: false, message: "Command not found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    queue.splice(index, 1);
    await store.setJSON("queue", queue);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
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
