import Redis from "ioredis";

const NAMESPACE = "enchufes";

let client;

function getClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3
    });
    client.on("error", (error) => {
      console.error("Redis connection error:", error.message);
    });
  }
  return client;
}

export const kv = {
  async get(k) {
    const raw = await getClient().get(k);
    return raw === null ? null : JSON.parse(raw);
  },
  async set(k, value) {
    await getClient().set(k, JSON.stringify(value));
    return "OK";
  }
};

export function key(name) {
  return `${NAMESPACE}:${name}`;
}

export function isAuthorized(req) {
  return req.headers["x-api-key"] === process.env.API_SECRET;
}

export function unauthorized(res) {
  return res.status(401).json({ error: "Unauthorized" });
}

export function methodNotAllowed(res) {
  return res.status(405).json({ error: "Method not allowed" });
}

export function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res;
}
