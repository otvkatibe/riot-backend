import mongoose from 'mongoose';

const CacheSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB remove automaticamente documentos expirados
  },
  cacheType: {
    type: String,
    enum: ['profile', 'maestria', 'winrate', 'champion-stats', 'matches', 'champions', 'challenger', 'puuid'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Cache', CacheSchema);