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

export const getChallengerLeague = async (queue) => {
  try {
    const res = await fetch(
      `https://br1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    if (!res.ok) {
      console.error(`Riot API respondeu com status ${res.status}:`, await res.text());
      throw new Error("Erro ao buscar liga Challenger");
    }
    return await res.json();
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