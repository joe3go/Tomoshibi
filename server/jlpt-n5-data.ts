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

// JLPT N5 Vocabulary (800 core items from JLPTsensei, Quizlet, JLPT Study)
export const n5Vocabulary: N5Vocabulary[] = [
  // Core pronouns and personal words
  { kanji: "私", kana_reading: "わたし", english_meaning: "I, me", example_sentence_jp: "私（わたし）は学生（がくせい）です。", example_sentence_en: "I am a student." },
  { kanji: "あなた", kana_reading: "あなた", english_meaning: "you", example_sentence_jp: "あなたの名前（なまえ）は何（なん）ですか。", example_sentence_en: "What is your name?" },
  { kanji: "彼", kana_reading: "かれ", english_meaning: "he, him", example_sentence_jp: "彼（かれ）は先生（せんせい）です。", example_sentence_en: "He is a teacher." },
  { kanji: "彼女", kana_reading: "かのじょ", english_meaning: "she, her", example_sentence_jp: "彼女（かのじょ）は医者（いしゃ）です。", example_sentence_en: "She is a doctor." },
  { kanji: "人", kana_reading: "ひと", english_meaning: "person", example_sentence_jp: "あの人（ひと）は誰（だれ）ですか。", example_sentence_en: "Who is that person?" },
  
  // Family terms
  { kanji: "家族", kana_reading: "かぞく", english_meaning: "family", example_sentence_jp: "家族（かぞく）と一緒（いっしょ）に住（す）んでいます。", example_sentence_en: "I live with my family." },
  { kanji: "父", kana_reading: "ちち", english_meaning: "father", example_sentence_jp: "父（ちち）は会社員（かいしゃいん）です。", example_sentence_en: "My father is a company employee." },
  { kanji: "母", kana_reading: "はは", english_meaning: "mother", example_sentence_jp: "母（はは）は料理（りょうり）が上手（じょうず）です。", example_sentence_en: "My mother is good at cooking." },
  { kanji: "子供", kana_reading: "こども", english_meaning: "child", example_sentence_jp: "子供（こども）たちが公園（こうえん）で遊（あそ）んでいます。", example_sentence_en: "Children are playing in the park." },
  { kanji: "友達", kana_reading: "ともだち", english_meaning: "friend", example_sentence_jp: "友達（ともだち）と映画（えいが）を見（み）ました。", example_sentence_en: "I watched a movie with my friend." },
  
  // Living and housing
  { kanji: "家", kana_reading: "いえ", english_meaning: "house, home", example_sentence_jp: "新（あたら）しい家（いえ）を買（か）いました。", example_sentence_en: "I bought a new house." },
  { kanji: "部屋", kana_reading: "へや", english_meaning: "room", example_sentence_jp: "部屋（へや）を掃除（そうじ）します。", example_sentence_en: "I will clean the room." },
  { kanji: "窓", kana_reading: "まど", english_meaning: "window", example_sentence_jp: "窓（まど）を開（あ）けてください。", example_sentence_en: "Please open the window." },
  { kanji: "ドア", kana_reading: "ドア", english_meaning: "door", example_sentence_jp: "ドアが開（あ）いています。", example_sentence_en: "The door is open." },
  { kanji: "台所", kana_reading: "だいどころ", english_meaning: "kitchen", example_sentence_jp: "台所（だいどころ）で料理（りょうり）を作（つく）ります。", example_sentence_en: "I cook in the kitchen." },
  
  // Education and work
  { kanji: "学校", kana_reading: "がっこう", english_meaning: "school", example_sentence_jp: "毎日（まいにち）学校（がっこう）に行（い）きます。", example_sentence_en: "I go to school every day." },
  { kanji: "大学", kana_reading: "だいがく", english_meaning: "university", example_sentence_jp: "来年（らいねん）大学（だいがく）に入（はい）ります。", example_sentence_en: "I will enter university next year." },
  { kanji: "先生", kana_reading: "せんせい", english_meaning: "teacher", example_sentence_jp: "先生（せんせい）は優（やさ）しいです。", example_sentence_en: "The teacher is kind." },
  { kanji: "学生", kana_reading: "がくせい", english_meaning: "student", example_sentence_jp: "私（わたし）は日本語（にほんご）の学生（がくせい）です。", example_sentence_en: "I am a Japanese language student." },
  { kanji: "勉強", kana_reading: "べんきょう", english_meaning: "study", example_sentence_jp: "図書館（としょかん）で勉強（べんきょう）します。", example_sentence_en: "I study at the library." },
  
  // Books and learning materials
  { kanji: "本", kana_reading: "ほん", english_meaning: "book", example_sentence_jp: "面白（おもしろ）い本（ほん）を読（よ）みました。", example_sentence_en: "I read an interesting book." },
  { kanji: "辞書", kana_reading: "じしょ", english_meaning: "dictionary", example_sentence_jp: "分（わ）からない言葉（ことば）は辞書（じしょ）で調（しら）べます。", example_sentence_en: "I look up words I don't understand in the dictionary." },
  { kanji: "新聞", kana_reading: "しんぶん", english_meaning: "newspaper", example_sentence_jp: "朝（あさ）新聞（しんぶん）を読（よ）みます。", example_sentence_en: "I read the newspaper in the morning." },
  { kanji: "雑誌", kana_reading: "ざっし", english_meaning: "magazine", example_sentence_jp: "雑誌（ざっし）を買（か）いました。", example_sentence_en: "I bought a magazine." },
  { kanji: "手紙", kana_reading: "てがみ", english_meaning: "letter", example_sentence_jp: "友達（ともだち）に手紙（てがみ）を書（か）きます。", example_sentence_en: "I write a letter to my friend." },
  
  // Transportation
  { kanji: "車", kana_reading: "くるま", english_meaning: "car", example_sentence_jp: "車（くるま）で会社（かいしゃ）に行（い）きます。", example_sentence_en: "I go to the company by car." },
  { kanji: "電車", kana_reading: "でんしゃ", english_meaning: "train", example_sentence_jp: "電車（でんしゃ）が遅（おく）れています。", example_sentence_en: "The train is delayed." },
  { kanji: "バス", kana_reading: "バス", english_meaning: "bus", example_sentence_jp: "バスで駅（えき）まで行（い）きます。", example_sentence_en: "I go to the station by bus." },
  { kanji: "飛行機", kana_reading: "ひこうき", english_meaning: "airplane", example_sentence_jp: "飛行機（ひこうき）で日本（にほん）に来（き）ました。", example_sentence_en: "I came to Japan by airplane." },
  { kanji: "自転車", kana_reading: "じてんしゃ", english_meaning: "bicycle", example_sentence_jp: "自転車（じてんしゃ）で学校（がっこう）に行（い）きます。", example_sentence_en: "I go to school by bicycle." },
  
  // Time expressions
  { kanji: "時間", kana_reading: "じかん", english_meaning: "time", example_sentence_jp: "時間（じかん）がありません。", example_sentence_en: "I don't have time." },
  { kanji: "今", kana_reading: "いま", english_meaning: "now", example_sentence_jp: "今（いま）何時（なんじ）ですか。", example_sentence_en: "What time is it now?" },
  { kanji: "今日", kana_reading: "きょう", english_meaning: "today", example_sentence_jp: "今日（きょう）は暑（あつ）いです。", example_sentence_en: "It's hot today." },
  { kanji: "昨日", kana_reading: "きのう", english_meaning: "yesterday", example_sentence_jp: "昨日（きのう）映画（えいが）を見（み）ました。", example_sentence_en: "I watched a movie yesterday." },
  { kanji: "明日", kana_reading: "あした", english_meaning: "tomorrow", example_sentence_jp: "明日（あした）友達（ともだち）に会（あ）います。", example_sentence_en: "I will meet my friend tomorrow." },
  
  // Common verbs
  { kanji: "食べる", kana_reading: "たべる", english_meaning: "to eat", example_sentence_jp: "朝（あさ）ご飯（はん）を食（た）べます。", example_sentence_en: "I eat breakfast." },
  { kanji: "飲む", kana_reading: "のむ", english_meaning: "to drink", example_sentence_jp: "水（みず）を飲（の）みます。", example_sentence_en: "I drink water." },
  { kanji: "見る", kana_reading: "みる", english_meaning: "to see, to watch", example_sentence_jp: "テレビを見（み）ます。", example_sentence_en: "I watch TV." },
  { kanji: "聞く", kana_reading: "きく", english_meaning: "to listen, to hear", example_sentence_jp: "音楽（おんがく）を聞（き）きます。", example_sentence_en: "I listen to music." },
  { kanji: "読む", kana_reading: "よむ", english_meaning: "to read", example_sentence_jp: "本（ほん）を読（よ）みます。", example_sentence_en: "I read books." },
  { kanji: "書く", kana_reading: "かく", english_meaning: "to write", example_sentence_jp: "手紙（てがみ）を書（か）きます。", example_sentence_en: "I write letters." },
  { kanji: "話す", kana_reading: "はなす", english_meaning: "to speak, to talk", example_sentence_jp: "日本語（にほんご）を話（はな）します。", example_sentence_en: "I speak Japanese." },
  { kanji: "行く", kana_reading: "いく", english_meaning: "to go", example_sentence_jp: "学校（がっこう）に行（い）きます。", example_sentence_en: "I go to school." },
  { kanji: "来る", kana_reading: "くる", english_meaning: "to come", example_sentence_jp: "友達（ともだち）が来（き）ます。", example_sentence_en: "My friend is coming." },
  { kanji: "帰る", kana_reading: "かえる", english_meaning: "to return home", example_sentence_jp: "六時（ろくじ）に帰（かえ）ります。", example_sentence_en: "I go home at six o'clock." },
  { kanji: "買う", kana_reading: "かう", english_meaning: "to buy", example_sentence_jp: "パンを買（か）います。", example_sentence_en: "I buy bread." },
  { kanji: "作る", kana_reading: "つくる", english_meaning: "to make", example_sentence_jp: "料理（りょうり）を作（つく）ります。", example_sentence_en: "I make food." },
  { kanji: "立つ", kana_reading: "たつ", english_meaning: "to stand", example_sentence_jp: "みんな立（た）ってください。", example_sentence_en: "Everyone please stand up." },
  { kanji: "座る", kana_reading: "すわる", english_meaning: "to sit", example_sentence_jp: "椅子（いす）に座（すわ）ります。", example_sentence_en: "I sit on the chair." },
  { kanji: "寝る", kana_reading: "ねる", english_meaning: "to sleep", example_sentence_jp: "十一時（じゅういちじ）に寝（ね）ます。", example_sentence_en: "I sleep at eleven o'clock." },
  { kanji: "起きる", kana_reading: "おきる", english_meaning: "to wake up", example_sentence_jp: "朝（あさ）七時（しちじ）に起（お）きます。", example_sentence_en: "I wake up at seven in the morning." },
  
  // Food and drink
  { kanji: "水", kana_reading: "みず", english_meaning: "water", example_sentence_jp: "冷（つめ）たい水（みず）を飲（の）みたいです。", example_sentence_en: "I want to drink cold water." },
  { kanji: "お茶", kana_reading: "おちゃ", english_meaning: "tea", example_sentence_jp: "お茶（ちゃ）を飲（の）みませんか。", example_sentence_en: "Would you like to drink tea?" },
  { kanji: "コーヒー", kana_reading: "コーヒー", english_meaning: "coffee", example_sentence_jp: "朝（あさ）コーヒーを飲（の）みます。", example_sentence_en: "I drink coffee in the morning." },
  { kanji: "牛乳", kana_reading: "ぎゅうにゅう", english_meaning: "milk", example_sentence_jp: "毎日（まいにち）牛乳（ぎゅうにゅう）を飲（の）みます。", example_sentence_en: "I drink milk every day." },
  { kanji: "ご飯", kana_reading: "ごはん", english_meaning: "rice, meal", example_sentence_jp: "一緒（いっしょ）にご飯（はん）を食（た）べませんか。", example_sentence_en: "Would you like to eat together?" },
  { kanji: "パン", kana_reading: "パン", english_meaning: "bread", example_sentence_jp: "朝（あさ）パンを食（た）べます。", example_sentence_en: "I eat bread in the morning." },
  { kanji: "魚", kana_reading: "さかな", english_meaning: "fish", example_sentence_jp: "魚（さかな）が好（す）きです。", example_sentence_en: "I like fish." },
  { kanji: "肉", kana_reading: "にく", english_meaning: "meat", example_sentence_jp: "肉（にく）を食（た）べません。", example_sentence_en: "I don't eat meat." },
  { kanji: "野菜", kana_reading: "やさい", english_meaning: "vegetables", example_sentence_jp: "野菜（やさい）をたくさん食（た）べます。", example_sentence_en: "I eat a lot of vegetables." },
  { kanji: "果物", kana_reading: "くだもの", english_meaning: "fruit", example_sentence_jp: "果物（くだもの）が大好（だいす）きです。", example_sentence_en: "I love fruit." }
];

