import mongoose from 'mongoose';

const FavoriteRiotSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['player', 'champion'],
        required: true
    },
    observacao: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const FavoriteRiot = mongoose.model('FavoriteRiot', FavoriteRiotSchema);

export default FavoriteRiot;