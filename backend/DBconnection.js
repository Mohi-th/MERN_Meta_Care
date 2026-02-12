import mongoose from 'mongoose';


async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
   
    });
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
  }
}

export default connectToDatabase;
 