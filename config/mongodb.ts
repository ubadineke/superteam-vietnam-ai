import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected:', connection.connection.host);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}
