import { kv, key, isAuthorized, unauthorized, withCors } from "./_lib/kv.js";

const DEFAULT_SCHEDULE = { auto: false, shutoffTime: "18:00" };

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const schedule = (await kv.get(key("schedule"))) || DEFAULT_SCHEDULE;

    withCors(res);
    return res.status(200).json(schedule);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
