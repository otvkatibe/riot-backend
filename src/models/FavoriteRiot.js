import mongoose from 'mongoose';

const RankSchema = new mongoose.Schema({
  tier: String,
  rank: String,
  leaguePoints: Number,
  wins: Number,
  losses: Number,
  queueType: String
}, { _id: false });

const RanksSchema = new mongoose.Schema({
  soloDuo: { type: RankSchema, default: null },
  flex: { type: RankSchema, default: null }
}, { _id: false });

const FavoriteRiotSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tag: { type: String, required: true },
  tipo: { type: String, enum: ['player', 'champion'], required: true },
  observacao: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileIconId: { type: Number },
  summonerLevel: { type: Number },
  name: { type: String },
  ranks: { type: RanksSchema }
}, {
  timestamps: true
});

FavoriteRiotSchema.pre('save', function (next) {
  if (this.nome) this.nome = this.nome.toLowerCase();
  if (this.tag) this.tag = this.tag.toLowerCase();
  next();
});

const FavoriteRiot = mongoose.model('FavoriteRiot', FavoriteRiotSchema);

export default FavoriteRiot;