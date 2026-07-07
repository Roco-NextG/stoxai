export default async (request) => {
  try {
    const body = await request.json();
    const response = await fetch(
      
"https://stockserver.tail78d0c3.ts.net/webhook/api_calibrar_equipo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 
error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/calibrar-equipo"
};
