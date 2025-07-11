import fetch from 'node-fetch';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Mapeamento dos endpoints por serviço e região
const endpoints = {
  riotAccount: {
    americas: 'https://americas.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  },
  summoner: {
    americas: 'https://br1.api.riotgames.com',
    europe: 'https://euw1.api.riotgames.com',
    asia: 'https://kr.api.riotgames.com'
  },
  match: {
    americas: 'https://americas.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com'
  }
};

// Agora cada função recebe um parâmetro "regiao" com valor padrão "americas"

export const getAccountByRiotId = async (nome, tag, regiao = 'americas') => {
  try {
    const baseURL = endpoints.riotAccount[regiao];
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

export const getSummonerByName = async (summonerName, regiao = 'americas') => {
  try {
    const baseURL = endpoints.summoner[regiao];
    const res = await fetch(
      `${baseURL}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Invocador não encontrado pelo nome");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar invocador por nome:', error);
    throw new Error('Erro ao buscar invocador por nome.');
  }
};

export const getAccountByPuuid = async (puuid, regiao = 'americas') => {
  try {
    const baseURL = endpoints.riotAccount[regiao];
    const res = await fetch(
      `${baseURL}/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Conta não encontrada pelo PUUID");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar conta por PUUID:', error);
    throw new Error('Erro ao buscar conta por PUUID.');
  }
};

export const getChallengerLeague = async (queue, regiao = 'americas') => {
  try {
    const baseURL = endpoints.summoner[regiao];
    const res = await fetch(
      `${baseURL}/lol/league/v4/challengerleagues/by-queue/${queue}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) throw new Error("Erro ao buscar liga Challenger");
    return await res.json();
  } catch (error) {
    console.log('Erro ao buscar liga Challenger:', error);
    throw new Error('Erro ao buscar liga Challenger.');
  }
};

export const getChampionMastery = async (puuid, regiao = 'americas') => {
  try {
    // O endpoint de maestria geralmente segue o mesmo do summoner
    const baseURL = endpoints.summoner[regiao];
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
    const baseURL = endpoints.match[regiao];
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
    const baseURL = endpoints.match[regiao];
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
    const baseURL = endpoints.summoner[regiao];
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

export const getRankedBySummonerId = async (summonerId, regiao = 'americas') => {
  try {
    const baseURL = endpoints.summoner[regiao];
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
````