import { kv, key, isAuthorized, unauthorized, methodNotAllowed, withCors } from "./_lib/kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const { id } = req.body || {};
    const queue = (await kv.get(key("queue"))) || [];
    const index = queue.findIndex((cmd) => cmd.id === id);

    if (index === -1) {
      return res.status(200).json({ success: false, message: "Command not found" });
    }

    queue.splice(index, 1);
    await kv.set(key("queue"), queue);

    withCors(res);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
