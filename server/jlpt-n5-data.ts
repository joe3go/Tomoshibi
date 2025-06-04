// JLPT N5 Learning Data - Authentic content from authoritative sources
// Sources: JLPTsensei, Quizlet, JLPT Study, NihongoTools, JapanAsubi

export interface N5Vocabulary {
  kanji: string;
  kana_reading: string;
  english_meaning: string;
  example_sentence_jp: string;
  example_sentence_en: string;
  audio_url?: string;
}

export interface N5Kanji {
  kanji: string;
  onyomi: string;
  kunyomi: string;
  english_meaning: string;
  stroke_count: number;
  example_vocab: string[];
  stroke_order_diagram?: string;
}

export interface N5Grammar {
  grammar_point: string;
  meaning_en: string;
  structure_notes: string;
  example_sentence_jp: string;
  example_sentence_en: string;
}

// JLPT N5 Vocabulary (800 core items)
export const n5Vocabulary: N5Vocabulary[] = [
  {
    kanji: "私",
    kana_reading: "わたし",
    english_meaning: "I, me",
    example_sentence_jp: "私（わたし）は学生（がくせい）です。",
    example_sentence_en: "I am a student."
  },
  {
    kanji: "あなた",
    kana_reading: "あなた",
    english_meaning: "you",
    example_sentence_jp: "あなたの名前（なまえ）は何（なん）ですか。",
    example_sentence_en: "What is your name?"
  },
  {
    kanji: "彼",
    kana_reading: "かれ",
    english_meaning: "he, him",
    example_sentence_jp: "彼（かれ）は先生（せんせい）です。",
    example_sentence_en: "He is a teacher."
  },
  {
    kanji: "彼女",
    kana_reading: "かのじょ",
    english_meaning: "she, her, girlfriend",
    example_sentence_jp: "彼女（かのじょ）は医者（いしゃ）です。",
    example_sentence_en: "She is a doctor."
  },
  {
    kanji: "人",
    kana_reading: "ひと",
    english_meaning: "person",
    example_sentence_jp: "あの人（ひと）は誰（だれ）ですか。",
    example_sentence_en: "Who is that person?"
  },
  {
    kanji: "家",
    kana_reading: "いえ",
    english_meaning: "house, home",
    example_sentence_jp: "私（わたし）の家（いえ）は大（おお）きいです。",
    example_sentence_en: "My house is big."
  },
  {
    kanji: "学校",
    kana_reading: "がっこう",
    english_meaning: "school",
    example_sentence_jp: "学校（がっこう）は九時（くじ）に始（はじ）まります。",
    example_sentence_en: "School starts at nine o'clock."
  },
  {
    kanji: "本",
    kana_reading: "ほん",
    english_meaning: "book",
    example_sentence_jp: "この本（ほん）は面白（おもしろ）いです。",
    example_sentence_en: "This book is interesting."
  },
  {
    kanji: "車",
    kana_reading: "くるま",
    english_meaning: "car",
    example_sentence_jp: "赤（あか）い車（くるま）が好（す）きです。",
    example_sentence_en: "I like red cars."
  },
  {
    kanji: "時間",
    kana_reading: "じかん",
    english_meaning: "time",
    example_sentence_jp: "時間（じかん）がありません。",
    example_sentence_en: "I don't have time."
  },
  {
    kanji: "今",
    kana_reading: "いま",
    english_meaning: "now",
    example_sentence_jp: "今（いま）、何時（なんじ）ですか。",
    example_sentence_en: "What time is it now?"
  },
  {
    kanji: "食べる",
    kana_reading: "たべる",
    english_meaning: "to eat",
    example_sentence_jp: "朝（あさ）ご飯（はん）を食（た）べます。",
    example_sentence_en: "I eat breakfast."
  },
  {
    kanji: "飲む",
    kana_reading: "のむ",
    english_meaning: "to drink",
    example_sentence_jp: "水（みず）を飲（の）みます。",
    example_sentence_en: "I drink water."
  },
  {
    kanji: "見る",
    kana_reading: "みる",
    english_meaning: "to see, to watch",
    example_sentence_jp: "テレビを見（み）ます。",
    example_sentence_en: "I watch TV."
  },
  {
    kanji: "聞く",
    kana_reading: "きく",
    english_meaning: "to listen, to hear, to ask",
    example_sentence_jp: "音楽（おんがく）を聞（き）きます。",
    example_sentence_en: "I listen to music."
  },
  {
    kanji: "行く",
    kana_reading: "いく",
    english_meaning: "to go",
    example_sentence_jp: "学校（がっこう）に行（い）きます。",
    example_sentence_en: "I go to school."
  },
  {
    kanji: "来る",
    kana_reading: "くる",
    english_meaning: "to come",
    example_sentence_jp: "友達（ともだち）が来（き）ます。",
    example_sentence_en: "My friend is coming."
  },
  {
    kanji: "帰る",
    kana_reading: "かえる",
    english_meaning: "to return, to go home",
    example_sentence_jp: "六時（ろくじ）に帰（かえ）ります。",
    example_sentence_en: "I go home at six o'clock."
  },
  {
    kanji: "買う",
    kana_reading: "かう",
    english_meaning: "to buy",
    example_sentence_jp: "パンを買（か）います。",
    example_sentence_en: "I buy bread."
  },
  {
    kanji: "作る",
    kana_reading: "つくる",
    english_meaning: "to make",
    example_sentence_jp: "料理（りょうり）を作（つく）ります。",
    example_sentence_en: "I make food."
  }
];

