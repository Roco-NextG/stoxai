import { getStore } from "@netlify/blobs";

const COMMAND_TTL_MS = 2 * 60 * 1000;

function pruneQueue(queue) {
  const now = Date.now();
  return queue.filter((cmd) => now - cmd.createdAt < COMMAND_TTL_MS);
}

export default async (request) => {
  if (request.headers.get("x-api-key") !== process.env.API_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const store = getStore("enchufes");
    const existingQueue = (await store.get("queue", { type: "json" })) || [];
    const queue = pruneQueue(existingQueue);

    if (queue.length !== existingQueue.length) {
      await store.setJSON("queue", queue);
    }

    const command = queue.length > 0 ? queue[0] : null;

    return new Response(JSON.stringify({ command }), {
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
  path: "/api/get-command"
};
