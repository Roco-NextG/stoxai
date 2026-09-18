import { kv, key, isAuthorized, unauthorized, methodNotAllowed, withCors } from "./_lib/kv.js";

const VALID_STATES = new Set(["on", "off"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res);
  }

  if (!isAuthorized(req)) {
    return unauthorized(res);
  }

  try {
    const { states } = req.body || {};

    if (!states || typeof states !== "object" || Array.isArray(states)) {
      return res.status(400).json({ error: "Invalid states" });
    }

    for (const stateKey of Object.keys(states)) {
      if (!VALID_STATES.has(states[stateKey])) {
        return res.status(400).json({ error: `Invalid state value for ${stateKey}` });
      }
    }

    const realStates = (await kv.get(key("realStates"))) || {};
    Object.assign(realStates, states);
    await kv.set(key("realStates"), realStates);

    withCors(res);
    return res.status(200).json({ success: true, realStates });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
