import { getStore } from "@netlify/blobs";

const ONLINE_THRESHOLD_MS = 30000;

export default async () => {
  try {
    const store = getStore("enchufes");
    const heartbeat = await store.get("heartbeat", { type: "json" });
    const states = (await store.get("realStates", { type: "json" })) || { fan_one: "off", fan_two: "off" };

    const lastSeen = heartbeat ? heartbeat.timestamp : null;
    const online = lastSeen !== null && Date.now() - lastSeen < ONLINE_THRESHOLD_MS;

    return new Response(JSON.stringify({ online, lastSeen, states }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/status"
};
