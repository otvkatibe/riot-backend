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
  const puuid = searchParams.get("puuid");

  if (!puuid) {
    return new Response(JSON.stringify({ error: "PUUID é obrigatório" }), {
      status: 400,
      headers,
    });
  }

  try {
    // 1. Busca informações básicas do invocador
    const summonerRes = await fetch(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );

    if (!summonerRes.ok) {
      const error = await summonerRes.json();
      throw new Error(error.status?.message || "Erro ao buscar invocador");
    }

    const summonerData = await summonerRes.json();

    // 2. Busca informações de ranked
    let rankedData = null;
    try {
      const rankedRes = await fetch(
        `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`,
        { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
      );

      if (rankedRes.ok) {
        rankedData = await rankedRes.json();
      }
    } catch (e) {
      console.log("Erro ao buscar dados de ranked:", e.message);
    }

    // 3. Processa os ranks
    const soloDuoRank = rankedData?.find(entry => 
      entry.queueType === "RANKED_SOLO_5x5"
    );
    
    const flexRank = rankedData?.find(entry => 
      entry.queueType === "RANKED_FLEX_SR"
    );

    // 4. Formata resposta
    const responseData = {
      profileIconId: summonerData.profileIconId,
      summonerLevel: summonerData.summonerLevel,
      name: summonerData.name,
      ranks: {
        soloDuo: soloDuoRank ? {
          tier: soloDuoRank.tier,
          rank: soloDuoRank.rank,
          leaguePoints: soloDuoRank.leaguePoints,
          wins: soloDuoRank.wins,
          losses: soloDuoRank.losses,
          queueType: "Ranqueada Solo/Duo"
        } : null,
        
        flex: flexRank ? {
          tier: flexRank.tier,
          rank: flexRank.rank,
          leaguePoints: flexRank.leaguePoints,
          wins: flexRank.wins,
          losses: flexRank.losses,
          queueType: "Ranqueada Flexível"
        } : null
      }
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers,
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Erro ao buscar perfil" }), {
      status: 500,
      headers,
    });
  }
}