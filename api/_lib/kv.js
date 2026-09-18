import { kv } from "@vercel/kv";

const NAMESPACE = "enchufes";

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

export { kv };
