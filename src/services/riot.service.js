import fetch from 'node-fetch';
import { getCachedData, setCachedData } from './cache.service.js';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

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
    kr: 'https://kr.api.riotgames.com'
  },
  match: {
    americas: 'https://americas.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  }
};

/**
 * Função auxiliar que recebe o nome do serviço e o código da região e retorna a URL base.
 * Para:
 * - riotAccount e match: região é transformada em cluster conforme:
 *     Cluster Americano: na1, br1, la1, la2, oc1
 *     Cluster Europeu: euw1, eun1, tr1, ru, me1
 *     Cluster Asiático: kr, jp1, sg2, tw2, vn2
 * - summoner: utiliza os códigos específicos (na1, br1, euw1 e kr). Caso não seja um desses,
 *   tenta agrupar conforme os clusters.
 */
const getBaseUrl = (service, regiao) => {
  const lowerRegiao = regiao.toLowerCase();
  if (service === 'riotAccount' || service === 'match') {
    if (['na1', 'br1', 'la1', 'la2', 'oc1'].includes(lowerRegiao)) {
      return endpoints[service].americas;
    }
    if (['euw1', 'eun1', 'tr1', 'ru', 'me1'].includes(lowerRegiao)) {
      return endpoints[service].europe;
    }
    if (['kr', 'jp1', 'sg2', 'tw2', 'vn2'].includes(lowerRegiao)) {
      return endpoints[service].asia;
    }
  } else if (service === 'summoner') {
    if (endpoints.summoner[lowerRegiao]) {
      return endpoints.summoner[lowerRegiao];
    }
    // fallback: agrupa conforme clusters
    if (['na1', 'br1', 'la1', 'la2', 'oc1'].includes(lowerRegiao)) {
      return endpoints.riotAccount.americas;
    }
    if (['euw1', 'eun1', 'tr1', 'ru', 'me1'].includes(lowerRegiao)) {
      return endpoints.riotAccount.europe;
    }
    if (['kr', 'jp1', 'sg2', 'tw2', 'vn2'].includes(lowerRegiao)) {
      return endpoints.riotAccount.asia;
    }
  }
  // Caso não se encaixe, retorna default (americas)
  return endpoints[service].americas;
};

/**
 * Nova função auxiliar que, a partir do puuid, chama a rota:
 * /riot/account/v1/region/by-game/lol/by-puuid/{puuid}
 * para identificar a região associada.
 */
export const getRegionByPuuid = async (puuid) => {
  // Utiliza o endpoint das contas (a partir de um cluster fixo – americas como padrão)
  const url = `${endpoints.riotAccount.americas}/riot/account/v1/region/by-game/lol/by-puuid/${puuid}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": RIOT_API_KEY } });
  if (!res.ok) {
    throw new Error("Erro ao identificar região pelo PUUID");
  }
  const data = await res.json();
  // Presume que o retorno contenha a propriedade "region"
  return data.region;
};


// Exemplo: getAccountByRiotId utiliza o endpoint de conta (riotAccount), que se baseia em clusters
export const getAccountByRiotId = async (nome, tag, regiao = 'na1') => {
  try {
    const baseURL = getBaseUrl('riotAccount', regiao);
    const res = await fetch(
      `${baseURL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(nome)}/${encodeURIComponent(tag)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Conta não encontrada");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar conta Riot:', error);
    throw new Error('Erro ao buscar conta Riot.');
  }
};

/**
 * Busca os dados da conta do jogador pelo PUUID para obter a tag.
 * Utiliza o endpoint de contas, baseado em clusters.
 */
