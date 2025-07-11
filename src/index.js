import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import riotRoutes from './routes/riot.route.js';
import userRoutes from './routes/user.route.js';
import favoriteriotRoutes from './routes/favorite.riot.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import db from './database/configdb.js';
import { swaggerUi, swaggerSpec } from './swagger.js';

dotenv.config();
const app = express();

db.connect();

app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Rotas principais
app.use("/user", userRoutes);
app.use("/riot", riotRoutes);
app.use('/riot/favorites', favoriteriotRoutes);
app.use('/analytics', analyticsRoutes);

// Configuração do Swagger com fallback
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Middleware personalizado para Swagger UI
app.use('/docs', (req, res, next) => {
  // Log para debug
  console.log('Acessando /docs:', req.path);
  next();
}, swaggerUi.serve);

app.get('/docs', (req, res) => {
  try {
    // Verificar se swaggerSpec está válido
    if (!swaggerSpec || Object.keys(swaggerSpec).length === 0) {
      return res.status(500).send(`
        <html>
          <body>
            <h1>Erro no Swagger</h1>
            <p>SwaggerSpec não foi carregado corretamente.</p>
            <p><a href="/swagger.json">Ver JSON bruto</a></p>
          </body>
        </html>
      `);
    }

    // Renderizar Swagger UI
    const html = swaggerUi.generateHTML(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Riot Backend API Documentation',
    });
    
    res.send(html);
  } catch (error) {
    console.error('Erro ao renderizar Swagger UI:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Erro no Swagger UI</h1>
          <p>Erro: ${error.message}</p>
          <p><a href="/swagger.json">Ver JSON bruto</a></p>
          <details>
            <summary>Stack trace</summary>
            <pre>${error.stack}</pre>
          </details>
        </body>
      </html>
    `);
  }
});

// Rota raiz
app.get('/', (req, res) => res.send('Riot Backend API v2.0'));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      database: 'connected',
      swagger: swaggerSpec ? 'loaded' : 'error',
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Swagger JSON: http://localhost:${PORT}/swagger.json`);
  console.log(`Docs available at: http://localhost:${PORT}/docs`);
  console.log(`Analytics: http://localhost:${PORT}/analytics/community`);
});