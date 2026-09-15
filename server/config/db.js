import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dbState = {
  isMongoose: false,
  isEmbedded: false,
  connectionString: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repair_shop'
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repair_shop';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick check
    });
    dbState.isMongoose = true;
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Could not connect to MongoDB (${error.message}).`);
    console.log(`[Database] Initializing resilient embedded local datastore (data/embedded_db.json)...`);
    dbState.isEmbedded = true;
    initEmbeddedStorage();
    return false;
  }
};

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.resolve(DATA_DIR, 'embedded_db.json');

export const getEmbeddedData = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = {
        admins: [],
        tickets: [],
        inventory: [],
        invoices: [],
        notifications: []
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading embedded db:', err);
    return { admins: [], tickets: [], inventory: [], invoices: [], notifications: [] };
  }
};

export const saveEmbeddedData = (data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving embedded db:', err);
  }
};

function initEmbeddedStorage() {
  getEmbeddedData();
  console.log(`[Database] Embedded datastore ready at ${DATA_FILE}`);
}
