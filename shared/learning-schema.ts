import { z } from 'zod';

// Learning card data schema
export const contextSentenceSchema = z.object({
  japanese: z.string(),
  english: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const learningCardSchema = z.object({
  id: z.string(),
  vocab: z.string(),
  type: z.string(), // "godan verb", "i-adjective", etc.
  reading: z.string().optional(),
  meaning: z.string(),
  contextSentences: z.array(contextSentenceSchema),
  grammar: z.string().optional(),
  prompt: z.string(),
  hintAnswer: z.string().optional(),
  audioUrl: z.string().optional(),
  srsLevel: z.number().min(0).max(5).default(0),
  tags: z.array(z.string()).default([]),
});

export const userOutputSchema = z.object({
  vocabId: z.string(),
  textOutput: z.string(),
  spokenOutput: z.string().optional(),
  timestamp: z.string(),
  feedback: z.string().optional(),
});

export type ContextSentence = z.infer<typeof contextSentenceSchema>;
export type LearningCard = z.infer<typeof learningCardSchema>;
export type UserOutput = z.infer<typeof userOutputSchema>;

// Sample data for testing
export const sampleLearningCards: LearningCard[] = [
  {
    id: 'narau-001',
    vocab: '習う',
    type: 'godan verb',
    reading: 'ならう',
    meaning: 'to learn, to study',
    contextSentences: [
      {
        japanese: '私は日本語を習う。',
        english: 'I learn Japanese.',
        difficulty: 'easy'
      },
      {
        japanese: '彼はピアノを習っています。',
        english: 'He is learning piano.',
        difficulty: 'medium'
      },
      {
        japanese: '大学で経済を習ったことがあります。',
        english: 'I have studied economics at university.',
        difficulty: 'hard'
      }
    ],
    grammar: '〜を習う',
    prompt: 'Write a sentence about something you want to learn using 習う.',
    hintAnswer: '私は料理を習いたいです。',
    srsLevel: 0,
    tags: ['verb', 'learning', 'education']
  },
  {
    id: 'nakereba-001',
    vocab: 'なければならない',
    type: 'grammar',
    reading: 'なければならない',
    meaning: 'must, have to',
    contextSentences: [
      {
        japanese: '宿題をしなければならない。',
        english: 'I must do homework.',
        difficulty: 'easy'
      },
      {
        japanese: '明日早く起きなければなりません。',
        english: 'I have to wake up early tomorrow.',
        difficulty: 'medium'
      },
      {
        japanese: 'この問題について真剣に考えなければならないと思います。',
        english: 'I think we must seriously consider this problem.',
        difficulty: 'hard'
      }
    ],
    grammar: '〜なければならない',
    prompt: 'Write a sentence about a responsibility you have using this grammar.',
    hintAnswer: '毎日運動しなければならない。',
    srsLevel: 0,
    tags: ['grammar', 'obligation', 'necessity']
  },
  {
    id: 'taberu-001',
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
];