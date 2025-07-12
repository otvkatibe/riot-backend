import fetch from 'node-fetch';

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

/**
 * Busca os dados da conta do jogador pelo PUUID para obter a tag.
 * Utiliza o endpoint de contas, baseado em clusters.
 */
const getAccountByPuuid = async (puuid, regiao = 'na1') => {
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

export const getChallenger = async (queue, regiao = 'br1') => {
  try {
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

    // Para cada jogador, usamos o puuid diretamente e buscamos dados adicionais pela rota by-puuid
    const detailedPlayers = await Promise.all(
      top3Players.map(async (player, index) => {
        let puuid = player.puuid || ''; // usa o puuid direto do objeto, se disponível
        let name = '';
        let tag = '????';

        try {
          if (puuid) {
            const summonerByPuuidRes = await fetch(
              `${baseURLSummoner}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
              { headers: { "X-Riot-Token": RIOT_API_KEY } }
            );
            if (summonerByPuuidRes.ok) {
              const summonerByPuuidData = await summonerByPuuidRes.json();
              name = summonerByPuuidData.name;
            }
            // Busca a tag da conta utilizando o puuid
            const accountData = await getAccountByPuuid(puuid, regiao);
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

export const getChampionMastery = async (puuid, regiao = 'br1') => {
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

export const getMatchIds = async (puuid, queue = 420, count = 30, regiao = 'na1') => {
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

export const getMatchById = async (matchId, regiao = 'na1') => {
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

export const getSummonerByPuuid = async (puuid, regiao = 'na1') => {
  try {
    // Para buscar invocador por PUUID, utilizamos o endpoint de conta (riotAccount)
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

/**
 * Busca as posições (ranked) do invocador pelo summonerId, utilizando o endpoint de summoner.
 * Aqui o parâmetro regiao deve ser um código de plataforma (ex.: "br1", "na1", "euw1", "kr")
 */
export const getRankedBySummonerId = async (summonerId, regiao = 'br1') => {
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