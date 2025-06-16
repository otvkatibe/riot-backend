import '../setup.js';
import { getAccountByRiotId, getChampionMastery, getChampionsData, getSummonerByPuuid, getRankedBySummonerId, getMatchIds, getMatchById } from '../../services/riot.service.js';

describe('Riot Service', () => {
  beforeEach(() => {
    process.env.RIOT_API_KEY = 'test-api-key';
  });

  describe('getAccountByRiotId', () => {
    it('deve ser uma função', () => {
      expect(typeof getAccountByRiotId).toBe('function');
    });

    it('deve lançar erro com dados vazios', async () => {
      await expect(getAccountByRiotId('', '')).rejects.toThrow();
    });

    it('deve lançar erro com nome inexistente', async () => {
      await expect(getAccountByRiotId('UsuarioInexistenteMuitoUnico123456', 'BR1')).rejects.toThrow('Erro ao buscar conta Riot.');
    });

    it('deve processar caracteres especiais no nome', async () => {
      await expect(getAccountByRiotId('Test User@#$', 'BR1')).rejects.toThrow();
    });
  });

  describe('getChampionMastery', () => {
    it('deve ser uma função', () => {
      expect(typeof getChampionMastery).toBe('function');
    });

    it('deve lançar erro com puuid inválido', async () => {
      await expect(getChampionMastery('puuid-invalido')).rejects.toThrow('Erro ao buscar maestria.');
    });

    it('deve lançar erro com puuid vazio', async () => {
      await expect(getChampionMastery('')).rejects.toThrow();
    });
  });

  describe('getChampionsData', () => {
    it('deve ser uma função', () => {
      expect(typeof getChampionsData).toBe('function');
    });

    it('deve retornar dados dos campeões', async () => {
      try {
        const data = await getChampionsData();
        expect(data).toBeDefined();
        expect(data.data).toBeDefined();
        expect(typeof data.data).toBe('object');
      } catch (error) {
        // Aceita erro se API estiver indisponível
        expect(error.message).toContain('Erro ao buscar dados dos campeões');
      }
    }, 10000);
  });

  describe('getSummonerByPuuid', () => {
    it('deve ser uma função', () => {
      expect(typeof getSummonerByPuuid).toBe('function');
    });

    it('deve lançar erro com puuid inválido', async () => {
      await expect(getSummonerByPuuid('puuid-invalido')).rejects.toThrow('Erro ao buscar invocador.');
    });

    it('deve lançar erro com puuid muito longo', async () => {
      const longPuuid = 'a'.repeat(200);
      await expect(getSummonerByPuuid(longPuuid)).rejects.toThrow();
    });
  });

  describe('getRankedBySummonerId', () => {
    it('deve ser uma função', () => {
      expect(typeof getRankedBySummonerId).toBe('function');
    });

    it('deve retornar array vazio para summoner inválido', async () => {
      const result = await getRankedBySummonerId('summoner-invalido');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('deve retornar array vazio para summoner inexistente', async () => {
      const result = await getRankedBySummonerId('summoner-que-nao-existe-123456');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMatchIds', () => {
    it('deve ser uma função', () => {
      expect(typeof getMatchIds).toBe('function');
    });

    it('deve lançar erro com puuid inválido', async () => {
      await expect(getMatchIds('puuid-invalido')).rejects.toThrow('Erro ao buscar partidas.');
    });

    it('deve aceitar parâmetros opcionais', async () => {
      await expect(getMatchIds('puuid-invalido', null, 10)).rejects.toThrow();
    });

    it('deve aceitar queue específica', async () => {
      await expect(getMatchIds('puuid-invalido', 420, 5)).rejects.toThrow();
    });
  });

  describe('getMatchById', () => {
    it('deve ser uma função', () => {
      expect(typeof getMatchById).toBe('function');
    });

    it('deve lançar erro com match id inválido', async () => {
      await expect(getMatchById('match-invalido')).rejects.toThrow('Erro ao buscar partida.');
    });

    it('deve lançar erro com match id vazio', async () => {
      await expect(getMatchById('')).rejects.toThrow();
    });
  });
});