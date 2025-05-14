import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import riotRoutes from './routes/riot.route.js';
import userRoutes from './routes/user.route.js';
import favoriteRiotRoutes from './routes/favoriteRiot.route.js';
import db from './database/configdb.js';

dotenv.config();
const app = express();

db.connect();

app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/user", userRoutes);
app.use("/riot", riotRoutes);
app.use('/riot/favorites', favoriteRiotRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});