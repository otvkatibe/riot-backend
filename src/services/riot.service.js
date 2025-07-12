import fetch from 'node-fetch';
import { getCachedData, setCachedData } from './cache.service.js';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const DDRAGON_VERSION = process.env.DDRAGON_VERSION || '14.12.1';
const REQUEST_TIMEOUT = 15000; // 15 segundos

// Mapeamento dos endpoints por serviço e região/cluster
const endpoints = {
  riotAccount: {
    americas: 'https://americas.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  },
  summoner: {
    na1: 'https://na1.api.riotgames.com',
    br1: 'https://br1.api.riotgames.com',
    euw1: 'https://euw1.api.riotgames.com',
    kr: 'https://kr.api.riotgames.com',
    eun1: 'https://eun1.api.riotgames.com',
    jp1: 'https://jp1.api.riotgames.com',
    oc1: 'https://oc1.api.riotgames.com',
    tr1: 'https://tr1.api.riotgames.com',
    ru: 'https://ru.api.riotgames.com'
  },
  match: {
    americas: 'https://americas.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  }
};

/**
 * Mapeia uma região específica para o cluster correto da API Account
 * @param {string} region - Região específica (ex: br1, na1, euw1)
 * @returns {string} - Cluster da API Account (americas, europe, asia)
 */
const getAccountCluster = (region) => {
  const clusterMap = {
    br1: 'americas',
    la1: 'americas',
    la2: 'americas',
    na1: 'americas',
    euw1: 'europe',
    eun1: 'europe',
    tr1: 'europe',
    ru: 'europe',
    kr: 'asia',
    jp1: 'asia',
    oc1: 'asia'
  };
  return clusterMap[region] || 'americas';
};

/**
 * Retorna a URL base para um serviço específico
 * @param {string} service - Tipo de serviço (riotAccount, summoner, match)
 * @param {string} region - Região ou cluster
 * @returns {string} - URL base
 */
const getBaseUrl = (service, region) => {
  if (!endpoints[service]) {
    throw new Error(`Serviço '${service}' não suportado`);
  }
  
  const url = endpoints[service][region];
  if (!url) {
    throw new Error(`Região '${region}' não suportada para o serviço '${service}'`);
  }
  
  return url;
};

/**
 * Executa uma requisição HTTP com timeout e tratamento de erros
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} - Resposta da API
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "X-Riot-Token": RIOT_API_KEY,
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout da requisição');
    }
    throw error;
  }
};

/**
 * Busca uma conta Riot por nome e tag
 * @param {string} gameName - Nome do jogador
 * @param {string} tagLine - Tag do jogador
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Object>} - Dados da conta
 */
export const getAccountByRiotId = async (gameName, tagLine, region = 'br1') => {
  try {
    if (!gameName || !tagLine) {
      throw new Error('Nome e tag são obrigatórios');
    }
    
    const cluster = getAccountCluster(region);
    const baseURL = getBaseUrl('riotAccount', cluster);
    const url = `${baseURL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    
    console.log(`🔍 Buscando conta: ${gameName}#${tagLine} na região ${region}`);
    
    const data = await fetchWithTimeout(url);
    return data;
  } catch (error) {
    console.error('Erro ao buscar conta Riot:', error.message);
    throw new Error('Erro ao buscar conta Riot.');
  }
};

/**
 * Busca dados do invocador por PUUID
 * @param {string} puuid - PUUID do jogador
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Object>} - Dados do invocador
 */
export const getSummonerByPuuid = async (puuid, region = 'br1') => {
  try {
    if (!puuid) {
      throw new Error('PUUID é obrigatório');
    }
    
    const baseURL = getBaseUrl('summoner', region);
    const url = `${baseURL}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    
    console.log(`🔍 Buscando invocador por PUUID na região ${region}`);
    
    const data = await fetchWithTimeout(url);
    return data;
  } catch (error) {
    console.error('Erro ao buscar invocador:', error.message);
    throw new Error('Erro ao buscar invocador.');
  }
};

/**
 * Busca dados ranqueados do invocador
 * @param {string} summonerId - ID do invocador
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Array>} - Dados ranqueados
 */
export const getRankedBySummonerId = async (summonerId, region = 'br1') => {
  try {
    if (!summonerId) {
      throw new Error('ID do invocador é obrigatório');
    }
    
    const baseURL = getBaseUrl('summoner', region);
    const url = `${baseURL}/lol/league/v4/entries/by-summoner/${summonerId}`;
    
    console.log(`🏆 Buscando dados ranqueados na região ${region}`);
    
    const data = await fetchWithTimeout(url);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar ranked:', error.message);
    throw new Error('Erro ao buscar ranked.');
  }
};

/**
 * Busca maestria de campeões do jogador
 * @param {string} puuid - PUUID do jogador
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Array>} - Lista de maestrias
 */
export const getChampionMastery = async (puuid, region = 'br1') => {
  try {
    if (!puuid) {
      throw new Error('PUUID é obrigatório');
    }
    
    const baseURL = getBaseUrl('summoner', region);
    const url = `${baseURL}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
    
    console.log(`🎯 Buscando maestria de campeões na região ${region}`);
    
    const data = await fetchWithTimeout(url);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar maestria:', error.message);
    throw new Error('Erro ao buscar maestria.');
  }
};

/**
 * Busca dados dos campeões do Data Dragon
 * @param {string} version - Versão do Data Dragon
 * @param {string} locale - Localização (padrão: pt_BR)
 * @returns {Promise<Object>} - Dados dos campeões
 */
export const getChampionsData = async (version = DDRAGON_VERSION, locale = 'pt_BR') => {
  try {
    const cacheKey = `champions_${version}_${locale}`;
    
    // Tenta buscar do cache primeiro
    const cached = await getCachedData(cacheKey, 'champions');
    if (cached) {
      console.log('🎯 Champions data cache HIT');
      return cached;
    }
    
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/champion.json`;
    
    console.log(`📊 Buscando dados dos campeões (versão: ${version})`);
    
    const response = await fetch(url, { timeout: REQUEST_TIMEOUT });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Salva no cache por 24 horas
    await setCachedData(cacheKey, 'champions', data, 1440);
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados dos campeões:', error.message);
    throw new Error('Erro ao buscar dados dos campeões.');
  }
};

/**
 * Busca IDs das partidas do jogador
 * @param {string} puuid - PUUID do jogador
 * @param {number} queue - Tipo de fila (opcional)
 * @param {number} count - Número de partidas (padrão: 20)
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Array>} - Lista de IDs das partidas
 */
export const getMatchIds = async (puuid, queue = null, count = 20, region = 'br1') => {
  try {
    if (!puuid) {
      throw new Error('PUUID é obrigatório');
    }
    
    const cluster = getAccountCluster(region);
    const baseURL = getBaseUrl('match', cluster);
    
    let url = `${baseURL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    if (queue) {
      url += `&queue=${queue}`;
    }
    
    console.log(`🎮 Buscando IDs de partidas (count: ${count}, queue: ${queue || 'todas'})`);
    
    const data = await fetchWithTimeout(url);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar partidas:', error.message);
    throw new Error('Erro ao buscar partidas.');
  }
};

/**
 * Busca detalhes de uma partida específica
 * @param {string} matchId - ID da partida
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Object>} - Detalhes da partida
 */
export const getMatchById = async (matchId, region = 'br1') => {
  try {
    if (!matchId) {
      throw new Error('ID da partida é obrigatório');
    }
    
    const cluster = getAccountCluster(region);
    const baseURL = getBaseUrl('match', cluster);
    const url = `${baseURL}/lol/match/v5/matches/${matchId}`;
    
    console.log(`🔍 Buscando detalhes da partida: ${matchId}`);
    
    const data = await fetchWithTimeout(url);
    return data;
  } catch (error) {
    console.error('Erro ao buscar partida:', error.message);
    throw new Error('Erro ao buscar partida.');
  }
};

/**
 * Busca região baseada no PUUID (para identificação automática)
 * @param {string} puuid - PUUID do jogador
 * @returns {string} - Região identificada
 */
export const getRegionByPuuid = async (puuid) => {
  // Lista de regiões para tentar
  const regions = ['br1', 'na1', 'euw1', 'kr', 'eun1', 'jp1'];
  
  for (const region of regions) {
    try {
      await getSummonerByPuuid(puuid, region);
      return region;
    } catch (error) {
      continue;
    }
  }
  
  // Se não encontrar, retorna br1 como padrão
  return 'br1';
};

/**
 * Busca dados da liga Challenger
 * @param {string} queue - Tipo de fila (ex: RANKED_SOLO_5x5)
 * @param {string} region - Região (padrão: br1)
 * @returns {Promise<Array>} - Top 3 jogadores formatados
 */
export const getChallenger = async (queue, region = 'br1') => {
  try {
    const baseURL = getBaseUrl('summoner', region);
    const url = `${baseURL}/lol/league/v4/challengerleagues/by-queue/${queue}`;
    
    console.log(`🏆 Buscando liga Challenger (queue: ${queue}, região: ${region})`);
    
    const data = await fetchWithTimeout(url);
    
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Dados da liga Challenger inválidos');
    }
    
    // Ordena por pontos de liga e pega os top 3
    const sortedPlayers = data.entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, 3);
    
    // Busca detalhes dos jogadores em paralelo
    const detailedPlayers = await Promise.allSettled(
      sortedPlayers.map(async (player, index) => {
        let puuid = player.puuid || '';
        let name = '';
        let tag = '????';
        
        try {
          if (puuid) {
            const regionFromPuuid = await getRegionByPuuid(puuid);
            const summonerData = await getSummonerByPuuid(puuid, regionFromPuuid);
            name = summonerData.name;
          }
          
          // Se não conseguir pelo PUUID, usa o summonerId
          if (!name && player.summonerId) {
            const summonerData = await getSummonerByPuuid(player.summonerId, region);
            name = summonerData.name;
          }
          
          if (!name) {
            name = player.summonerName || `Jogador ${index + 1}`;
          }
        } catch (error) {
          console.warn(`Erro ao buscar detalhes do jogador ${index + 1}:`, error.message);
          name = player.summonerName || `Jogador ${index + 1}`;
        }
        
        return {
          position: index + 1,
          name,
          tag,
          leaguePoints: player.leaguePoints,
          wins: player.wins,
          losses: player.losses,
          puuid
        };
      })
    );
    
    // Retorna apenas os resultados bem-sucedidos
    return detailedPlayers
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
      
  } catch (error) {
    console.error('Erro ao buscar Challenger:', error.message);
    throw new Error('Erro ao buscar liga Challenger.');
  }
};

/**
 * Função auxiliar para cache manual em serviços
 * @param {string} key - Chave do cache
 * @param {string} cacheType - Tipo do cache
 * @param {Function} fetchFunction - Função para buscar dados
 * @param {number} ttl - Time to live em minutos (padrão: 15)
 * @returns {Promise<any>} - Dados cached ou buscados
 */
export const withCache = async (key, cacheType, fetchFunction, ttl = 15) => {
  try {
    // Tenta buscar no cache primeiro
    const cached = await getCachedData(key, cacheType);
    if (cached) {
      console.log(`🎯 Service Cache HIT: ${key}`);
      return cached;
    }
    
    console.log(`❌ Service Cache MISS: ${key}`);
    
    // Executa a função e salva no cache
    const result = await fetchFunction();
    await setCachedData(key, cacheType, result, ttl);
    
    return result;
  } catch (error) {
    console.error(`Erro no cache service para ${key}:`, error.message);
    throw error;
  }
};