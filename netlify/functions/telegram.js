const N8N_URL = 
"https://stockserver.tail78d0c3.ts.net/webhook/telegram";const 
N8N_URL = "http://100.86.121.107:5678/webhook-test/telegram";export 
default async (request) => {
  try {
    // Leer el body del mensaje de Telegram
    const body = await request.json();
    
    // URL de tu n8n (via Tailscale)
    const N8N_URL = "http://100.86.121.107:5678/webhook/telegram";
    
    // Reenviar a n8n
    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return new Response("Error", { status: 500 });
  }
};

export const config = {
  path: "/webhook"
};
