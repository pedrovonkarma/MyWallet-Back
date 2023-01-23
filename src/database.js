import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';


dotenv.config();

let db;
try {
    const mongoClient = new MongoClient(process.env.DATABASE_URL);
    db = mongoClient.db();
  } catch (error) {
    console.error(error);
  }

export default db