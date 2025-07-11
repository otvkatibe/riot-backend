import * as riotService from '../services/riot.service.js';
import { saveQueryToCache, getFromCache } from '../services/analytics.service.js';
import fetch from 'node-fetch';
import QueryCache from '../models/QueryCache.js';

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
    const identificador = `${nome.toLowerCase()}#${tag.toLowerCase()}-${champion.toLowerCase()}`;
    
    // Verificar cache primeiro
    const cachedData = await getFromCache('champion-stats', identificador);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

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
      matches: []
    };

    for (const result of matchesResults) {
      if (result.status === 'fulfilled' && result.value) {
        const match = result.value;
        const participant = match.info.participants.find(p => p.puuid === puuid);
        
        if (participant && participant.championId.toString() === championId) {
          stats.total++;
          if (participant.win) stats.vitorias++;
          
          const { lane, role } = getLaneAndRole(participant);
          
          stats.matches.push({
            matchId: match.metadata.matchId,
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
    
    // Salvar no cache antes do return
    await saveQueryToCache('champion-stats', identificador, stats);
    
    return res.status(200).json({
      success: true,
      data: stats,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do campeão:', error.message);
    return res.status(500).json({ message: "Erro ao buscar estatísticas do campeão." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { nome, tag, puuid } = req.query;

    let finalPuuid = puuid;
    let identificador = puuid;
    
    // Se não foi fornecido puuid, busca pelos nome/tag (padrão moderno)
    if (!puuid && nome && tag) {
      const account = await riotService.getAccountByRiotId(nome, tag);
      finalPuuid = account.puuid;
      identificador = `${nome.toLowerCase()}#${tag.toLowerCase()}`;
    } else if (!puuid) {
      return res.status(400).json({ message: 'PUUID ou nome/tag são obrigatórios' });
    }

    // Verificar cache primeiro
    const cachedData = await getFromCache('profile', identificador);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    const summonerData = await riotService.getSummonerByPuuid(finalPuuid);
    const rankedData = await riotService.getRankedBySummonerId(summonerData.id);

    const ranks = processRankedData(rankedData);

    const responseData = {
      profileIconId: summonerData.profileIconId,
      summonerLevel: summonerData.summonerLevel,
      name: summonerData.name,
      ranks,
      puuid: finalPuuid,
      gameName: nome || summonerData.name,
      tagLine: tag || 'BR1'
    };

    // Salvar no cache
    await saveQueryToCache('profile', identificador, responseData);

    return res.status(200).json({
      success: true,
      data: responseData,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message);
    return res.status(500).json({ message: "Erro ao buscar perfil." });
  }
};

export const getPuuid = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const data = await riotService.getAccountByRiotId(nome, tag);
    
    return res.status(200).json({ 
      success: true,
      data: {
        puuid: data.puuid,
        gameName: data.gameName,
        tagLine: data.tagLine,
        deprecated: true,
        message: "Este endpoint será removido. Use /profile?nome=X&tag=Y diretamente."
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar PUUID:', error.message);
    return res.status(500).json({ message: "Erro ao buscar PUUID." });
  }
};

export const getMaestria = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const identificador = `${nome.toLowerCase()}#${tag.toLowerCase()}`;
    
    // Verificar cache primeiro
    const cachedData = await getFromCache('maestria', identificador);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    const account = await riotService.getAccountByRiotId(nome, tag);
    const puuid = account.puuid;

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

    const responseData = { dados: top10 };
    
    await saveQueryToCache('maestria', identificador, responseData);

    return res.status(200).json({
      success: true,
      data: responseData,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar maestria:', error.message);
    return res.status(500).json({ message: "Erro ao buscar dados de maestria." });
  }
};

export const getWinrate = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const identificador = `${nome.toLowerCase()}#${tag.toLowerCase()}`;
    
    // Verificar cache primeiro
    const cachedData = await getFromCache('winrate', identificador);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

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
    const responseData = { 
      winrate: `${winrate}%`, 
      vitorias, 
      derrotas: total - vitorias, 
      total 
    };

    // Salvar no cache
    await saveQueryToCache('winrate', identificador, responseData);

    return res.status(200).json({
      success: true,
      data: responseData,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar winrate:', error.message);
    return res.status(500).json({ message: "Erro ao buscar winrate." });
  }
};

export const getChallengerTop3 = async (req, res) => {
  try {
    const cacheKey = 'challenger-solo-duo';
    
    // Tentar buscar do cache primeiro (TTL de 1 hora)
    const cachedData = await getFromCache('challenger-top3', cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
        message: 'Dados retornados do cache (atualizado a cada hora)',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Buscando novo top 3 challenger da API da Riot...');
    const queue = 'RANKED_SOLO_5x5';
    const top3Players = await riotService.getChallenger(queue);

    // Salvar no cache com TTL de 1 hora
    await saveQueryToCache('challenger-top3', cacheKey, top3Players, null, 1);

    return res.status(200).json({
      success: true,
      data: top3Players,
      fromCache: false,
      message: 'Dados atualizados da API da Riot',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar top 3 Challenger:', error.message);
    
    // Em caso de erro, tentar retornar dados expirados do cache como fallback
    try {
      const expiredCache = await QueryCache.findOne({ 
        tipo: 'challenger-top3', 
        identificador: 'challenger-solo-duo' 
      }).sort({ updatedAt: -1 });
      
      if (expiredCache) {
        return res.status(200).json({
          success: true,
          data: expiredCache.dados,
          fromCache: true,
          message: 'Dados do cache (API temporariamente indisponível)',
          warning: 'Dados podem estar desatualizados',
          timestamp: new Date().toISOString()
        });
      }
    } catch (cacheError) {
      console.error('Erro ao buscar cache de fallback:', cacheError.message);
    }

    return res.status(500).json({ 
      message: "Erro ao buscar o top 3 Challenger e nenhum dado em cache disponível." 
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { nome, tag } = req.query;
    const identificador = `${nome.toLowerCase()}#${tag.toLowerCase()}-history`;
    
    // Verificar cache primeiro
    const cachedData = await getFromCache('history', identificador);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

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

    const responseData = { matches };
    
    // Salvar no cache
    await saveQueryToCache('history', identificador, responseData);

    return res.status(200).json({
      success: true,
      data: responseData,
      fromCache: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar histórico geral:', error.message);
    return res.status(500).json({ message: "Erro ao buscar histórico geral." });
  }
};

let championsCache = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

export const getChampionsList = async (req, res) => {
  try {
    const now = Date.now();
    if (!championsCache || now - lastFetch > CACHE_TTL) {
      const version = "14.12.1"; // Ou use process.env.DDRAGON_VERSION
      const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`;
      const response = await fetch(url);
      const data = await response.json();
      championsCache = Object.values(data.data);
      lastFetch = now;
    }
    res.json(championsCache);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar campeões." });
  }
};

export const getChampionDetail = async (req, res) => {
  try {
    const version = "14.12.1";
    const { id } = req.params;
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion/${id}.json`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.data[id]);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar detalhes do campeão." });
  }
};