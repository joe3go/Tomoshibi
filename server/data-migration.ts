
import { DatabaseStorage } from './database-storage';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export class DataMigration {
  private storage: DatabaseStorage;
  private pool: Pool;

  constructor() {
    this.storage = new DatabaseStorage();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/tomoshibi',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async migrateJLPTContent() {
    console.log('Starting JLPT content migration...');
    
    const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];
    const contentTypes = ['vocab', 'kanji', 'grammar'];
    
    for (const level of levels) {
      for (const type of contentTypes) {
        await this.migrateContentFile(level, type);
      }
    }
    
    console.log('JLPT content migration completed!');
  }

  private async migrateContentFile(level: string, type: string) {
    const filePath = path.join(process.cwd(), 'jlpt', level, `${type}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}, skipping...`);
      return;
    }
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const client = await this.pool.connect();
      
      try {
        for (const item of data) {
          await this.insertContentItem(client, level.toUpperCase(), type, item);
        }
        console.log(`Migrated ${data.length} ${type} items for ${level.toUpperCase()}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error migrating ${level}/${type}:`, error);
    }
  }

  private async insertContentItem(client: any, level: string, type: string, item: any) {
    try {
      switch (type) {
        case 'vocab':
          await client.query(`
            INSERT INTO jlpt_vocabulary (
              kanji, kana_reading, english_meaning, jlpt_level, 
              part_of_speech, example_sentence_jp, example_sentence_en, frequency
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (kanji, jlpt_level) DO NOTHING
          `, [
            item.kanji || item.word,
            item.kana || item.reading,
            JSON.stringify(Array.isArray(item.meaning) ? item.meaning : [item.meaning]),
            level,
            item.part_of_speech || item.type,
            item.example_jp || item.example_sentence_jp,
            item.example_en || item.example_sentence_en,
            item.frequency || 1000
          ]);
          break;
          
        case 'kanji':
          await client.query(`
            INSERT INTO jlpt_kanji (
              kanji, onyomi, kunyomi, english_meaning, jlpt_level,
              stroke_count, example_vocab, radicals, frequency
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (kanji) DO NOTHING
          `, [
            item.kanji || item.character,
            item.onyomi,
            item.kunyomi,
            JSON.stringify(Array.isArray(item.meaning) ? item.meaning : [item.meaning]),
            level,
            item.stroke_count || item.strokes,
            JSON.stringify(item.example_vocab || []),
            item.radicals,
            item.frequency || 1000
          ]);
          break;
          
        case 'grammar':
          await client.query(`
            INSERT INTO jlpt_grammar (
              grammar_point, structure, meaning_en, jlpt_level,
              example_sentence_jp, example_sentence_en, structure_notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (grammar_point, jlpt_level) DO NOTHING
          `, [
            item.grammar_point || item.pattern,
            item.structure || item.form,
            item.meaning || item.meaning_en,
            level,
            item.example_jp || item.example_sentence_jp,
            item.example_en || item.example_sentence_en,
            item.notes || item.structure_notes
          ]);
          break;
      }
    } catch (error) {
      console.error(`Error inserting ${type} item:`, error);
    }
  }

  async createSampleUsers() {
    const client = await this.pool.connect();
    try {
      // Create demo user
      await client.query(`
        INSERT INTO users (
          username, email, password, display_name, user_type, current_jlpt_level
        )
        VALUES ('demo', 'demo@example.com', $1, 'Demo User', 'free_user', 'N5')
        ON CONFLICT (username) DO NOTHING
      `, ['902c1437ddf62dc4c7126c18f85899d3f16eef7d2dd5db5a381b73bd310853ba3090cde2a3c34d3a7938ad4de39c276bde6793529e5264f031fe5c7cedfbde7d.65e2f5f9bc23a13903c03210f9999f7b']);
      
      console.log('Sample users created');
    } finally {
      client.release();
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new DataMigration();
  migration.migrateJLPTContent()
    .then(() => migration.createSampleUsers())
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
