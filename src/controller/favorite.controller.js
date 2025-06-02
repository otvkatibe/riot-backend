import * as favoriteservice from '../services/favorite.riot..service.js';

export const createFavorite = async (req, res) => {
  try {
    const favorite = await favoriteservice.createFavorite({ ...req.body, userId: req.userId });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar favorito.' });
    console.log(err);
  }
};

export const getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteservice.getFavoritesByUser(req.userId);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar favoritos.' });
  }
};

export const updateFavorite = async (req, res) => {
  try {
    const favorite = await favoriteservice.updateFavorite(req.params.id, req.userId, req.body);
    if (!favorite) return res.status(404).json({ message: 'Favorito não encontrado.' });
    res.json(favorite);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar favorito.' });
  }
};

export const deleteFavorite = async (req, res) => {
  try {
    const favorite = await favoriteservice.deleteFavorite(req.params.id, req.userId);
    if (!favorite) return res.status(404).json({ message: 'Favorito não encontrado.' });
    res.json({ message: 'Favorito removido.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover favorito.' });
  }
};