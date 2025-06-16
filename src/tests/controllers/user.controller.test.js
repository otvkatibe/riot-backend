import '../setup.js';
import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user.route.js';

const app = express();
app.use(express.json());
app.use('/user', userRoutes);

describe('User Controller', () => {
  describe('POST /user/register', () => {
    it('deve registrar um usuário com sucesso', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/user/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Usuário registrado com sucesso.');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    it('deve falhar com email inválido', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Formato de email inválido.');
    });

    it('deve falhar com senha curta', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/user/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('A senha deve ter pelo menos 8 caracteres.');
    });
  });

  describe('POST /user/login', () => {
    beforeEach(async () => {
      // Criar usuário para teste de login
      await request(app)
        .post('/user/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('deve fazer login com sucesso', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login realizado com sucesso.');
      expect(response.body.token).toBeDefined();
    });

    it('deve falhar com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Credenciais inválidas.');
    });
  });
});