const getAccountByPuuid = async (puuid, regiao = 'na1') => {
  try {
    // Se o puuid for fornecido, substitui o regiao pelo determinado pela rota de region
    const regionFromPuuid = await getRegionByPuuid(puuid);
    const baseURL = getBaseUrl('riotAccount', regionFromPuuid);
    const res = await fetch(
      `${baseURL}/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) {
      console.error(`Não foi possível buscar a conta para o puuid: ${puuid}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Erro em getAccountByPuuid:', error);
    return null;
  }
};

export const getChallenger = async (queue, regiao = 'br1') => {
  try {
    // Para buscar o challenger, usamos o endpoint de summoner com a região informada
    const baseURLSummoner = getBaseUrl('summoner', regiao);
    const res = await fetch(
      `${baseURLSummoner}/lol/league/v4/challengerleagues/by-queue/${queue}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) {
      console.error(`Riot API respondeu com status ${res.status}:`, await res.text());
      throw new Error("Erro ao buscar liga Challenger");
    }
    const data = await res.json();

    // Ordena os jogadores por pontos de liga e pega os top 3
    const sortedPlayers = data.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
    const top3Players = sortedPlayers.slice(0, 3);

    const detailedPlayers = await Promise.all(
      top3Players.map(async (player, index) => {
        let puuid = player.puuid || '';
        let name = '';
        let tag = '????';

        try {
          // Se o puuid estiver disponível, identifica automaticamente a região
          if (puuid) {
            const regionFromPuuid = await getRegionByPuuid(puuid);
            // Usa o endpoint por puuid para obter nome atualizado
            const baseURLSummonerDynamic = getBaseUrl('summoner', regionFromPuuid);
            const summonerByPuuidRes = await fetch(
              `${baseURLSummonerDynamic}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
              { headers: { "X-Riot-Token": RIOT_API_KEY } }
            );
            if (summonerByPuuidRes.ok) {
              const summonerByPuuidData = await summonerByPuuidRes.json();
              name = summonerByPuuidData.name;
            }
            // Busca a tag da conta utilizando o puuid e a região identificada
            const accountData = await getAccountByPuuid(puuid, regionFromPuuid);
            if (accountData && accountData.tagLine) {
              tag = accountData.tagLine;
            }
          }
        } catch (e) {
          console.error('Erro ao buscar dados complementares:', e);
        }
        return {
          position: index + 1,
          name,
          tag,
          leaguePoints: player.leaguePoints,
          puuid,
        };
      })
    );

    return detailedPlayers;
  } catch (error) {
    console.log('Erro ao buscar liga Challenger:', error);
    throw new Error('Erro ao buscar liga Challenger.');
  }
};

export const getChampionMastery = async (puuid, regiao = 'na1') => {
  try {
    // Determina a região a partir do puuid
    const regionFromPuuid = await getRegionByPuuid(puuid);
    const baseURL = getBaseUrl('summoner', regionFromPuuid);
    const res = await fetch(
      `${baseURL}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar maestria");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar maestria:', error);
    throw new Error('Erro ao buscar maestria.');
  }
};

// Função auxiliar para cache manual em serviços
const withCache = async (key, cacheType, fetchFunction) => {
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
    await setCachedData(key, result, cacheType);
    
    return result;
  } catch (error) {
    console.log(`Erro no cache do serviço para ${key}:`, error);
    // Se der erro no cache, executa a função normalmente
    return await fetchFunction();
  }
};

// Exemplo de uso em funções específicas
export const getChampionsDataCached = async () => {
  return await withCache(
    'champions:all',
    'champions',
    async () => {
      const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json`
      );
      if (!res.ok) throw new Error("Erro ao buscar campeões");
      return await res.json();
    }
  );
};

// Atualizar função existente para usar cache
export const getChampionsData = getChampionsDataCached;

export const getMatchIds = async (puuid, queue = 420, count = 30, regiao = 'na1') => {
  try {
    // Identifica a região automaticamente a partir do puuid
    const regionFromPuuid = await getRegionByPuuid(puuid);
    const baseURL = getBaseUrl('match', regionFromPuuid);
    const url = queue
      ? `${baseURL}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queue}&start=0&count=${count}`
      : `${baseURL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    const res = await fetch(url, { headers: { "X-Riot-Token": RIOT_API_KEY } });
    if (!res.ok) throw new Error("Erro ao buscar partidas");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar partidas:', error);
    throw new Error('Erro ao buscar partidas.');
  }
};

export const getMatchById = async (matchId, regiao = 'na1') => {
  try {
    // Para partidas, utiliza o valor fornecido ou padrão (não dependente do puuid)
    const baseURL = getBaseUrl('match', regiao);
    const res = await fetch(
      `${baseURL}/lol/match/v5/matches/${matchId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar partida");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar partida:', error);
    throw new Error('Erro ao buscar partida.');
  }
};

export const getSummonerByPuuid = async (puuid, regiao = 'na1') => {
  try {
    // Determina a região automaticamente a partir do puuid
    const regionFromPuuid = await getRegionByPuuid(puuid);
    const baseURL = getBaseUrl('summoner', regionFromPuuid);
    const res = await fetch(
      `${baseURL}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar invocador");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar invocador:', error);
    throw new Error('Erro ao buscar invocador.');
  }
};

/**
 * Busca as posições (ranked) do invocador pelo summonerId, utilizando o endpoint de summoner.
 * Aqui o parâmetro regiao deve ser um código de plataforma (ex.: "br1", "na1", "euw1", "kr")
 */
export const getRankedBySummonerId = async (puuid, regiao = 'br1') => {
  try {
    const baseURL = getBaseUrl('summoner', regiao);
    const res = await fetch(
      `${baseURL}/lol/league/v4/entries/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar ranked:', error);
    throw new Error('Erro ao buscar ranked.');
  }
};