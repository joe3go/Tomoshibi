
const { CSVImporter } = require('../server/csv-importer.ts');

async function main() {
  console.log('🔄 Starting JLPT data import...');
  
  const importer = new CSVImporter();
  
  try {
    // Import vocabulary from CSV files
    console.log('📚 Importing vocabulary data...');
    await importer.importJLPTVocabularyFromCSV();
    
    // Import kanji from JSON files  
    console.log('🈷️ Importing kanji data...');
    await importer.importJLPTKanjiFromJSON();
    
    // Import grammar from JSON files
    console.log('📝 Importing grammar data...');
    await importer.importJLPTGrammarFromJSON();
    
    console.log('✅ All data imported successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await importer.close();
    process.exit(0);
  }
}

main();
