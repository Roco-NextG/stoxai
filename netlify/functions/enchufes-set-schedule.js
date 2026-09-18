import { getStore } from "@netlify/blobs";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

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
    const { auto, shutoffTime } = await request.json();

    if (typeof auto !== "boolean") {
      return new Response(JSON.stringify({ error: "Invalid auto" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (typeof shutoffTime !== "string" || !TIME_RE.test(shutoffTime)) {
      return new Response(JSON.stringify({ error: "Invalid shutoffTime, expected HH:MM" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const schedule = { auto, shutoffTime };
    const store = getStore("enchufes");
    await store.setJSON("schedule", schedule);

    return new Response(JSON.stringify({ success: true, schedule }), {
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
  path: "/api/set-schedule"
};
