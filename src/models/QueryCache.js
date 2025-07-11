import mongoose from 'mongoose';

const QueryCacheSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    enum: ['profile', 'maestria', 'winrate', 'history', 'champion-stats', 'challenger-top3'],
    required: true 
  },
  identificador: { type: String, required: true },
  dados: { type: mongoose.Schema.Types.Mixed, required: true },
  consultadoPor: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  totalConsultas: { type: Number, default: 1 },
  ultimaConsulta: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h padrão
  }
}, {
  timestamps: true
});

// Índices para performance
QueryCacheSchema.index({ tipo: 1, identificador: 1 });
QueryCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
QueryCacheSchema.index({ totalConsultas: -1 });

export default mongoose.model('QueryCache', QueryCacheSchema);