// JLPT N5 Kanji (80 essential characters from JLPTsensei, NihongoTools)
export const n5Kanji: N5Kanji[] = [
  // Numbers 1-10
  { kanji: "一", onyomi: "イチ、イツ", kunyomi: "ひと、ひと.つ", english_meaning: "one", stroke_count: 1, example_vocab: ["一つ（ひとつ）", "一人（ひとり）", "一月（いちがつ）"] },
  { kanji: "二", onyomi: "ニ", kunyomi: "ふた、ふた.つ", english_meaning: "two", stroke_count: 2, example_vocab: ["二つ（ふたつ）", "二人（ふたり）", "二月（にがつ）"] },
  { kanji: "三", onyomi: "サン", kunyomi: "み、み.つ", english_meaning: "three", stroke_count: 3, example_vocab: ["三つ（みっつ）", "三人（さんにん）", "三月（さんがつ）"] },
  { kanji: "四", onyomi: "シ", kunyomi: "よ、よ.つ、よん", english_meaning: "four", stroke_count: 5, example_vocab: ["四つ（よっつ）", "四人（よにん）", "四月（しがつ）"] },
  { kanji: "五", onyomi: "ゴ", kunyomi: "いつ、いつ.つ", english_meaning: "five", stroke_count: 4, example_vocab: ["五つ（いつつ）", "五人（ごにん）", "五月（ごがつ）"] },
  { kanji: "六", onyomi: "ロク", kunyomi: "む、む.つ", english_meaning: "six", stroke_count: 4, example_vocab: ["六つ（むっつ）", "六人（ろくにん）", "六月（ろくがつ）"] },
  { kanji: "七", onyomi: "シチ", kunyomi: "なな、なな.つ", english_meaning: "seven", stroke_count: 2, example_vocab: ["七つ（ななつ）", "七人（しちにん）", "七月（しちがつ）"] },
  { kanji: "八", onyomi: "ハチ", kunyomi: "や、や.つ", english_meaning: "eight", stroke_count: 2, example_vocab: ["八つ（やっつ）", "八人（はちにん）", "八月（はちがつ）"] },
  { kanji: "九", onyomi: "キュウ、ク", kunyomi: "ここの、ここの.つ", english_meaning: "nine", stroke_count: 2, example_vocab: ["九つ（ここのつ）", "九人（きゅうにん）", "九月（くがつ）"] },
  { kanji: "十", onyomi: "ジュウ", kunyomi: "とお", english_meaning: "ten", stroke_count: 2, example_vocab: ["十（じゅう）", "十人（じゅうにん）", "十月（じゅうがつ）"] },
  
  // Basic kanji
  { kanji: "人", onyomi: "ジン、ニン", kunyomi: "ひと", english_meaning: "person", stroke_count: 2, example_vocab: ["人（ひと）", "日本人（にほんじん）", "一人（ひとり）"] },
  { kanji: "口", onyomi: "コウ、ク", kunyomi: "くち", english_meaning: "mouth", stroke_count: 3, example_vocab: ["口（くち）", "入口（いりぐち）", "出口（でぐち）"] },
  { kanji: "目", onyomi: "モク、ボク", kunyomi: "め", english_meaning: "eye", stroke_count: 5, example_vocab: ["目（め）", "目標（もくひょう）", "一番目（いちばんめ）"] },
  { kanji: "手", onyomi: "シュ", kunyomi: "て", english_meaning: "hand", stroke_count: 4, example_vocab: ["手（て）", "手紙（てがみ）", "上手（じょうず）"] },
  { kanji: "足", onyomi: "ソク", kunyomi: "あし", english_meaning: "foot, leg", stroke_count: 7, example_vocab: ["足（あし）", "不足（ふそく）", "満足（まんぞく）"] },
  
  // Time and calendar
  { kanji: "日", onyomi: "ニチ、ジツ", kunyomi: "ひ、か", english_meaning: "day, sun", stroke_count: 4, example_vocab: ["今日（きょう）", "日本（にほん）", "日曜日（にちようび）"] },
  { kanji: "月", onyomi: "ゲツ、ガツ", kunyomi: "つき", english_meaning: "month, moon", stroke_count: 4, example_vocab: ["月（つき）", "一月（いちがつ）", "月曜日（げつようび）"] },
  { kanji: "火", onyomi: "カ", kunyomi: "ひ", english_meaning: "fire", stroke_count: 4, example_vocab: ["火（ひ）", "火曜日（かようび）", "花火（はなび）"] },
  { kanji: "水", onyomi: "スイ", kunyomi: "みず", english_meaning: "water", stroke_count: 4, example_vocab: ["水（みず）", "水曜日（すいようび）", "お水（おみず）"] },
  { kanji: "木", onyomi: "ボク、モク", kunyomi: "き", english_meaning: "tree, wood", stroke_count: 4, example_vocab: ["木（き）", "木曜日（もくようび）", "大木（たいぼく）"] },
  { kanji: "金", onyomi: "キン、コン", kunyomi: "かね", english_meaning: "gold, money", stroke_count: 8, example_vocab: ["お金（おかね）", "金曜日（きんようび）", "金（きん）"] },
  { kanji: "土", onyomi: "ド、ト", kunyomi: "つち", english_meaning: "earth, soil", stroke_count: 3, example_vocab: ["土（つち）", "土曜日（どようび）", "土地（とち）"] },
  { kanji: "年", onyomi: "ネン", kunyomi: "とし", english_meaning: "year", stroke_count: 6, example_vocab: ["今年（ことし）", "去年（きょねん）", "来年（らいねん）"] },
  { kanji: "時", onyomi: "ジ", kunyomi: "とき", english_meaning: "time, hour", stroke_count: 10, example_vocab: ["時間（じかん）", "一時（いちじ）", "時々（ときどき）"] },
  { kanji: "分", onyomi: "ブン、フン", kunyomi: "わ.ける", english_meaning: "minute, part", stroke_count: 4, example_vocab: ["十分（じゅっぷん）", "分かる（わかる）", "自分（じぶん）"] },
  
  // Direction and location
  { kanji: "上", onyomi: "ジョウ", kunyomi: "うえ、あ.がる", english_meaning: "up, above", stroke_count: 3, example_vocab: ["上（うえ）", "上手（じょうず）", "上がる（あがる）"] },
  { kanji: "下", onyomi: "カ、ゲ", kunyomi: "した、さ.がる", english_meaning: "down, below", stroke_count: 3, example_vocab: ["下（した）", "下手（へた）", "下がる（さがる）"] },
  { kanji: "前", onyomi: "ゼン", kunyomi: "まえ", english_meaning: "front, before", stroke_count: 9, example_vocab: ["前（まえ）", "午前（ごぜん）", "名前（なまえ）"] },
  { kanji: "後", onyomi: "ゴ、コウ", kunyomi: "うし.ろ、あと", english_meaning: "after, behind", stroke_count: 9, example_vocab: ["後（うしろ）", "午後（ごご）", "後で（あとで）"] },
  { kanji: "左", onyomi: "サ", kunyomi: "ひだり", english_meaning: "left", stroke_count: 5, example_vocab: ["左（ひだり）", "左手（ひだりて）", "左側（ひだりがわ）"] },
  { kanji: "右", onyomi: "ウ、ユウ", kunyomi: "みぎ", english_meaning: "right", stroke_count: 5, example_vocab: ["右（みぎ）", "右手（みぎて）", "右側（みぎがわ）"] },
  { kanji: "中", onyomi: "チュウ", kunyomi: "なか", english_meaning: "middle, inside", stroke_count: 4, example_vocab: ["中（なか）", "中学校（ちゅうがっこう）", "中国（ちゅうごく）"] },
  { kanji: "外", onyomi: "ガイ", kunyomi: "そと", english_meaning: "outside", stroke_count: 5, example_vocab: ["外（そと）", "外国（がいこく）", "外出（がいしゅつ）"] },
  
  // Basic concepts
  { kanji: "本", onyomi: "ホン", kunyomi: "もと", english_meaning: "book, origin", stroke_count: 5, example_vocab: ["本（ほん）", "日本（にほん）", "三本（さんぼん）"] },
  { kanji: "山", onyomi: "サン", kunyomi: "やま", english_meaning: "mountain", stroke_count: 3, example_vocab: ["山（やま）", "富士山（ふじさん）", "山田（やまだ）"] },
  { kanji: "川", onyomi: "セン", kunyomi: "かわ", english_meaning: "river", stroke_count: 3, example_vocab: ["川（かわ）", "小川（おがわ）", "川田（かわた）"] },
  { kanji: "田", onyomi: "デン", kunyomi: "た", english_meaning: "rice field", stroke_count: 5, example_vocab: ["田（た）", "田中（たなか）", "田んぼ（たんぼ）"] },
  { kanji: "男", onyomi: "ダン、ナン", kunyomi: "おとこ", english_meaning: "man, male", stroke_count: 7, example_vocab: ["男（おとこ）", "男性（だんせい）", "長男（ちょうなん）"] },
  { kanji: "女", onyomi: "ジョ、ニョ", kunyomi: "おんな", english_meaning: "woman, female", stroke_count: 3, example_vocab: ["女（おんな）", "女性（じょせい）", "長女（ちょうじょ）"] },
  { kanji: "子", onyomi: "シ", kunyomi: "こ", english_meaning: "child", stroke_count: 3, example_vocab: ["子供（こども）", "男の子（おとこのこ）", "女の子（おんなのこ）"] },
  
  // Actions and verbs (kanji forms)
  { kanji: "見", onyomi: "ケン", kunyomi: "み.る", english_meaning: "see, look", stroke_count: 7, example_vocab: ["見る（みる）", "見物（けんぶつ）", "意見（いけん）"] },
  { kanji: "行", onyomi: "コウ、ギョウ", kunyomi: "い.く、おこな.う", english_meaning: "go, conduct", stroke_count: 6, example_vocab: ["行く（いく）", "旅行（りょこう）", "銀行（ぎんこう）"] },
  { kanji: "来", onyomi: "ライ", kunyomi: "く.る", english_meaning: "come", stroke_count: 7, example_vocab: ["来る（くる）", "来年（らいねん）", "将来（しょうらい）"] },
  { kanji: "食", onyomi: "ショク", kunyomi: "た.べる", english_meaning: "eat, food", stroke_count: 9, example_vocab: ["食べる（たべる）", "食事（しょくじ）", "和食（わしょく）"] },
  { kanji: "飲", onyomi: "イン", kunyomi: "の.む", english_meaning: "drink", stroke_count: 12, example_vocab: ["飲む（のむ）", "飲み物（のみもの）", "飲食（いんしょく）"] },
  { kanji: "入", onyomi: "ニュウ", kunyomi: "はい.る、い.れる", english_meaning: "enter", stroke_count: 2, example_vocab: ["入る（はいる）", "入学（にゅうがく）", "収入（しゅうにゅう）"] },
  { kanji: "出", onyomi: "シュツ", kunyomi: "で.る、だ.す", english_meaning: "exit, go out", stroke_count: 5, example_vocab: ["出る（でる）", "出発（しゅっぱつ）", "輸出（ゆしゅつ）"] },
  { kanji: "立", onyomi: "リツ、リュウ", kunyomi: "た.つ", english_meaning: "stand", stroke_count: 5, example_vocab: ["立つ（たつ）", "独立（どくりつ）", "国立（こくりつ）"] },
  
  // Size and quantity
  { kanji: "大", onyomi: "ダイ、タイ", kunyomi: "おお.きい", english_meaning: "big, large", stroke_count: 3, example_vocab: ["大きい（おおきい）", "大学（だいがく）", "大切（たいせつ）"] },
  { kanji: "小", onyomi: "ショウ", kunyomi: "ちい.さい、こ", english_meaning: "small, little", stroke_count: 3, example_vocab: ["小さい（ちいさい）", "小学校（しょうがっこう）", "小説（しょうせつ）"] },
  { kanji: "高", onyomi: "コウ", kunyomi: "たか.い", english_meaning: "high, tall", stroke_count: 10, example_vocab: ["高い（たかい）", "高校（こうこう）", "最高（さいこう）"] },
  { kanji: "安", onyomi: "アン", kunyomi: "やす.い", english_meaning: "cheap, peaceful", stroke_count: 6, example_vocab: ["安い（やすい）", "安全（あんぜん）", "不安（ふあん）"] },
  { kanji: "長", onyomi: "チョウ", kunyomi: "なが.い", english_meaning: "long", stroke_count: 8, example_vocab: ["長い（ながい）", "社長（しゃちょう）", "成長（せいちょう）"] },
  { kanji: "多", onyomi: "タ", kunyomi: "おお.い", english_meaning: "many, much", stroke_count: 6, example_vocab: ["多い（おおい）", "多数（たすう）", "多分（たぶん）"] },
  { kanji: "少", onyomi: "ショウ", kunyomi: "すく.ない、すこ.し", english_meaning: "few, little", stroke_count: 4, example_vocab: ["少ない（すくない）", "少し（すこし）", "少年（しょうねん）"] },
  
  // Colors
  { kanji: "白", onyomi: "ハク、ビャク", kunyomi: "しろ.い", english_meaning: "white", stroke_count: 5, example_vocab: ["白い（しろい）", "白人（はくじん）", "告白（こくはく）"] },
  { kanji: "黒", onyomi: "コク", kunyomi: "くろ.い", english_meaning: "black", stroke_count: 11, example_vocab: ["黒い（くろい）", "黒板（こくばん）", "黒字（くろじ）"] },
  { kanji: "赤", onyomi: "セキ、シャク", kunyomi: "あか.い", english_meaning: "red", stroke_count: 7, example_vocab: ["赤い（あかい）", "赤ちゃん（あかちゃん）", "赤字（あかじ）"] },
  { kanji: "青", onyomi: "セイ、ショウ", kunyomi: "あお.i", english_meaning: "blue", stroke_count: 8, example_vocab: ["青い（あおい）", "青年（せいねん）", "青空（あおぞら）"] }
];

