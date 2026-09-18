import { kv, key, isAuthorized, unauthorized, methodNotAllowed, withCors } from "./_lib/kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    await kv.set(key("heartbeat"), { timestamp: Date.now() });

    withCors(res);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
