import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import riotRoutes from './routes/riot.route.js';
import userRoutes from './routes/user.route.js';
import favoriteriotRoutes from './routes/favorite.riot.route.js';
import tipsRoutes from './routes/tips.route.js';
import cacheRoutes from './routes/cache.route.js';
import db from './database/configdb.js';
import { swaggerUi, swaggerSpec, swaggerOptions } from './swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao banco de dados
db.connect();

// Configurações de CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://riot-backend.vercel.app',
      'https://riot-frontend.vercel.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permite todas as origens em desenvolvimento
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas principais
app.use("/user", userRoutes);
app.use("/riot", riotRoutes);
app.use('/riot/favorites', favoriteriotRoutes);
app.use('/tips', tipsRoutes);
app.use('/cache', cacheRoutes);

// Documentação Swagger
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerSpec, swaggerOptions));

// Rota de saúde da aplicação
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Riot Backend API está funcionando!',
    documentation: '/docs',
    health: '/health',
    version: '1.0.0'
  });
});

// Middleware de tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.path} não existe`,
    availableRoutes: {
      documentation: '/docs',
      health: '/health',
      user: '/user',
      riot: '/riot',
      favorites: '/riot/favorites',
      tips: '/tips',
      cache: '/cache'
    }
  });
});

// Middleware de tratamento de erros global
app.use((error, req, res, next) => {
  console.error('Erro interno:', error);
  
  res.status(error.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo deu errado' 
      : error.message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em: http://localhost:${PORT}/docs`);
  console.log(`🏥 Health check disponível em: http://localhost:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;