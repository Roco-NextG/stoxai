import { getStore } from "@netlify/blobs";

const VALID_PLUGS = new Set(["fan_one", "fan_two", "all"]);
const VALID_STATES = new Set(["on", "off"]);
const COMMAND_TTL_MS = 2 * 60 * 1000;

function pruneQueue(queue) {
  const now = Date.now();
  return queue.filter((cmd) => now - cmd.createdAt < COMMAND_TTL_MS);
}

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
    const { plug, state } = await request.json();

    if (!VALID_PLUGS.has(plug) || !VALID_STATES.has(state)) {
      return new Response(JSON.stringify({ error: "Invalid plug or state" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const command = {
      id: crypto.randomUUID(),
      plug,
      state,
      createdAt: Date.now()
    };

    const store = getStore("enchufes");
    const existingQueue = (await store.get("queue", { type: "json" })) || [];
    const queue = pruneQueue(existingQueue);
    queue.push(command);
    await store.setJSON("queue", queue);

    return new Response(JSON.stringify({ success: true, command }), {
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
  path: "/api/set-command"
};
