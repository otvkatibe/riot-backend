// api/puuid.js
export const dynamic = "force-dynamic";

export async function GET(request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const { searchParams } = new URL(request.url);
  const nome = searchParams.get("nome");
  const tag = searchParams.get("tag");

  if (!nome || !tag) {
    return new Response(JSON.stringify({ error: "Nome e tag são obrigatórios" }), {
      status: 400,
      headers,
    });
  }

  try {
    const accountRes = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(nome)}/${encodeURIComponent(tag)}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );

    if (!accountRes.ok) {
      const error = await accountRes.json();
      return new Response(JSON.stringify({ error: error.status?.message || "Erro ao buscar conta" }), {
        status: accountRes.status,
        headers,
      });
    }

    const data = await accountRes.json();
    return new Response(JSON.stringify({ puuid: data.puuid }), { status: 200, headers });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro ao buscar PUUID" }), { status: 500, headers });
  }
}