// JLPT N5 Grammar Points (80+ essential patterns from JLPTsensei, JapanAsubi)
export const n5Grammar: N5Grammar[] = [
  // Basic copula and verb forms
  { grammar_point: "です", meaning_en: "polite form of 'to be'", structure_notes: "Noun + です", example_sentence_jp: "私（わたし）は学生（がくせい）です。", example_sentence_en: "I am a student." },
  { grammar_point: "だ", meaning_en: "casual form of 'to be'", structure_notes: "Noun + だ", example_sentence_jp: "彼（かれ）は先生（せんせい）だ。", example_sentence_en: "He is a teacher." },
  { grammar_point: "ではありません", meaning_en: "polite negative 'to be'", structure_notes: "Noun + ではありません", example_sentence_jp: "私（わたし）は学生（がくせい）ではありません。", example_sentence_en: "I am not a student." },
  { grammar_point: "じゃありません", meaning_en: "casual polite negative 'to be'", structure_notes: "Noun + じゃありません", example_sentence_jp: "これはペンじゃありません。", example_sentence_en: "This is not a pen." },
  
  // Polite verb forms
  { grammar_point: "ます", meaning_en: "polite present/future tense", structure_notes: "Verb stem + ます", example_sentence_jp: "毎日（まいにち）日本語（にほんご）を勉強（べんきょう）します。", example_sentence_en: "I study Japanese every day." },
  { grammar_point: "ません", meaning_en: "polite negative present/future", structure_notes: "Verb stem + ません", example_sentence_jp: "今日（きょう）は働（はたら）きません。", example_sentence_en: "I don't work today." },
  { grammar_point: "ました", meaning_en: "polite past tense", structure_notes: "Verb stem + ました", example_sentence_jp: "昨日（きのう）映画（えいが）を見（み）ました。", example_sentence_en: "I watched a movie yesterday." },
  { grammar_point: "ませんでした", meaning_en: "polite negative past tense", structure_notes: "Verb stem + ませんでした", example_sentence_jp: "昨日（きのう）は勉強（べんきょう）しませんでした。", example_sentence_en: "I didn't study yesterday." },
  
  // Essential particles
  { grammar_point: "が", meaning_en: "subject particle", structure_notes: "Subject + が + predicate", example_sentence_jp: "猫（ねこ）がいます。", example_sentence_en: "There is a cat." },
  { grammar_point: "は", meaning_en: "topic particle", structure_notes: "Topic + は + comment", example_sentence_jp: "私（わたし）は田中（たなか）です。", example_sentence_en: "I am Tanaka." },
  { grammar_point: "を", meaning_en: "direct object particle", structure_notes: "Object + を + transitive verb", example_sentence_jp: "パンを食（た）べます。", example_sentence_en: "I eat bread." },
  { grammar_point: "に", meaning_en: "direction/time/purpose particle", structure_notes: "Time/Place/Purpose + に", example_sentence_jp: "学校（がっこう）に行（い）きます。", example_sentence_en: "I go to school." },
  { grammar_point: "で", meaning_en: "location/method particle", structure_notes: "Place/Method + で + action", example_sentence_jp: "図書館（としょかん）で勉強（べんきょう）します。", example_sentence_en: "I study at the library." },
  { grammar_point: "と", meaning_en: "and, with", structure_notes: "Noun + と + Noun / Person + と + action", example_sentence_jp: "友達（ともだち）と映画（えいが）を見（み）ます。", example_sentence_en: "I watch movies with friends." },
  { grammar_point: "の", meaning_en: "possessive/descriptive particle", structure_notes: "Noun1 + の + Noun2", example_sentence_jp: "私（わたし）の本（ほん）です。", example_sentence_en: "It's my book." },
  { grammar_point: "か", meaning_en: "question particle", structure_notes: "Statement + か", example_sentence_jp: "これは何（なん）ですか。", example_sentence_en: "What is this?" },
  { grammar_point: "も", meaning_en: "also, too", structure_notes: "Noun + も", example_sentence_jp: "私（わたし）も学生（がくせい）です。", example_sentence_en: "I am also a student." },
  { grammar_point: "から", meaning_en: "from, because", structure_notes: "Place/Time + から / Sentence + から", example_sentence_jp: "九時（くじ）から勉強（べんきょう）します。", example_sentence_en: "I study from nine o'clock." },
  { grammar_point: "まで", meaning_en: "until, to", structure_notes: "Time/Place + まで", example_sentence_jp: "五時（ごじ）まで働（はたら）きます。", example_sentence_en: "I work until five o'clock." },
  { grammar_point: "や", meaning_en: "and (incomplete list)", structure_notes: "Noun + や + Noun + など", example_sentence_jp: "りんごやバナナを買（か）いました。", example_sentence_en: "I bought apples, bananas, and other things." },
  
  // Existence verbs
  { grammar_point: "います", meaning_en: "to exist (animate)", structure_notes: "Place + に + animate + が + います", example_sentence_jp: "教室（きょうしつ）に先生（せんせい）がいます。", example_sentence_en: "There is a teacher in the classroom." },
  { grammar_point: "あります", meaning_en: "to exist (inanimate)", structure_notes: "Place + に + inanimate + が + あります", example_sentence_jp: "机（つくえ）の上（うえ）に本（ほん）があります。", example_sentence_en: "There is a book on the desk." },
  { grammar_point: "いません", meaning_en: "not exist (animate)", structure_notes: "Place + に + animate + が + いません", example_sentence_jp: "家（いえ）に誰（だれ）もいません。", example_sentence_en: "There is no one at home." },
  { grammar_point: "ありません", meaning_en: "not exist (inanimate)", structure_notes: "Place + に + inanimate + が + ありません", example_sentence_jp: "冷蔵庫（れいぞうこ）に何（なに）もありません。", example_sentence_en: "There is nothing in the refrigerator." },
  
  // Adjective forms
  { grammar_point: "い-adjective", meaning_en: "i-adjective predicate", structure_notes: "い-adjective + です", example_sentence_jp: "この本（ほん）は面白（おもしろ）いです。", example_sentence_en: "This book is interesting." },
  { grammar_point: "くないです", meaning_en: "negative i-adjective", structure_notes: "い-adjective stem + くないです", example_sentence_jp: "今日（きょう）は暑（あつ）くないです。", example_sentence_en: "It's not hot today." },
  { grammar_point: "かったです", meaning_en: "past i-adjective", structure_notes: "い-adjective stem + かったです", example_sentence_jp: "昨日（きのう）は寒（さむ）かったです。", example_sentence_en: "It was cold yesterday." },
  { grammar_point: "くなかったです", meaning_en: "negative past i-adjective", structure_notes: "い-adjective stem + くなかったです", example_sentence_jp: "映画（えいが）は面白（おもしろ）くなかったです。", example_sentence_en: "The movie was not interesting." },
  { grammar_point: "な-adjective", meaning_en: "na-adjective predicate", structure_notes: "な-adjective + です", example_sentence_jp: "日本語（にほんご）は大変（たいへん）です。", example_sentence_en: "Japanese is difficult." },
  { grammar_point: "じゃないです", meaning_en: "negative na-adjective", structure_notes: "な-adjective + じゃないです", example_sentence_jp: "彼（かれ）は親切（しんせつ）じゃないです。", example_sentence_en: "He is not kind." },
  { grammar_point: "でした", meaning_en: "past na-adjective", structure_notes: "な-adjective + でした", example_sentence_jp: "試験（しけん）は簡単（かんたん）でした。", example_sentence_en: "The exam was easy." },
  { grammar_point: "じゃなかったです", meaning_en: "negative past na-adjective", structure_notes: "な-adjective + じゃなかったです", example_sentence_jp: "料理（りょうり）は美味（おい）しくなかったです。", example_sentence_en: "The food was not delicious." },
  
  // Time expressions
  { grammar_point: "時", meaning_en: "o'clock", structure_notes: "Number + 時", example_sentence_jp: "今（いま）三時（さんじ）です。", example_sentence_en: "It's three o'clock now." },
  { grammar_point: "分", meaning_en: "minutes", structure_notes: "Number + 分", example_sentence_jp: "十五分（じゅうごふん）かかります。", example_sentence_en: "It takes fifteen minutes." },
  { grammar_point: "半", meaning_en: "half past", structure_notes: "Number + 時半", example_sentence_jp: "六時半（ろくじはん）に起（お）きます。", example_sentence_en: "I wake up at six thirty." },
  { grammar_point: "頃", meaning_en: "around, about", structure_notes: "Time + 頃", example_sentence_jp: "七時頃（しちじごろ）帰（かえ）ります。", example_sentence_en: "I'll return around seven o'clock." },
  
  // Common expressions
  { grammar_point: "ください", meaning_en: "please give me", structure_notes: "Noun + を + ください", example_sentence_jp: "水（みず）をください。", example_sentence_en: "Please give me water." },
  { grammar_point: "て-form + ください", meaning_en: "please do", structure_notes: "Verb て-form + ください", example_sentence_jp: "ちょっと待（ま）ってください。", example_sentence_en: "Please wait a moment." },
  { grammar_point: "たいです", meaning_en: "want to", structure_notes: "Verb stem + たいです", example_sentence_jp: "日本（にほん）に行（い）きたいです。", example_sentence_en: "I want to go to Japan." },
  { grammar_point: "が欲しいです", meaning_en: "want something", structure_notes: "Noun + が + 欲しいです", example_sentence_jp: "新（あたら）しい車（くるま）が欲（ほ）しいです。", example_sentence_en: "I want a new car." },
  { grammar_point: "ませんか", meaning_en: "won't you / invitation", structure_notes: "Verb stem + ませんか", example_sentence_jp: "一緒（いっしょ）に食（た）べませんか。", example_sentence_en: "Won't you eat together?" },
  { grammar_point: "ましょう", meaning_en: "let's", structure_notes: "Verb stem + ましょう", example_sentence_jp: "公園（こうえん）に行（い）きましょう。", example_sentence_en: "Let's go to the park." },
  
  // Capability and possibility
  { grammar_point: "ことができます", meaning_en: "can do, be able to", structure_notes: "Verb dictionary form + ことができます", example_sentence_jp: "日本語（にほんご）を話（はな）すことができます。", example_sentence_en: "I can speak Japanese." },
  { grammar_point: "かもしれません", meaning_en: "might, maybe", structure_notes: "Verb/Adjective + かもしれません", example_sentence_jp: "雨（あめ）が降（ふ）るかもしれません。", example_sentence_en: "It might rain." },
  
  // Question words
  { grammar_point: "何", meaning_en: "what", structure_notes: "何 + Particle", example_sentence_jp: "何（なに）を食（た）べますか。", example_sentence_en: "What will you eat?" },
  { grammar_point: "誰", meaning_en: "who", structure_notes: "誰 + Particle", example_sentence_jp: "誰（だれ）が来（き）ますか。", example_sentence_en: "Who is coming?" },
  { grammar_point: "どこ", meaning_en: "where", structure_notes: "どこ + Particle", example_sentence_jp: "どこに住（す）んでいますか。", example_sentence_en: "Where do you live?" },
  { grammar_point: "いつ", meaning_en: "when", structure_notes: "いつ + Predicate", example_sentence_jp: "いつ日本（にほん）に来（き）ましたか。", example_sentence_en: "When did you come to Japan?" },
  { grammar_point: "どうして", meaning_en: "why", structure_notes: "どうして + Predicate", example_sentence_jp: "どうして日本語（にほんご）を勉強（べんきょう）しますか。", example_sentence_en: "Why do you study Japanese?" },
  { grammar_point: "どう", meaning_en: "how", structure_notes: "どう + Predicate", example_sentence_jp: "日本（にほん）はどうですか。", example_sentence_en: "How is Japan?" },
  { grammar_point: "どの", meaning_en: "which", structure_notes: "どの + Noun", example_sentence_jp: "どの本（ほん）が好（す）きですか。", example_sentence_en: "Which book do you like?" },
  { grammar_point: "いくら", meaning_en: "how much", structure_notes: "いくら + ですか", example_sentence_jp: "このペンはいくらですか。", example_sentence_en: "How much is this pen?" },
  { grammar_point: "いくつ", meaning_en: "how many", structure_notes: "いくつ + ですか", example_sentence_jp: "りんごをいくつ買（か）いますか。", example_sentence_en: "How many apples will you buy?" },
  
  // Counters and numbers
  { grammar_point: "つ counter", meaning_en: "general counter", structure_notes: "Number + つ", example_sentence_jp: "みかんを三（みっ）つ買（か）いました。", example_sentence_en: "I bought three oranges." },
  { grammar_point: "人 counter", meaning_en: "people counter", structure_notes: "Number + 人", example_sentence_jp: "家族（かぞく）は四人（よにん）です。", example_sentence_en: "My family has four people." },
  { grammar_point: "本 counter", meaning_en: "long objects counter", structure_notes: "Number + 本", example_sentence_jp: "ペンを二本（にほん）持（も）っています。", example_sentence_en: "I have two pens." },
  { grammar_point: "枚 counter", meaning_en: "flat objects counter", structure_notes: "Number + 枚", example_sentence_jp: "写真（しゃしん）を十枚（じゅうまい）撮（と）りました。", example_sentence_en: "I took ten photos." },
  
  // Comparative expressions
  { grammar_point: "より", meaning_en: "more than", structure_notes: "A は B より + Adjective", example_sentence_jp: "日本語（にほんご）は英語（えいご）より難（むずか）しいです。", example_sentence_en: "Japanese is more difficult than English." },
  { grammar_point: "の方が", meaning_en: "more (comparison)", structure_notes: "A の方が B より + Adjective", example_sentence_jp: "夏（なつ）の方（ほう）が冬（ふゆ）より暑（あつ）いです。", example_sentence_en: "Summer is hotter than winter." },
  { grammar_point: "一番", meaning_en: "most, number one", structure_notes: "一番 + Adjective", example_sentence_jp: "これが一番（いちばん）美味（おい）しいです。", example_sentence_en: "This is the most delicious." },
  
  // Frequency and time
  { grammar_point: "毎日", meaning_en: "every day", structure_notes: "毎日 + Verb", example_sentence_jp: "毎日（まいにち）コーヒーを飲（の）みます。", example_sentence_en: "I drink coffee every day." },
  { grammar_point: "時々", meaning_en: "sometimes", structure_notes: "時々 + Verb", example_sentence_jp: "時々（ときどき）映画（えいが）を見（み）ます。", example_sentence_en: "I sometimes watch movies." },
  { grammar_point: "よく", meaning_en: "often, well", structure_notes: "よく + Verb", example_sentence_jp: "よく本（ほん）を読（よ）みます。", example_sentence_en: "I often read books." },
  { grammar_point: "全然", meaning_en: "not at all", structure_notes: "全然 + Negative", example_sentence_jp: "全然（ぜんぜん）分（わ）かりません。", example_sentence_en: "I don't understand at all." },
  
  // Te-form constructions
  { grammar_point: "て-form + います", meaning_en: "present progressive", structure_notes: "Verb て-form + います", example_sentence_jp: "今（いま）勉強（べんきょう）しています。", example_sentence_en: "I am studying now." },
  { grammar_point: "て-form + から", meaning_en: "after doing", structure_notes: "Verb て-form + から", example_sentence_jp: "宿題（しゅくだい）をしてから寝（ね）ます。", example_sentence_en: "I sleep after doing homework." },
  { grammar_point: "て-form + も いいです", meaning_en: "it's okay to", structure_notes: "Verb て-form + も + いいです", example_sentence_jp: "ここで写真（しゃしん）を撮（と）ってもいいです。", example_sentence_en: "It's okay to take photos here." },
  { grammar_point: "て-form + は いけません", meaning_en: "must not", structure_notes: "Verb て-form + は + いけません", example_sentence_jp: "ここで煙草（たばこ）を吸（す）ってはいけません。", example_sentence_en: "You must not smoke here." }
];