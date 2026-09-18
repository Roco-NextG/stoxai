import { kv, key, withCors } from "./_lib/kv.js";

const ONLINE_THRESHOLD_MS = 30000;

export default async function handler(req, res) {
  try {
    const heartbeat = await kv.get(key("heartbeat"));
    const states = (await kv.get(key("realStates"))) || { fan_one: "off", fan_two: "off" };

    const lastSeen = heartbeat ? heartbeat.timestamp : null;
    const online = lastSeen !== null && Date.now() - lastSeen < ONLINE_THRESHOLD_MS;

    withCors(res);
    return res.status(200).json({ online, lastSeen, states });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
