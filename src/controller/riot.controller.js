import * as riotService from '../services/riot.service.js';

export const getMaestriaOuWinrate = async (req, res) => {
  try {
    const { nome, tag, tipo } = req.query;
    if (!nome || !tag || !tipo) {
      return res.status(400).json({ message: 'Nome, tag e tipo são obrigatórios.' });
    }

    const account = await riotService.getAccountByRiotId(nome, tag);
    const puuid = account.puuid;

    if (tipo === "maestria") {
      const [masteryData, championsData] = await Promise.all([
        riotService.getChampionMastery(puuid),
        riotService.getChampionsData()
      ]);
      const champions = championsData.data;
      const top10 = masteryData.slice(0, 10).map((m, i) => {
        const champ = Object.values(champions).find((c) => parseInt(c.key) === m.championId);
        return {
          posicao: i + 1,
          nome: champ?.name || `Campeão ${m.championId}`,
          championIcon: champ ? champ.id : m.championId,
          championPoints: m.championPoints,
        };
      });
      console.log("Top 10 maestria:", top10);
      return res.status(200).json({ tipo: "maestria", dados: top10 });
    }

    if (tipo === "winrate") {
      const matchIds = await riotService.getMatchIds(puuid, 420, 30);
      let vitorias = 0, total = 0;
      const results = await Promise.allSettled(
        matchIds.map((id) => riotService.getMatchById(id))
      );
      for (const r of results) {
        if (r.status === "fulfilled") {
          const match = r.value;
          const participant = match.info.participants.find((p) => p.puuid === puuid);
          if (participant) {
            total++;
            if (participant.win) vitorias++;
          }
        }
      }
      const winrate = total > 0 ? ((vitorias / total) * 100).toFixed(2) : "0.00";
      console.log("Winrate:", winrate);
      return res.status(200).json({ tipo: "winrate", dados: `${winrate}% (${vitorias}V/${total - vitorias}D)` });
    }

    return res.status(400).json({ message: "Tipo inválido." });
  } catch (error) {
    console.log('Erro ao buscar maestria ou winrate:', error.message);
    return res.status(500).json({ message: "Erro ao buscar dados." });
  }
};

export const getChampionStats = async (req, res) => {
  try {
    const { nome, tag, champion } = req.query;
    if (!nome || !tag || !champion) {
      return res.status(400).json({ message: 'Nome, tag e champion são obrigatórios.' });
    }

    const account = await riotService.getAccountByRiotId(nome, tag);
    const puuid = account.puuid;
    const championsData = await riotService.getChampionsData();
    const championData = Object.values(championsData.data).find(c => c.id === champion);
    const championId = championData ? championData.key : null;
    if (!championId) return res.status(400).json({ message: "Campeão não encontrado." });

    const matchIds = await riotService.getMatchIds(puuid, null, 30);
    const matchesData = await Promise.all(
      matchIds.map(async (id) => {
        try {
          return await riotService.getMatchById(id);
        } catch {
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
    console.log("Stats champion:", stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.log('Erro ao buscar estatísticas do campeão:', error.message);
    return res.status(500).json({ message: error.message || "Erro ao processar dados." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { puuid } = req.query;
    if (!puuid) {
      return res.status(400).json({ message: 'PUUID é obrigatório.' });
    }

    const summonerData = await riotService.getSummonerByPuuid(puuid);
    let rankedData = [];
    try {
      rankedData = await riotService.getRankedBySummonerId(summonerData.id);
    } catch (e) {
      console.log("Erro ao buscar dados de ranked:", e.message);
    }
    const soloDuoRank = rankedData?.find(entry => entry.queueType === "RANKED_SOLO_5x5");
    const flexRank = rankedData?.find(entry => entry.queueType === "RANKED_FLEX_SR");
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
    console.log("Perfil:", responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.log('Erro ao buscar perfil:', error.message);
    return res.status(500).json({ message: "Erro ao buscar perfil." });
  }
};

export const getPuuid = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    if (!nome || !tag) {
      return res.status(400).json({ message: 'Nome e tag são obrigatórios.' });
    }
    const data = await riotService.getAccountByRiotId(nome, tag);
    console.log("PUUID:", data.puuid);
    return res.status(200).json({ puuid: data.puuid });
  } catch (error) {
    console.log('Erro ao buscar PUUID:', error.message);
    return res.status(500).json({ message: "Erro ao buscar PUUID." });
  }
};