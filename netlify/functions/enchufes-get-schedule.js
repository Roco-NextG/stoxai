import { getStore } from "@netlify/blobs";

const DEFAULT_SCHEDULE = { auto: false, shutoffTime: "18:00" };

export default async (request) => {
  if (request.headers.get("x-api-key") !== process.env.API_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const store = getStore("enchufes");
    const schedule = (await store.get("schedule", { type: "json" })) || DEFAULT_SCHEDULE;

    return new Response(JSON.stringify(schedule), {
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
  path: "/api/schedule"
};
