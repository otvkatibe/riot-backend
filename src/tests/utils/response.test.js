import { successResponse, errorResponse } from '../../utils/response.js';

describe('Response Utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      statusCode: null,
      body: null,
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; return this; }
    };
  });

  describe('successResponse', () => {
    it('deve retornar resposta de sucesso com dados', () => {
      const data = { user: { id: 1, name: 'Test' } };
      successResponse(mockRes, 200, 'Sucesso', data);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.message).toBe('Sucesso');
      expect(mockRes.body.user).toEqual({ id: 1, name: 'Test' });
    });

    it('deve retornar resposta de sucesso sem dados', () => {
      successResponse(mockRes, 201, 'Criado');

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.body.message).toBe('Criado');
    });
  });

  describe('errorResponse', () => {
    it('deve retornar resposta de erro', () => {
      errorResponse(mockRes, 400, 'Erro de validação');

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.body.message).toBe('Erro de validação');
    });
  });
});