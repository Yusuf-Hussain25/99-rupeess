import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global to cache the connection across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB Connected');
      return mongooseInstance;
    }).catch((error) => {
      // Clear the promise on error so we can retry
      cached.promise = null;
      console.error('❌ MongoDB Connection Error:', error.message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    // Provide more helpful error messages
    if (e.name === 'MongooseServerSelectionError') {
      const errorMessage = e.message || 'Could not connect to MongoDB';
      if (errorMessage.includes('whitelist') || errorMessage.includes('IP')) {
        throw new Error(
          'MongoDB Connection Failed: Your IP address is not whitelisted in MongoDB Atlas. ' +
          'Please add your current IP address to the Atlas IP whitelist: ' +
          'https://www.mongodb.com/docs/atlas/security-whitelist/'
        );
      }
      throw new Error(
        `MongoDB Connection Failed: ${errorMessage}. ` +
        'Please check your MONGODB_URI in .env.local and ensure your MongoDB Atlas cluster is running.'
      );
    }
    throw e;
  }

  return cached.conn;
}

export default connectDB;

