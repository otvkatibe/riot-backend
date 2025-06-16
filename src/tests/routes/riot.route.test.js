import '../setup.js';
import request from 'supertest';
import express from 'express';
import riotRoutes from '../../routes/riot.route.js';

describe('Riot Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/riot', riotRoutes);
  });

  it('deve ter rota /maestria', async () => {
    const response = await request(app).get('/riot/maestria');
    expect(response.status).not.toBe(404);
  });

  it('deve ter rota /winrate', async () => {
    const response = await request(app).get('/riot/winrate');
    expect(response.status).not.toBe(404);
  });

  it('deve ter rota /champion-stats', async () => {
    const response = await request(app).get('/riot/champion-stats');
    expect(response.status).not.toBe(404);
  });

  it('deve ter rota /profile', async () => {
    const response = await request(app).get('/riot/profile');
    expect(response.status).not.toBe(404);
  });

  it('deve ter rota /puuid', async () => {
    const response = await request(app).get('/riot/puuid');
    expect(response.status).not.toBe(404);
  });
});