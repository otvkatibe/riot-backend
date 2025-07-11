import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import riotRoutes from './routes/riot.route.js';
import userRoutes from './routes/user.route.js';
import favoriteriotRoutes from './routes/favorite.riot.route.js';
import analyticsRoutes from './routes/analytics.route.js'; // NOVO
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

app.use("/user", userRoutes);
app.use("/riot", riotRoutes);
app.use('/riot/favorites', favoriteriotRoutes);
app.use('/analytics', analyticsRoutes); // NOVO
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => res.send('Riot Backend API'));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Docs available at http://localhost:${PORT}/docs`);
  console.log(`Analytics at http://localhost:${PORT}/analytics/community`);
});