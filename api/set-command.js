import { kv, key, isAuthorized, unauthorized, methodNotAllowed, withCors } from "./_lib/kv.js";

const VALID_PLUGS = new Set(["fan_one", "fan_two", "all"]);
const VALID_STATES = new Set(["on", "off"]);
const COMMAND_TTL_MS = 2 * 60 * 1000;

function pruneQueue(queue) {
  const now = Date.now();
  return queue.filter((cmd) => now - cmd.createdAt < COMMAND_TTL_MS);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const { plug, state } = req.body || {};

    if (!VALID_PLUGS.has(plug) || !VALID_STATES.has(state)) {
      return res.status(400).json({ error: "Invalid plug or state" });
    }

    const command = {
      id: crypto.randomUUID(),
      plug,
      state,
      createdAt: Date.now()
    };

    const existingQueue = (await kv.get(key("queue"))) || [];
    const queue = pruneQueue(existingQueue);
    queue.push(command);
    await kv.set(key("queue"), queue);

    withCors(res);
    return res.status(200).json({ success: true, command });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