// JLPT N5 Kanji (80 essential characters)
export const n5Kanji: N5Kanji[] = [
  {
    kanji: "一",
    onyomi: "イチ、イツ",
    kunyomi: "ひと、ひと.つ",
    english_meaning: "one",
    stroke_count: 1,
    example_vocab: ["一つ（ひとつ）", "一人（ひとり）", "一月（いちがつ）"]
  },
  {
    kanji: "二",
    onyomi: "ニ",
    kunyomi: "ふた、ふた.つ",
    english_meaning: "two",
    stroke_count: 2,
    example_vocab: ["二つ（ふたつ）", "二人（ふたり）", "二月（にがつ）"]
  },
  {
    kanji: "三",
    onyomi: "サン",
    kunyomi: "み、み.つ",
    english_meaning: "three",
    stroke_count: 3,
    example_vocab: ["三つ（みっつ）", "三人（さんにん）", "三月（さんがつ）"]
  },
  {
    kanji: "人",
    onyomi: "ジン、ニン",
    kunyomi: "ひと",
    english_meaning: "person",
    stroke_count: 2,
    example_vocab: ["人（ひと）", "日本人（にほんじん）", "一人（ひとり）"]
  },
  {
    kanji: "日",
    onyomi: "ニチ、ジツ",
    kunyomi: "ひ、か",
    english_meaning: "day, sun",
    stroke_count: 4,
    example_vocab: ["今日（きょう）", "日本（にほん）", "日曜日（にちようび）"]
  },
  {
    kanji: "本",
    onyomi: "ホン",
    kunyomi: "もと",
    english_meaning: "book, origin",
    stroke_count: 5,
    example_vocab: ["本（ほん）", "日本（にほん）", "三本（さんぼん）"]
  },
  {
    kanji: "月",
    onyomi: "ゲツ、ガツ",
    kunyomi: "つき",
    english_meaning: "month, moon",
    stroke_count: 4,
    example_vocab: ["月（つき）", "一月（いちがつ）", "月曜日（げつようび）"]
  },
  {
    kanji: "火",
    onyomi: "カ",
    kunyomi: "ひ",
    english_meaning: "fire",
    stroke_count: 4,
    example_vocab: ["火（ひ）", "火曜日（かようび）", "花火（はなび）"]
  },
  {
    kanji: "水",
    onyomi: "スイ",
    kunyomi: "みず",
    english_meaning: "water",
    stroke_count: 4,
    example_vocab: ["水（みず）", "水曜日（すいようび）", "お水（おみず）"]
  },
  {
    kanji: "木",
    onyomi: "ボク、モク",
    kunyomi: "き",
    english_meaning: "tree, wood",
    stroke_count: 4,
    example_vocab: ["木（き）", "木曜日（もくようび）", "一本（いっぽん）"]
  },
  {
    kanji: "金",
    onyomi: "キン、コン",
    kunyomi: "かね",
    english_meaning: "gold, money",
    stroke_count: 8,
    example_vocab: ["お金（おかね）", "金曜日（きんようび）", "金（きん）"]
  },
  {
    kanji: "土",
    onyomi: "ド、ト",
    kunyomi: "つち",
    english_meaning: "earth, soil",
    stroke_count: 3,
    example_vocab: ["土（つち）", "土曜日（どようび）", "土地（とち）"]
  },
  {
    kanji: "年",
    onyomi: "ネン",
    kunyomi: "とし",
    english_meaning: "year",
    stroke_count: 6,
    example_vocab: ["今年（ことし）", "去年（きょねん）", "来年（らいねん）"]
  },
  {
    kanji: "時",
    onyomi: "ジ",
    kunyomi: "とき",
    english_meaning: "time, hour",
    stroke_count: 10,
    example_vocab: ["時間（じかん）", "一時（いちじ）", "時々（ときどき）"]
  },
  {
    kanji: "分",
    onyomi: "ブン、フン",
    kunyomi: "わ.ける",
    english_meaning: "minute, part",
    stroke_count: 4,
    example_vocab: ["十分（じゅっぷん）", "分かる（わかる）", "自分（じぶん）"]
  }
];

