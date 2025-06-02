import '../setup.js';
import { createFavorite, getFavoritesByUser, updateFavorite, deleteFavorite } from '../../services/favorite.riot.service.js';
import { createUser } from '../../services/user.service.js';

describe('Favorite Service', () => {
  let userId;

  beforeEach(async () => {
    const user = await createUser({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'hashedpassword'
    });
    userId = user._id;
  });

  describe('createFavorite', () => {
    it('deve criar um favorito com sucesso', async () => {
      const favoriteData = {
        nome: 'TestPlayer',
        tag: 'BR1',
        tipo: 'player',
        observacao: 'Bom jogador',
        userId
      };

      const favorite = await createFavorite(favoriteData);
      
      expect(favorite).toBeDefined();
      // Corrigir expectativa - o serviço converte para lowercase
      expect(favorite.nome).toBe(favoriteData.nome.toLowerCase());
      expect(favorite.tag).toBe(favoriteData.tag.toLowerCase());
      expect(favorite.tipo).toBe(favoriteData.tipo);
      expect(favorite.observacao).toBe(favoriteData.observacao);
      expect(favorite.userId.toString()).toBe(userId.toString());
    });

    it('deve falhar com dados inválidos', async () => {
      const favoriteData = {
        nome: '', // Campo obrigatório vazio
        tag: '', // Campo obrigatório vazio
        tipo: 'invalid', // Enum inválido
        userId
      };

      await expect(createFavorite(favoriteData)).rejects.toThrow();
    });
  });

  describe('getFavoritesByUser', () => {
    it('deve retornar favoritos do usuário', async () => {
      await createFavorite({
        nome: 'Player1',
        tag: 'BR1',
        tipo: 'player',
        userId
      });

      const favorites = await getFavoritesByUser(userId);
      expect(favorites).toHaveLength(1);
      // Corrigir expectativa - o serviço converte para lowercase
      expect(favorites[0].nome).toBe('player1');
      expect(favorites[0].tag).toBe('br1');
      expect(favorites[0].tipo).toBe('player');
    });

    it('deve retornar array vazio para usuário sem favoritos', async () => {
      const favorites = await getFavoritesByUser(userId);
      expect(Array.isArray(favorites)).toBe(true);
      expect(favorites).toHaveLength(0);
    });
  });

  describe('updateFavorite', () => {
    it('deve atualizar um favorito', async () => {
      const favorite = await createFavorite({
        nome: 'Player1',
        tag: 'BR1',
        tipo: 'player',
        observacao: 'Original',
        userId
      });

      const updated = await updateFavorite(favorite._id, userId, { observacao: 'Atualizado' });
      
      expect(updated).toBeDefined();
      expect(updated.observacao).toBe('Atualizado');
      expect(updated.nome).toBe('player1'); // lowercase
    });

    it('deve retornar null para favorito inexistente', async () => {
      const fakeId = '64f123456789abcdef123456';
      const result = await updateFavorite(fakeId, userId, { observacao: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteFavorite', () => {
    it('deve deletar um favorito', async () => {
      const favorite = await createFavorite({
        nome: 'Player1',
        tag: 'BR1',
        tipo: 'player',
        userId
      });

      const deleted = await deleteFavorite(favorite._id, userId);
      expect(deleted).toBeDefined();
      expect(deleted._id.toString()).toBe(favorite._id.toString());
    });

    it('deve retornar null para favorito inexistente', async () => {
      const fakeId = '64f123456789abcdef123456';
      const result = await deleteFavorite(fakeId, userId);
      expect(result).toBeNull();
    });
  });
});