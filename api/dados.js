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
  const tipo = searchParams.get("tipo");

  if (!nome || !tag || !tipo) {
    return new Response(JSON.stringify({ error: "Nome, tag e tipo são obrigatórios" }), {
      status: 400,
      headers,
    });
  }

  try {
    const accountRes = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(nome)}/${encodeURIComponent(tag)}`,
      { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
    );
    const account = await accountRes.json();
    const puuid = account.puuid;

    if (tipo === "maestria") {
      const [masteryRes, champsRes] = await Promise.all([
        fetch(`https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`, {
          headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
        }),
        fetch(`https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json`),
      ]);

      const masteryData = await masteryRes.json();
      const champions = (await champsRes.json()).data;

      const top10 = masteryData.slice(0, 10).map((m, i) => {
        const champ = Object.values(champions).find((c) => parseInt(c.key) === m.championId);
        return {
          posicao: i + 1,
          nome: champ?.name || `Campeão ${m.championId}`,
          championIcon: champ ? champ.id : m.championId,
          championPoints: m.championPoints,
        };
      });

      return new Response(JSON.stringify({ tipo: "maestria", dados: top10 }), {
        status: 200,
        headers,
      });
    } else if (tipo === "winrate") {
      const matchIdsRes = await fetch(
        `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=20`,
        { headers: { "X-Riot-Token": process.env.RIOT_API_KEY } }
      );
      const matchIds = await matchIdsRes.json();

      let vitorias = 0;
      let total = 0;

      const results = await Promise.allSettled(
        matchIds.map((id) =>
          fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${id}`, {
            headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
          })
        )
      );

      for (const r of results) {
        if (r.status === "fulfilled") {
          const match = await r.value.json();
          const participant = match.info.participants.find((p) => p.puuid === puuid);
          if (participant) {
            total++;
            if (participant.win) vitorias++;
          }
        }
      }

      const winrate = total > 0 ? ((vitorias / total) * 100).toFixed(2) : "0.00";

      return new Response(
        JSON.stringify({ tipo: "winrate", dados: `${winrate}% (${vitorias}V/${total - vitorias}D)` }),
        { status: 200, headers }
      );
    }

    return new Response(JSON.stringify({ error: "Tipo inválido" }), {
      status: 400,
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Erro ao buscar dados" }), {
      status: 500,
      headers,
    });
  }
}