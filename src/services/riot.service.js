import fetch from 'node-fetch';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export const getAccountByRiotId = async (nome, tag) => {
  try {
    const res = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(nome)}/${encodeURIComponent(tag)}`,
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
 * @param {string} summonerId - O ID do invocador.
 * @returns {Promise<object|null>} O perfil do invocador ou null se falhar.
 */
const getSummonerBySummonerId = async (summonerId) => {
  try {
    const res = await fetch(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`,
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
 * Busca os dados da conta de um jogador pelo seu PUUID para obter a tag.
 * @param {string} puuid - O PUUID do jogador.
 * @returns {Promise<object|null>} Os dados da conta ou null se falhar.
 */
const getAccountByPuuid = async (puuid) => {
  try {
    const res = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
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

export const getChallenger = async (queue) => {
  try {
    const res = await fetch(
      `https://br1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) {
      console.error(`Riot API respondeu com status ${res.status}:`, await res.text());
      throw new Error("Erro ao buscar liga Challenger");
    }
    const data = await res.json();

    // Ordena os jogadores por pontos de liga e pega o top 3
    const sortedPlayers = data.entries.sort((a, b) => b.leaguePoints - a.leaguePoints);
    const top3Players = sortedPlayers.slice(0, 3);

    // Busca os detalhes de cada jogador do top 3
    const detailedPlayers = await Promise.all(
      top3Players.map(async (player, index) => {
        let profile = null;
        let account = null;
        try {
          profile = await getSummonerBySummonerId(player.summonerId);
          account = profile ? await getAccountByPuuid(profile.puuid) : null;
        } catch (e) {
          // Se der erro, ignora e usa os dados do player
        }

        return {
          position: index + 1,
          // Sempre retorna o nome do player, mesmo se falhar a busca do perfil
          name: account?.gameName || player.summonerName,
          tag: account?.tagLine || '????',
          leaguePoints: player.leaguePoints,
          wins: player.wins,
          losses: player.losses,
          puuid: profile?.puuid || '',
        };
      })
    );

    const top3 = detailedPlayers.slice(0, 3).map(player => ({
      name: player.summonerName,
      pdl: player.leaguePoints,
      
    }));

    return top3;
  } catch (error) {
    console.log('Erro ao buscar liga Challenger:', error);
    throw new Error('Erro ao buscar liga Challenger.');
  }
};

export const getChampionMastery = async (puuid) => {
  try {
    const res = await fetch(
      `https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
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

export const getMatchIds = async (puuid, queue = 420, count = 30) => {
  try {
    const url = queue
      ? `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queue}&start=0&count=${count}`
      : `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
    const res = await fetch(url, { headers: { "X-Riot-Token": RIOT_API_KEY } });
    if (!res.ok) throw new Error("Erro ao buscar partidas");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar partidas:', error);
    throw new Error('Erro ao buscar partidas.');
  }
};

export const getMatchById = async (matchId) => {
  try {
    const res = await fetch(
      `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar partida");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar partida:', error);
    throw new Error('Erro ao buscar partida.');
  }
};

export const getSummonerByPuuid = async (puuid) => {
  try {
    const res = await fetch(
      `https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar invocador");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar invocador:', error);
    throw new Error('Erro ao buscar invocador.');
  }
};

export const getRankedBySummonerId = async (summonerId) => {
  try {
    const res = await fetch(
      `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar ranked:', error);
    throw new Error('Erro ao buscar ranked.');
  }
};