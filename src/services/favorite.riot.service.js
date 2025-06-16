import FavoriteRiot from '../models/FavoriteRiot.js';

export const createFavorite = async (favoriteData) => {
  // Se existe transformação, seria algo como:
  const processedData = {
    ...favoriteData,
    nome: favoriteData.nome?.toLowerCase(), // Verificar se isso existe
    tag: favoriteData.tag?.toLowerCase()    // Verificar se isso existe
  };
  
  const favorite = new FavoriteRiot(processedData);
  return await favorite.save();
};

export const getFavoritesByUser = (userId) => 
    FavoriteRiot.find({ userId });

export const updateFavorite = (id, userId, data) =>
    FavoriteRiot.findOneAndUpdate({ _id: id, userId }, data, { new: true });

export const deleteFavorite = (id, userId) =>
    FavoriteRiot.findOneAndDelete({ _id: id, userId });