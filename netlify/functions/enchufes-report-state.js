import { getStore } from "@netlify/blobs";

const VALID_STATES = new Set(["on", "off"]);

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.headers.get("x-api-key") !== process.env.API_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { states } = await request.json();

    if (!states || typeof states !== "object" || Array.isArray(states)) {
      return new Response(JSON.stringify({ error: "Invalid states" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    for (const key of Object.keys(states)) {
      if (!VALID_STATES.has(states[key])) {
        return new Response(JSON.stringify({ error: `Invalid state value for ${key}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const store = getStore("enchufes");
    const realStates = (await store.get("realStates", { type: "json" })) || {};
    Object.assign(realStates, states);
    await store.setJSON("realStates", realStates);

    return new Response(JSON.stringify({ success: true, realStates }), {
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
  path: "/api/report-state"
};
