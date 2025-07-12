import fetch from 'node-fetch';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Mapeamento clássico dos endpoints por cluster
const endpoints = {
  riotAccount: {
    americas: 'https://americas.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  },
  summoner: {
    // Endpoints para regiões diretamente mapeadas
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
 * Função auxiliar que recebe o nome do serviço e o código da região e retorna a URL base correta.
 * Agrupa os códigos de região conforme os clusters:
 *
 * - Cluster Americano: na1, br1, la1, la2, oc1
 * - Cluster Europeu: euw1, eun1, tr1, ru, me1
 * - Cluster Asiático: kr, jp1, sg2, tw2, vn2
 */
const getBaseUrl = (service, region) => {
  const lowerRegion = region.toLowerCase();
  
  if (service === 'riotAccount') {
    if (['na1', 'br1', 'la1', 'la2', 'oc1'].includes(lowerRegion)) {
      return endpoints.riotAccount.americas;
    }
    if (['euw1', 'eun1', 'tr1', 'ru', 'me1'].includes(lowerRegion)) {
      return endpoints.riotAccount.europe;
    }
    if (['kr', 'jp1', 'sg2', 'tw2', 'vn2'].includes(lowerRegion)) {
      return endpoints.riotAccount.asia;
    }
  } else if (service === 'summoner') {
    if (endpoints.summoner[lowerRegion]) {
      return endpoints.summoner[lowerRegion];
    }
    if (['na1', 'br1', 'la1', 'la2', 'oc1'].includes(lowerRegion)) {
      return endpoints.riotAccount.americas;
    }
    if (['euw1', 'eun1', 'tr1', 'ru', 'me1'].includes(lowerRegion)) {
      return endpoints.riotAccount.europe;
    }
    if (['kr', 'jp1', 'sg2', 'tw2', 'vn2'].includes(lowerRegion)) {
      return endpoints.riotAccount.asia;
    }
  } else if (service === 'match') {
    if (['na1', 'br1', 'la1', 'la2', 'oc1'].includes(lowerRegion)) {
      return endpoints.match.americas;
    }
    if (['euw1', 'eun1', 'tr1', 'ru', 'me1'].includes(lowerRegion)) {
      return endpoints.match.europe;
    }
    if (['kr', 'jp1', 'sg2', 'tw2', 'vn2'].includes(lowerRegion)) {
      return endpoints.match.asia;
    }
  }
  return endpoints[service].americas;
};

// Exemplo de função modificada: getAccountByRiotId
export const getAccountByRiotId = async (nome, tag, regiao = 'americas') => {
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
 * Busca os dados de um invocador pelo seu summonerId para obter o PUUID.
 */
const getSummonerBySummonerId = async (summonerId, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('summoner', regiao);
    const res = await fetch(
      `${baseURL}/lol/summoner/v4/summoners/${summonerId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) {
      console.error(`Não foi possível buscar o perfil para o summonerId: ${summonerId}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Erro em getSummonerBySummonerId:', error);
    return null;
  }
};

/**
 * Busca os dados da conta do jogador pelo PUUID para obter a tag.
 */
const getAccountByPuuid = async (puuid, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('riotAccount', regiao);
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

export const getChallenger = async (queue, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('summoner', regiao);
    const res = await fetch(
      `${baseURL}/lol/league/v4/challengerleagues/by-queue/${queue}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) {
      console.error(`Riot API respondeu com status ${res.status}:`, await res.text());
      throw new Error("Erro ao buscar liga Challenger");
    }
    const data = await res.json();

    const sortedPlayers = data.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
    const top3Players = sortedPlayers.slice(0, 3);

    const detailedPlayers = await Promise.all(
      top3Players.map(async (player, index) => {
        let profile = null;
        let account = null;
        try {
          profile = await getSummonerBySummonerId(player.summonerId, regiao);
          account = profile ? await getAccountByPuuid(profile.puuid, regiao) : null;
        } catch (error) {
          console.error(error);
        }
        return {
          position: index + 1,
          name: account?.gameName || player.summonerName,
          tag: account?.tagLine || '????',
          leaguePoints: player.leaguePoints,
          wins: player.wins,
          losses: player.losses,
          puuid: profile?.puuid || ''
        };
      })
    );

    const top3 = detailedPlayers.map(player => ({
      position: player.position,
      name: player.name,
      tag: player.tag,
      leaguePoints: player.leaguePoints,
      wins: player.wins,
      losses: player.losses,
      puuid: player.puuid,
    }));

    return top3;
  } catch (error) {
    console.log('Erro ao buscar liga Challenger:', error);
    throw new Error('Erro ao buscar liga Challenger.');
  }
};

export const getChampionMastery = async (puuid, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('summoner', regiao);
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

export const getChampionsData = async () => {
  try {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json`
    );
    if (!res.ok) throw new Error("Erro ao buscar campeões");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar dados dos campeões:', error);
    throw new Error('Erro ao buscar dados dos campeões.');
  }
};

export const getMatchIds = async (puuid, queue = 420, count = 30, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('match', regiao);
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

export const getMatchById = async (matchId, regiao = 'americas') => {
  try {
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

export const getSummonerByPuuid = async (puuid, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('riotAccount', regiao);
    const res = await fetch(
      `${baseURL}/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar invocador");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar invocador:', error);
    throw new Error('Erro ao buscar invocador.');
  }
};

export const getRankedBySummonerId = async (summonerId, regiao = 'americas') => {
  try {
    const baseURL = getBaseUrl('summoner', regiao);
    const res = await fetch(
      `${baseURL}/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar ranked:', error);
    throw new Error('Erro ao buscar ranked.');
  }
};