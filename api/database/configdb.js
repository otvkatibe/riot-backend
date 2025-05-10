import mongoose from 'mongoose';

const connect = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (err) {
    console.log('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

export default { connect };