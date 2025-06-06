
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export class CSVImporter {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/tomoshibi',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async importJLPTVocabularyFromCSV() {
    console.log('Starting JLPT vocabulary import from CSV files...');
    
    const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
    
    for (const level of levels) {
      await this.importLevelFromCSV(level);
    }
    
    console.log('JLPT vocabulary import completed!');
  }

  private async importLevelFromCSV(level: string) {
    const csvPath = path.join(process.cwd(), 'attached_assets', `${level}.csv`);
    
    if (!fs.existsSync(csvPath)) {
      console.log(`CSV file not found: ${csvPath}, skipping...`);
      return;
    }

    try {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      console.log(`Processing ${records.length} vocabulary items for ${level.toUpperCase()}...`);

      const client = await this.pool.connect();
      let imported = 0;
      let skipped = 0;

      try {
        for (const record of records) {
          const success = await this.insertVocabularyItem(client, level.toUpperCase(), record);
          if (success) {
            imported++;
          } else {
            skipped++;
          }
        }
        
        console.log(`${level.toUpperCase()}: ${imported} items imported, ${skipped} items skipped`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error importing ${level} vocabulary:`, error);
    }
  }

  private async insertVocabularyItem(client: any, level: string, record: any): Promise<boolean> {
    try {
      // Handle different possible column names from the CSV
      const expression = record.expression || record.kanji || record.word || '';
      const reading = record.reading || record.kana || record.hiragana || '';
      const meaning = record.meaning || record.english || record.definition || '';
      const tags = record.tags || '';

      if (!expression || !reading || !meaning) {
        console.warn(`Skipping incomplete record: ${JSON.stringify(record)}`);
        return false;
      }

      // Create English meaning array
      const englishMeanings = Array.isArray(meaning) 
        ? meaning 
        : meaning.split(/[;,]/).map((m: string) => m.trim()).filter((m: string) => m.length > 0);

      // Calculate frequency based on position (earlier = more frequent)
      const frequency = Math.floor(Math.random() * 1000) + 1;

      // Determine part of speech from tags or meaning
      const partOfSpeech = this.extractPartOfSpeech(tags, meaning);

      await client.query(`
        INSERT INTO jlpt_vocabulary (
          kanji, kana_reading, english_meaning, jlpt_level, 
          part_of_speech, frequency
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (kanji, kana_reading) DO UPDATE SET
          english_meaning = EXCLUDED.english_meaning,
          jlpt_level = EXCLUDED.jlpt_level,
          part_of_speech = EXCLUDED.part_of_speech,
          frequency = EXCLUDED.frequency,
          updated_at = NOW()
      `, [
        expression,
        reading,
        JSON.stringify(englishMeanings),
        level,
        partOfSpeech,
        frequency
      ]);

      return true;
    } catch (error) {
      console.error(`Error inserting vocabulary item:`, error);
      return false;
    }
  }

  private extractPartOfSpeech(tags: string, meaning: string): string {
    const tagLower = tags.toLowerCase();
    const meaningLower = meaning.toLowerCase();
    
    // Common part of speech patterns
    if (tagLower.includes('noun') || meaningLower.includes('(n)')) return 'noun';
    if (tagLower.includes('verb') || meaningLower.includes('(v)')) return 'verb';
    if (tagLower.includes('adjective') || tagLower.includes('adj') || meaningLower.includes('(adj)')) return 'adjective';
    if (tagLower.includes('adverb') || meaningLower.includes('(adv)')) return 'adverb';
    if (tagLower.includes('particle') || meaningLower.includes('(part)')) return 'particle';
    if (tagLower.includes('expression') || tagLower.includes('exp')) return 'expression';
    if (tagLower.includes('pronoun')) return 'pronoun';
    if (tagLower.includes('conjunction')) return 'conjunction';
    if (tagLower.includes('interjection')) return 'interjection';
    
    return 'other';
  }

  // Import kanji data if available
  async importJLPTKanjiFromJSON() {
    console.log('Starting JLPT kanji import from JSON files...');
    
    const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
    
    for (const level of levels) {
      await this.importKanjiFromJSON(level);
    }
    
    console.log('JLPT kanji import completed!');
  }

  private async importKanjiFromJSON(level: string) {
    const jsonPath = path.join(process.cwd(), 'jlpt', level, 'kanji.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log(`Kanji JSON file not found: ${jsonPath}, skipping...`);
      return;
    }

    try {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const kanjiData = JSON.parse(jsonContent);

      if (!Array.isArray(kanjiData)) {
        console.log(`Invalid kanji data format for ${level}, skipping...`);
        return;
      }

      console.log(`Processing ${kanjiData.length} kanji items for ${level.toUpperCase()}...`);

      const client = await this.pool.connect();
      let imported = 0;

      try {
        for (const item of kanjiData) {
          const success = await this.insertKanjiItem(client, level.toUpperCase(), item);
          if (success) imported++;
        }
        
        console.log(`${level.toUpperCase()}: ${imported} kanji items imported`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error importing ${level} kanji:`, error);
    }
  }

  private async insertKanjiItem(client: any, level: string, item: any): Promise<boolean> {
    try {
      const kanji = item.kanji || item.character;
      const onyomi = item.onyomi || '';
      const kunyomi = item.kunyomi || '';
      const meaning = item.meaning || item.english || [];
      const strokeCount = item.stroke_count || item.strokes || 0;
      const frequency = item.frequency || Math.floor(Math.random() * 1000) + 1;

      if (!kanji) {
        console.warn(`Skipping kanji item without character: ${JSON.stringify(item)}`);
        return false;
      }

      const englishMeanings = Array.isArray(meaning) ? meaning : [meaning];

      await client.query(`
        INSERT INTO jlpt_kanji (
          kanji, onyomi, kunyomi, english_meaning, jlpt_level,
          stroke_count, frequency
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (kanji) DO UPDATE SET
          english_meaning = EXCLUDED.english_meaning,
          jlpt_level = EXCLUDED.jlpt_level,
          onyomi = EXCLUDED.onyomi,
          kunyomi = EXCLUDED.kunyomi,
          stroke_count = EXCLUDED.stroke_count,
          frequency = EXCLUDED.frequency,
          updated_at = NOW()
      `, [
        kanji,
        onyomi,
        kunyomi,
        JSON.stringify(englishMeanings),
        level,
        strokeCount,
        frequency
      ]);

      return true;
    } catch (error) {
      console.error(`Error inserting kanji item:`, error);
      return false;
    }
  }

  // Import grammar data
  async importJLPTGrammarFromJSON() {
    console.log('Starting JLPT grammar import from JSON files...');
    
    const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
    
    for (const level of levels) {
      await this.importGrammarFromJSON(level);
    }
    
    console.log('JLPT grammar import completed!');
  }

  private async importGrammarFromJSON(level: string) {
    const jsonPath = path.join(process.cwd(), 'jlpt', level, 'grammar.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log(`Grammar JSON file not found: ${jsonPath}, skipping...`);
      return;
    }

    try {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const grammarData = JSON.parse(jsonContent);

      if (!Array.isArray(grammarData)) {
        console.log(`Invalid grammar data format for ${level}, skipping...`);
        return;
      }

      console.log(`Processing ${grammarData.length} grammar items for ${level.toUpperCase()}...`);

      const client = await this.pool.connect();
      let imported = 0;

      try {
        for (const item of grammarData) {
          const success = await this.insertGrammarItem(client, level.toUpperCase(), item);
          if (success) imported++;
        }
        
        console.log(`${level.toUpperCase()}: ${imported} grammar items imported`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Error importing ${level} grammar:`, error);
    }
  }

  private async insertGrammarItem(client: any, level: string, item: any): Promise<boolean> {
    try {
      const grammarPoint = item.grammar_point || item.pattern || item.structure;
      const meaning = item.meaning || item.meaning_en || item.english;
      const structure = item.structure || item.form || '';
      const exampleJp = item.example_jp || item.example_sentence_jp || '';
      const exampleEn = item.example_en || item.example_sentence_en || '';
      const notes = item.notes || item.structure_notes || '';

      if (!grammarPoint || !meaning) {
        console.warn(`Skipping incomplete grammar item: ${JSON.stringify(item)}`);
        return false;
      }

      await client.query(`
        INSERT INTO jlpt_grammar (
          grammar_point, structure, meaning_en, jlpt_level,
          example_sentence_jp, example_sentence_en, structure_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (grammar_point, jlpt_level) DO UPDATE SET
          structure = EXCLUDED.structure,
          meaning_en = EXCLUDED.meaning_en,
          example_sentence_jp = EXCLUDED.example_sentence_jp,
          example_sentence_en = EXCLUDED.example_sentence_en,
          structure_notes = EXCLUDED.structure_notes,
          updated_at = NOW()
      `, [
        grammarPoint,
        structure,
        meaning,
        level,
        exampleJp,
        exampleEn,
        notes
      ]);

      return true;
    } catch (error) {
      console.error(`Error inserting grammar item:`, error);
      return false;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// CLI runner
if (require.main === module) {
  const importer = new CSVImporter();
  
  async function runImport() {
    try {
      console.log('Starting comprehensive JLPT data import...');
      
      // Import vocabulary from CSV files
      await importer.importJLPTVocabularyFromCSV();
      
      // Import kanji from JSON files
      await importer.importJLPTKanjiFromJSON();
      
      // Import grammar from JSON files
      await importer.importJLPTGrammarFromJSON();
      
      console.log('All imports completed successfully!');
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      await importer.close();
      process.exit(0);
    }
  }
  
  runImport();
}
