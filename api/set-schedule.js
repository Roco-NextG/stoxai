import { kv, key, isAuthorized, unauthorized, methodNotAllowed, withCors } from "./_lib/kv.js";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const { auto, shutoffTime } = req.body || {};

    if (typeof auto !== "boolean") {
      return res.status(400).json({ error: "Invalid auto" });
    }

    if (typeof shutoffTime !== "string" || !TIME_RE.test(shutoffTime)) {
      return res.status(400).json({ error: "Invalid shutoffTime, expected HH:MM" });
    }

    const schedule = { auto, shutoffTime };
    await kv.set(key("schedule"), schedule);

    withCors(res);
    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
