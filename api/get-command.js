import { kv, key, isAuthorized, unauthorized, withCors } from "./_lib/kv.js";

const COMMAND_TTL_MS = 2 * 60 * 1000;

function pruneQueue(queue) {
  const now = Date.now();
  return queue.filter((cmd) => now - cmd.createdAt < COMMAND_TTL_MS);
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const existingQueue = (await kv.get(key("queue"))) || [];
    const queue = pruneQueue(existingQueue);

    if (queue.length !== existingQueue.length) {
      await kv.set(key("queue"), queue);
    }

    const command = queue.length > 0 ? queue[0] : null;

    withCors(res);
    return res.status(200).json({ command });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
