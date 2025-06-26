import * as riotService from '../services/riot.service.js';

// Função auxiliar para processar dados de ranqueadas de forma mais limpa
const processRankedData = (rankedData) => {
  const rankMap = {
    RANKED_SOLO_5x5: 'soloDuo',
    RANKED_FLEX_SR: 'flex',
  };
  const queueTypeName = {
    RANKED_SOLO_5x5: 'Ranqueada Solo/Duo',
    RANKED_FLEX_SR: 'Ranqueada Flexível',
  };

  return rankedData.reduce((acc, entry) => {
    const key = rankMap[entry.queueType];
    if (key) {
      acc[key] = {
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        queueType: queueTypeName[entry.queueType],
      };
    }
    return acc;
  }, { soloDuo: null, flex: null });
};

// Função auxiliar para corrigir a lane/role em partidas de desistência (remake)
const getLaneAndRole = (participant) => {
  // Prioriza o campo teamPosition, que é mais moderno e confiável
  if (participant.teamPosition) {
    switch (participant.teamPosition) {
      case 'TOP':
        return { lane: 'Top', role: 'Solo' };
      case 'JUNGLE':
        return { lane: 'Jungle', role: 'Jungle' };
      case 'MIDDLE':
        return { lane: 'Mid', role: 'Solo' };
      case 'BOTTOM':
        return { lane: 'Bottom', role: 'Carry' };
      case 'UTILITY':
        return { lane: 'Bottom', role: 'Support' };
      default:
        break; // Continua para o fallback se o valor for inesperado
    }
  }

  // Fallback para dados mais antigos ou se teamPosition não existir.
  // Trata o caso específico do bug de "NONE".
  if (participant.lane === 'NONE') {
    return { lane: 'Partida de desistência', role: '' };
  }

  // Fallback padrão para os dados originais, com capitalização para consistência
  const capitalize = (s) => (s && typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');
  return {
    lane: capitalize(participant.lane),
    role: capitalize(participant.role),
  };
};

export const getChampionStats = async (req, res) => {
  try {
    const { nome, tag, champion } = req.query;

    // Otimização: busca dados da conta e dos campeões em paralelo
    const [account, championsData] = await Promise.all([
      riotService.getAccountByRiotId(nome, tag),
      riotService.getChampionsData(),
    ]);

    const puuid = account.puuid;
    const championData = Object.values(championsData.data).find(c => c.id.toLowerCase() === champion.toLowerCase());
    if (!championData) return res.status(404).json({ message: "Campeão não encontrado." });
    
    const championId = championData.key;
    const matchIds = await riotService.getMatchIds(puuid, null, 30);

    // Usa Promise.allSettled para não falhar se uma partida não for encontrada
    const matchesResults = await Promise.allSettled(
      matchIds.map(id => riotService.getMatchById(id))
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

    for (const result of matchesResults) {
      if (result.status === 'fulfilled' && result.value) {
        const match = result.value;
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
          stats.totalGameDuration += match.info.gameDuration;
          
          const { lane, role } = getLaneAndRole(participant);

          stats.matches.push({
            win: participant.win,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            totalCS: participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0),
            gameDuration: match.info.gameDuration,
            championId: participant.championId,
            lane: lane,
            role: role,
            championName: participant.championName
          });
        }
      }
    }
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do campeão:', error.message);
    return res.status(500).json({ message: "Erro ao buscar estatísticas do campeão." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { puuid } = req.query;

    const summonerData = await riotService.getSummonerByPuuid(puuid);
    const rankedData = await riotService.getRankedBySummonerId(summonerData.id);

    const ranks = processRankedData(rankedData);

    const responseData = {
      profileIconId: summonerData.profileIconId,
      summonerLevel: summonerData.summonerLevel,
      name: summonerData.name,
      ranks,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message);
    return res.status(500).json({ message: "Erro ao buscar perfil." });
  }
};

export const getPuuid = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const data = await riotService.getAccountByRiotId(nome, tag);
    return res.status(200).json({ puuid: data.puuid });
  } catch (error) {
    console.error('Erro ao buscar PUUID:', error.message);
    return res.status(500).json({ message: "Erro ao buscar PUUID." });
  }
};

export const getMaestria = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const account = await riotService.getAccountByRiotId(nome, tag);
    const puuid = account.puuid;

    // Otimização: busca maestria e dados dos campeões em paralelo
    const [masteryData, championsData] = await Promise.all([
      riotService.getChampionMastery(puuid),
      riotService.getChampionsData()
    ]);

    const championsMap = new Map(Object.values(championsData.data).map(c => [c.key, c]));
    
    const top10 = masteryData.slice(0, 10).map((m, i) => {
      const champ = championsMap.get(m.championId.toString());
      return {
        posicao: i + 1,
        nome: champ?.name || `Campeão ${m.championId}`,
        championIcon: champ ? champ.id : m.championId,
        championPoints: m.championPoints,
      };
    });

    return res.status(200).json({ dados: top10 });
  } catch (error) {
    console.error('Erro ao buscar maestria:', error.message);
    return res.status(500).json({ message: "Erro ao buscar dados de maestria." });
  }
};

export const getWinrate = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const account = await riotService.getAccountByRiotId(nome, tag);
    const puuid = account.puuid;
    const matchIds = await riotService.getMatchIds(puuid, 420, 30);

    let vitorias = 0, total = 0;
    const results = await Promise.allSettled(
      matchIds.map((id) => riotService.getMatchById(id))
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const match = r.value;
        const participant = match.info.participants.find((p) => p.puuid === puuid);
        if (participant) {
          total++;
          if (participant.win) vitorias++;
        }
      }
    }

    const winrate = total > 0 ? ((vitorias / total) * 100).toFixed(2) : "0.00";
    return res.status(200).json({ winrate: `${winrate}%`, vitorias, derrotas: total - vitorias, total });
  } catch (error) {
    console.error('Erro ao buscar winrate:', error.message);
    return res.status(500).json({ message: "Erro ao buscar winrate." });
  }
};

export const getChallengerTop5 = async (req, res) => {
  try {
    const queue = 'RANKED_SOLO_5x5';
    // A função de serviço agora busca, ordena e formata o top 5
    const top5Players = await riotService.getChallengerLeague(queue);

    return res.status(200).json(top5Players);
  } catch (error) {
    console.error('Erro ao buscar top 5 Challenger:', error.message);
    return res.status(500).json({ message: "Erro ao buscar o top 5 Challenger." });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const account = await riotService.getAccountByRiotId(nome, tag);
    const puuid = account.puuid;
    // Busca os últimos 20 jogos (ajuste se quiser mais/menos)
    const matchIds = await riotService.getMatchIds(puuid, null, 20);

    // Busca detalhes das partidas
    const matchesResults = await Promise.allSettled(
      matchIds.map(id => riotService.getMatchById(id))
    );

    // Monta um resumo simples de cada partida
    const matches = [];
    for (const result of matchesResults) {
      if (result.status === 'fulfilled' && result.value) {
        const match = result.value;
        const participant = match.info.participants.find(p => p.puuid === puuid);
        if (participant) {
          matches.push({
            matchId: match.metadata.matchId,
            championName: participant.championName,
            win: participant.win,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            totalCS: participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0),
            gameDuration: match.info.gameDuration,
            lane: participant.lane,
            role: participant.role,
            date: match.info.gameStartTimestamp
          });
        }
      }
    }

    return res.status(200).json({ matches });
  } catch (error) {
    console.error('Erro ao buscar histórico geral:', error.message);
    return res.status(500).json({ message: "Erro ao buscar histórico geral." });
  }
};