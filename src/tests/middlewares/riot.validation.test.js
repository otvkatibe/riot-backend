import { validateNomeTag, validatePuuid, validateNomeTagChampion, validateNomeTagTipo } from '../../middlewares/riot.validation.js';

describe('Riot Validation Middlewares', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {} };
    res = {
      statusCode: null,
      body: null,
      status: function(code) { 
        this.statusCode = code; 
        return this; 
      },
      json: function(data) { 
        this.body = data; 
        return this; 
      }
    };
    next = Object.assign(function() { 
      next.called = true; 
    }, { called: false });
  });

  describe('validateNomeTag', () => {
    it('deve passar com nome e tag válidos', () => {
      req.query = { nome: 'Player1', tag: 'BR1' };
      
      validateNomeTag(req, res, next);
      
      expect(next.called).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it('deve falhar quando nome está ausente', () => {
      req.query = { tag: 'BR1' };
      
      validateNomeTag(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Nome e tag são obrigatórios');
      expect(next.called).toBe(false);
    });

    it('deve falhar quando tag está ausente', () => {
      req.query = { nome: 'Player1' };
      
      validateNomeTag(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Nome e tag são obrigatórios');
      expect(next.called).toBe(false);
    });
  });

  describe('validatePuuid', () => {
    it('deve passar com puuid válido', () => {
      req.query = { puuid: 'valid-puuid-123' };
      
      validatePuuid(req, res, next);
      
      expect(next.called).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it('deve falhar quando puuid está ausente', () => {
      req.query = {};
      
      validatePuuid(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('PUUID é obrigatório');
      expect(next.called).toBe(false);
    });
  });

  describe('validateNomeTagChampion', () => {
    it('deve passar com todos os parâmetros válidos', () => {
      req.query = { nome: 'Player1', tag: 'BR1', champion: 'Yasuo' };
      
      validateNomeTagChampion(req, res, next);
      
      expect(next.called).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it('deve falhar quando champion está ausente', () => {
      req.query = { nome: 'Player1', tag: 'BR1' };
      
      validateNomeTagChampion(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Parâmetros obrigatórios faltando');
      expect(next.called).toBe(false);
    });

    it('deve falhar quando nome está ausente', () => {
      req.query = { tag: 'BR1', champion: 'Yasuo' };
      
      validateNomeTagChampion(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Parâmetros obrigatórios faltando');
      expect(next.called).toBe(false);
    });

    it('deve falhar quando tag está ausente', () => {
      req.query = { nome: 'Player1', champion: 'Yasuo' };
      
      validateNomeTagChampion(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Parâmetros obrigatórios faltando');
      expect(next.called).toBe(false);
    });
  });

  describe('validateNomeTagTipo', () => {
    it('deve passar com todos os parâmetros válidos', () => {
      req.query = { nome: 'Player1', tag: 'BR1', tipo: 'player' };
      
      validateNomeTagTipo(req, res, next);
      
      expect(next.called).toBe(true);
      expect(res.statusCode).toBeNull();
    });

    it('deve falhar quando tipo está ausente', () => {
      req.query = { nome: 'Player1', tag: 'BR1' };
      
      validateNomeTagTipo(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Nome, tag e tipo são obrigatórios');
      expect(next.called).toBe(false);
    });

    it('deve falhar quando nome está ausente', () => {
      req.query = { tag: 'BR1', tipo: 'player' };
      
      validateNomeTagTipo(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Nome, tag e tipo são obrigatórios');
      expect(next.called).toBe(false);
    });

    it('deve falhar quando tag está ausente', () => {
      req.query = { nome: 'Player1', tipo: 'player' };
      
      validateNomeTagTipo(req, res, next);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Nome, tag e tipo são obrigatórios');
      expect(next.called).toBe(false);
    });
  });
});