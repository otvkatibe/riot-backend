import { createUser, findUserByEmail } from '../services/user.service.js';
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
    const user = await createUser({ name, email, password: hashedPassword });

    return successResponse(res, 201, 'Usuário registrado com sucesso.', { user });
  } catch (error) {
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
    return errorResponse(res, 500, 'Erro ao realizar login.');
  }
};