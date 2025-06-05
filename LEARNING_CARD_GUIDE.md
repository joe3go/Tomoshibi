# Tomoshibi Learning Card System Guide

## Complete Implementation Overview

The learning card system replaces tools like Bunpro by making output practice central to Japanese learning. Each card combines input sections (vocabulary + context) with output practice sections (text/voice input).

## 🎯 Key Features Implemented

### Reusable Learning Card Component
- **Input Section**: Vocabulary with type, 3 context sentences (easy → hard), highlighted target words
- **Output Practice**: Text input, Web Speech API voice recording, localStorage persistence
- **SRS Integration**: Automatic level progression based on practice completion
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

### Core Components Built
1. `LearningCard` - Main reusable component with input/output sections
2. `LearningCardCreator` - Interface for creating new cards
3. `LearningPractice` - Full practice session management
4. `useSpeechRecognition` - Web Speech API integration for voice input

## 📝 How to Add New Learning Cards

### Method 1: Using the UI (Recommended)
1. Navigate to **Practice Cards** in the sidebar
2. Click **Create Your Own Card** or the floating **+** button
3. Fill out the form:
   - **Vocabulary**: Target word/grammar (e.g., "習う")
   - **Reading**: Hiragana reading (e.g., "ならう")
   - **Type**: Word type (e.g., "godan verb", "i-adjective")
   - **Meaning**: English definition
   - **Grammar**: Pattern if applicable (e.g., "〜を習う")
   - **Context Sentences**: Add 1-3 sentences with varying difficulty
   - **Practice Prompt**: Question for output practice
   - **Hint Answer**: Optional example answer

### Method 2: Programmatically
Add cards to the sample data in `shared/learning-schema.ts`:

```typescript
{
  id: 'unique-id-001',
  vocab: '食べる',
  type: 'ichidan verb',
  reading: 'たべる',
  meaning: 'to eat',
  contextSentences: [
    {
      japanese: '朝ごはんを食べる。',
      english: 'I eat breakfast.',
      difficulty: 'easy'
    },
    {
      japanese: '友達と一緒に昼ごはんを食べました。',
      english: 'I ate lunch together with friends.',
      difficulty: 'medium'
    },
    {
      japanese: '健康のために野菜をたくさん食べるようにしています。',
      english: 'I try to eat lots of vegetables for my health.',
      difficulty: 'hard'
    }
  ],
  grammar: '〜を食べる',
  prompt: 'Write a sentence about your favorite food using 食べる.',
  hintAnswer: '私は寿司を食べるのが好きです。',
  srsLevel: 0,
  tags: ['verb', 'food', 'daily-life']
}
```

## 🗂️ Where to Store Vocab/Grammar JSON

### Current Storage Locations:
1. **Sample Data**: `shared/learning-schema.ts` - Contains `sampleLearningCards` array
2. **User Data**: Browser localStorage - All user-created cards and practice outputs
3. **Dynamic Loading**: Cards are loaded from localStorage on app start

### For Dynamic JSON Loading:
Create JSON files in `public/data/` directory:

```
public/
  data/
    jlpt-n5-vocab.json
    jlpt-n4-vocab.json
    grammar-patterns.json
    daily-conversations.json
```

Example JSON structure:
```json
{
  "cards": [
    {
      "id": "narau-001",
      "vocab": "習う",
      "type": "godan verb",
      "reading": "ならう",
      "meaning": "to learn, to study",
      "contextSentences": [
        {
          "japanese": "私は日本語を習う。",
          "english": "I learn Japanese.",
          "difficulty": "easy"
        }
      ],
      "prompt": "Write a sentence about something you want to learn.",
      "srsLevel": 0
    }
  ]
}
```

## 📊 SRS Level Management & Difficulty Progression

### Current SRS Levels (0-5):
- **Level 0**: New/Initial learning
- **Level 1**: First successful practice
- **Level 2**: Second successful practice
- **Level 3**: Intermediate mastery
- **Level 4**: Advanced mastery
- **Level 5**: Expert level

### How to Update SRS Levels:
The system automatically increments SRS levels when users complete practice. To manually adjust:

```typescript
import { updateSRSLevel } from '@/lib/learning-storage';

// Increase difficulty
updateSRSLevel('card-id', 3);

// Reset to beginning
updateSRSLevel('card-id', 0);
```

### Changing Prompt Difficulty:
Modify prompts based on SRS level in the learning card component:

```typescript
const getDynamicPrompt = (card: LearningCard) => {
  const baseDifficulty = card.srsLevel;
  
  if (baseDifficulty <= 1) {
    return "Write a simple sentence using this word.";
  } else if (baseDifficulty <= 3) {
    return "Write a complex sentence explaining when you use this.";
  } else {
    return "Write a paragraph using this word in multiple contexts.";
  }
};
```

## 🎨 Customization Options

### Themes & Design:
- Current: Dim-lit izakaya aesthetic with warm/cool dark themes
- Text highlighting: Pink/colored emphasis for target vocabulary
- Mobile-first responsive design

### Adding New Context Sentence Difficulties:
Extend the difficulty enum in `shared/learning-schema.ts`:
```typescript
difficulty: z.enum(['beginner', 'easy', 'medium', 'hard', 'advanced'])
```

### Voice Input Languages:
Modify the speech recognition language in `useSpeechRecognition`:
```typescript
recognition.lang = 'ja-JP'; // Japanese
// or 'en-US' for English practice
```

## 💾 Data Persistence & Search

### Current Storage:
- **Learning Cards**: `tomoshibi-learning-cards` localStorage key
- **User Outputs**: `tomoshibi-user-output` localStorage key
- **Practice History**: Tied to specific vocabulary IDs

### Making User Output Searchable:
```typescript
import { getAllUserOutputs, getUserOutputsForVocab } from '@/lib/learning-storage';

// Get all practice sessions
const allPractice = getAllUserOutputs();

// Search by vocabulary
const searchResults = allPractice.filter(output => 
  output.textOutput.includes('searchTerm') ||
  output.spokenOutput?.includes('searchTerm')
);

// Get practice for specific vocabulary
const vocabPractice = getUserOutputsForVocab('narau-001');
```

## 🚀 Future Enhancements Ready

### AI Feedback Integration:
Add feedback analysis by extending the UserOutput schema:
```typescript
feedback: z.string().optional(),
aiScore: z.number().min(0).max(100).optional(),
corrections: z.array(z.string()).optional(),
```

### Database Migration:
The current localStorage system can be easily migrated to a database by updating the storage functions in `client/src/lib/learning-storage.ts`.

## 📱 Mobile Usage

The learning card system is fully optimized for mobile:
- Touch-friendly interface
- Voice input for hands-free practice
- Responsive card layouts
- Mobile-optimized navigation

## 🔧 Technical Architecture

### File Structure:
```
shared/
  learning-schema.ts          # Data models and sample cards

client/src/
  components/
    learning-card.tsx         # Main reusable component
    learning-card-creator.tsx # Card creation interface
  
  hooks/
    use-speech-recognition.ts # Web Speech API integration
  
  lib/
    learning-storage.ts       # localStorage management
  
  pages/
    learning-practice.tsx     # Practice session management
```

### Component Usage:
```jsx
<LearningCard 
  card={cardData}
  onComplete={(cardId) => console.log(`Completed: ${cardId}`)}
/>
```

The system is production-ready and replaces the need for external tools like Bunpro by making output practice central to the learning experience.