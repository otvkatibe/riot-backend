import '../setup.js';
import { createUser, findUserByEmail } from '../../services/user.service.js';

describe('User Service', () => {
  describe('createUser', () => {
    it('deve criar um usuário com sucesso', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      const user = await createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });

    it('deve falhar ao criar usuário com email duplicado', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      await createUser(userData);
      
      await expect(createUser(userData)).rejects.toThrow();
    });
  });

  describe('findUserByEmail', () => {
    it('deve encontrar usuário por email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      await createUser(userData);
      const foundUser = await findUserByEmail('test@example.com');
      
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('test@example.com');
    });

    it('deve retornar null para email inexistente', async () => {
      const foundUser = await findUserByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });
  });
});