import { createUser, findUserByEmail, findUserById } from '../services/user.service.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validateEmail(email)) return errorResponse(res, 400, 'Formato de email inválido.');
    if (!validatePassword(password)) return errorResponse(res, 400, 'A senha deve ter pelo menos 8 caracteres.');

    const existingUser = await findUserByEmail(email);
    if (existingUser) return errorResponse(res, 400, 'Usuário já registrado.');

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({ name, email, password: hashedPassword });

    return successResponse(res, 201, 'Usuário registrado com sucesso.');
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, 'Erro ao registrar usuário.');
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email)) return errorResponse(res, 400, 'Formato de email inválido.');
    if (!email || !password) return errorResponse(res, 400, 'Email e senha são obrigatórios.');

    const user = await findUserByEmail(email);
    if (!user || !user.password) return errorResponse(res, 401, 'Credenciais inválidas.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return errorResponse(res, 401, 'Credenciais inválidas.');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    return successResponse(res, 200, 'Login realizado com sucesso.', { token });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, 'Erro ao realizar login.');
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.userId; // Adicionado pelo middleware verifyToken
    if (!userId) {
      return errorResponse(res, 400, 'ID do usuário não encontrado no token.');
    }

    const user = await findUserById(userId);
    if (!user) {
      return errorResponse(res, 404, 'Usuário não encontrado.');
    }

    // Retorna o usuário sem a senha (o select: false no model já cuida disso)
    return successResponse(res, 200, 'Dados do usuário recuperados com sucesso.', { 
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      } 
    });
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 500, 'Erro ao buscar dados do usuário.');
  }
};