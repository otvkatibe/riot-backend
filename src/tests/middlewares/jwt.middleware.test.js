import verifyToken from '../../middlewares/jwt.token.middleware.js';

describe('JWT Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; return this; }
    };
    next = function() { this.called = true; };
  });

  it('deve falhar quando token não é fornecido', () => {
    verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token não fornecido.');
    expect(next.called).toBeUndefined();
  });

  it('deve falhar quando authorization header está ausente', () => {
    verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token não fornecido.');
  });

  it('deve falhar quando token está mal formatado', () => {
    req.headers.authorization = 'InvalidFormat';
    
    verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token não fornecido.');
  });
});