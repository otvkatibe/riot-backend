import User from '../models/User.js';

export const findUserById = (id) => User.findById(id);

export const createUser = (userData) => new User(userData).save();

export const findUserByEmail = (email) => User.findOne({ email }).select('+password');