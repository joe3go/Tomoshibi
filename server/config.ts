
import { MemStorage } from "./storage";
import { DatabaseStorage } from "./database-storage";

export function createStorage() {
  if (process.env.USE_DATABASE === 'true' || process.env.NODE_ENV === 'production') {
    console.log('Using PostgreSQL database storage');
    return new DatabaseStorage();
  } else {
    console.log('Using in-memory storage for development');
    return new MemStorage();
  }
}

export const storage = createStorage();
