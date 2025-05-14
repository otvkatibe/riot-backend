import FavoriteRiot from '../models/FavoriteRiot.js';

export const createFavorite = (data) => 
    FavoriteRiot.create(data);

export const getFavoritesByUser = (userId) => 
    FavoriteRiot.find({ userId });

export const updateFavorite = (id, userId, data) =>
    FavoriteRiot.findOneAndUpdate({ _id: id, userId }, data, { new: true });

export const deleteFavorite = (id, userId) =>
    FavoriteRiot.findOneAndDelete({ _id: id, userId });