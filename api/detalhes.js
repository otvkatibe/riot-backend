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
  const champion = searchParams.get("champion");

  if (!nome || !tag || !champion) {
    return new Response(JSON.stringify({ error: "Parâmetros obrigatórios faltando" }), {
      status: 400,
      headers,
    });
  }

  try {
    // 1. Obter PUUID
    const accountRes = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${nome}/${tag}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    
    if (!accountRes.ok) {
      const error = await accountRes.json();
      throw new Error(error.status?.message || "Erro ao buscar conta");
    }
    
    const { puuid } = await accountRes.json();

    // 2. Obter ID numérico do campeão
    const championsRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json`
    );
    const championsData = await championsRes.json();
    const championData = Object.values(championsData.data).find(c => c.id === champion);
    const championId = championData ? championData.key : null;

    if (!championId) {
      throw new Error("Campeão não encontrado");
    }

    // 3. Obter partidas recentes (máximo 30)
    const matchesRes = await fetch(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=30`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    
    if (!matchesRes.ok) {
      const error = await matchesRes.json();
      throw new Error(error.status?.message || "Erro ao buscar partidas");
    }
    
    const matchIds = await matchesRes.json();

    // 4. Processar todas as 20 partidas em paralelo
    const matchesData = await Promise.all(
      matchIds.map(async (id) => {
        try {
          const res = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${id}`, {
            headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
          });
          return res.ok ? res.json() : null;
        } catch (error) {
          return null;
        }
      })
    );

    const stats = {
      vitorias: 0,
      total: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalCS: 0,
      totalGameDuration: 0,
      matches: [],
    };

    for (const match of matchesData.filter(m => m !== null)) {
      const participant = match.info.participants.find(
        p => p.puuid === puuid && p.championId.toString() === championId
      );
      
      if (participant) {
        stats.total++;
        if (participant.win) stats.vitorias++;
        
        stats.totalKills += participant.kills;
        stats.totalDeaths += participant.deaths;
        stats.totalAssists += participant.assists;
        stats.totalCS += participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0);
        stats.totalGameDuration += match.info.gameDuration / 60;
        
        stats.matches.push({
          win: participant.win,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          totalCS: participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0),
          gameDuration: match.info.gameDuration,
          championId: participant.championId,
          lane: participant.lane,
          role: participant.role,
          championName: participant.championName
        });
      }
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar dados" }),
      { status: 500, headers }
    );
  }
}