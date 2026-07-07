export default async (request) => {
  try {
    const url = new URL(request.url);
    const response = await fetch(
      "https://stockserver.tail78d0c3.ts.net/webhook/api_setup_software" + 
url.search,
      { method: "GET" }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", 
"Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/setup-software" };