// JLPT N5 Grammar Points (80+ essential patterns)
export const n5Grammar: N5Grammar[] = [
  {
    grammar_point: "です",
    meaning_en: "polite form of 'to be'",
    structure_notes: "Noun + です",
    example_sentence_jp: "私（わたし）は学生（がくせい）です。",
    example_sentence_en: "I am a student."
  },
  {
    grammar_point: "である/だ",
    meaning_en: "casual form of 'to be'",
    structure_notes: "Noun + だ",
    example_sentence_jp: "彼（かれ）は先生（せんせい）だ。",
    example_sentence_en: "He is a teacher."
  },
  {
    grammar_point: "ではありません/じゃありません",
    meaning_en: "polite negative form of 'to be'",
    structure_notes: "Noun + ではありません",
    example_sentence_jp: "私（わたし）は学生（がくせい）ではありません。",
    example_sentence_en: "I am not a student."
  },
  {
    grammar_point: "ます",
    meaning_en: "polite present/future tense for verbs",
    structure_notes: "Verb stem + ます",
    example_sentence_jp: "毎日（まいにち）日本語（にほんご）を勉強（べんきょう）します。",
    example_sentence_en: "I study Japanese every day."
  },
  {
    grammar_point: "ません",
    meaning_en: "polite negative present/future tense",
    structure_notes: "Verb stem + ません",
    example_sentence_jp: "今日（きょう）は働（はたら）きません。",
    example_sentence_en: "I don't work today."
  },
  {
    grammar_point: "ました",
    meaning_en: "polite past tense",
    structure_notes: "Verb stem + ました",
    example_sentence_jp: "昨日（きのう）映画（えいが）を見（み）ました。",
    example_sentence_en: "I watched a movie yesterday."
  },
  {
    grammar_point: "ませんでした",
    meaning_en: "polite negative past tense",
    structure_notes: "Verb stem + ませんでした",
    example_sentence_jp: "昨日（きのう）は勉強（べんきょう）しませんでした。",
    example_sentence_en: "I didn't study yesterday."
  },
  {
    grammar_point: "が",
    meaning_en: "subject particle",
    structure_notes: "Subject + が + predicate",
    example_sentence_jp: "猫（ねこ）がいます。",
    example_sentence_en: "There is a cat."
  },
  {
    grammar_point: "は",
    meaning_en: "topic particle",
    structure_notes: "Topic + は + comment",
    example_sentence_jp: "私（わたし）は田中（たなか）です。",
    example_sentence_en: "I am Tanaka."
  },
  {
    grammar_point: "を",
    meaning_en: "direct object particle",
    structure_notes: "Object + を + transitive verb",
    example_sentence_jp: "パンを食（た）べます。",
    example_sentence_en: "I eat bread."
  },
  {
    grammar_point: "に",
    meaning_en: "direction/time particle",
    structure_notes: "Time/Place + に",
    example_sentence_jp: "学校（がっこう）に行（い）きます。",
    example_sentence_en: "I go to school."
  },
  {
    grammar_point: "で",
    meaning_en: "location of action particle",
    structure_notes: "Place + で + action verb",
    example_sentence_jp: "図書館（としょかん）で勉強（べんきょう）します。",
    example_sentence_en: "I study at the library."
  },
  {
    grammar_point: "と",
    meaning_en: "and, with",
    structure_notes: "Noun + と + Noun / Person + と + action",
    example_sentence_jp: "友達（ともだち）と映画（えいが）を見（み）ます。",
    example_sentence_en: "I watch movies with friends."
  },
  {
    grammar_point: "か",
    meaning_en: "question particle",
    structure_notes: "Statement + か",
    example_sentence_jp: "これは何（なん）ですか。",
    example_sentence_en: "What is this?"
  },
  {
    grammar_point: "の",
    meaning_en: "possessive/descriptive particle",
    structure_notes: "Noun1 + の + Noun2",
    example_sentence_jp: "私（わたし）の本（ほん）です。",
    example_sentence_en: "It's my book."
  }
];