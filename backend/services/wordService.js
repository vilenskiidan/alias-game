const fs = require('fs').promises;
const path = require('path');

class WordService {
  constructor() {
    this.words = [];
    this.shuffledWords = [];
    this.currentIndex = 0;
    this.wordFilePath = path.join(__dirname, '../data/hebrew-words.txt');
  }

  async loadWords() {
    try {
      // Check if file exists
      await fs.access(this.wordFilePath);
      
      // Read and parse words
      const data = await fs.readFile(this.wordFilePath, 'utf8');
      this.words = data
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .filter(word => !word.startsWith('#')); // Allow comments in file
      
      if (this.words.length === 0) {
        throw new Error('No words found in word file');
      }

      console.log(`Loaded ${this.words.length} Hebrew words`);
      this.shuffleWords();
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('Word file not found, creating with sample words...');
        await this.createSampleWordFile();
        await this.loadWords(); // Retry loading
      } else {
        throw error;
      }
    }
  }

  async createSampleWordFile() {
    const sampleWords = [
      '# Hebrew Words for Alias Game',
      '# One word per line, lines starting with # are comments',
      'אבטיח', 'אגס', 'אוזן', 'אווירון', 'אוטובוס', 'אוכל', 'אופניים', 'אייל', 'אילנית', 'אמא',
      'אמש', 'אננס', 'אריה', 'אשכולית', 'אש', 'בובה', 'בולען', 'בועה', 'בית חולים', 'בית ספר',
      'בלון', 'ברווז', 'בריכה', 'בשורה', 'גדר', 'גז', 'גזר', 'גלקסיה', 'גרב', 'גרזן',
      'גשם', 'דבורה', 'דג', 'דגל', 'דלת', 'דלי', 'דניס', 'דרך', 'הפתעה', 'הצגה',
      'הר געש', 'הר', 'ואזה', 'וזלין', 'וטרן', 'זבוב', 'זברה', 'זכוכית', 'זמן', 'זנב',
      'חגורה', 'חדר כושר', 'חולצה', 'חול', 'חורף', 'חטיף', 'חלב', 'חמסין', 'חנוכייה', 'חציל',
      'חרב', 'חרמון', 'חתול', 'טלוויזיה', 'טלפון', 'טנא', 'טניס', 'טוסיק', 'טוסט', 'יומן',
      'יונה', 'ים', 'ינשוף', 'ירח', 'כדורגל', 'כדורסל', 'כדור', 'כובע', 'כוכב', 'כולסטרול',
      'כותנה', 'כינור', 'כיתה', 'כפכף', 'כרית', 'לב', 'לבנה', 'לוח שנה', 'לחם', 'לימון',
      'לילה', 'ליצן', 'לשון', 'מגבת', 'מגן דוד', 'מדורה', 'מזגן', 'מזרן', 'מטחנה', 'מטרייה',
      'מכונית', 'מכנסיים', 'מלפפון', 'מלקחיים', 'מנגינה', 'מסך', 'מסיבה', 'מסעדה', 'מעגל', 'מעיל',
      'מפל', 'מפת שולחן', 'מצנח', 'מצרך', 'מקבוק', 'מרפק', 'מרתון', 'משאית', 'משקפת', 'מתנה',
      'נחש', 'נסיעה', 'נעל', 'נר', 'נשר', 'נתב"ג', 'סבון', 'סדין', 'סוכה', 'סכין',
      'סל', 'סלט', 'סלע', 'סנאי', 'סנדוויץ', 'ספל', 'ספרייה', 'סרגל', 'סתיו', 'עגבנייה',
      'עוגה', 'עוף', 'עורב', 'עזה', 'עין', 'עיפרון', 'עיתון', 'עלה', 'עסק', 'עץ דקל',
      'עץ', 'פחית', 'פיל', 'פיצה', 'פלפל', 'פסל', 'פסטה', 'פקק', 'פנס', 'פנים',
      'פסטיבל', 'פרגולה', 'פרח', 'פרפר', 'פרצוף', 'ציפור', 'צוק', 'צוללת', 'צחוק', 'צבע',
      'צדף', 'צמח', 'צמיד', 'צנצנת', 'צפרדע', 'קוביה', 'קולנוע', 'קור', 'קטן', 'קיר',
      'קשת', 'קלמר', 'קניון', 'קפיץ', 'קפה', 'קש', 'קצת', 'ראש', 'רוח', 'ריח',
      'ריקוד', 'רמזור', 'רמקול', 'רעש', 'רפסודה', 'רפסיה', 'רכב', 'רעב', 'ריצה', 'רכבת',
      'רמפה', 'רעיון', 'שאול', 'שוקולד', 'שולחן', 'שועל', 'שוק', 'שופר', 'שיער', 'שטר',
      'שמשיה', 'שמש', 'שן', 'שנה', 'שניצל', 'שעון', 'שפם', 'שפן', 'שקד', 'שקית',
      'שרוך', 'שש בש', 'שתייה', 'תאנה', 'תבור', 'תאטרון', 'תבשיל', 'תג', 'תיק', 'תינוק',
      'תמר', 'תמונה', 'תנין', 'תנור', 'תקרה', 'תקווה', 'תרמוס', 'תרנגול'
    ].join('\n');

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.wordFilePath);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write sample file
    await fs.writeFile(this.wordFilePath, sampleWords, 'utf8');
    console.log(`Created sample word file at: ${this.wordFilePath}`);
  }

  shuffleWords() {
    this.shuffledWords = [...this.words];
    
    // Fisher-Yates shuffle
    for (let i = this.shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledWords[i], this.shuffledWords[j]] = [this.shuffledWords[j], this.shuffledWords[i]];
    }
    
    this.currentIndex = 0;
    console.log(`Shuffled ${this.shuffledWords.length} words`);
  }

  getNextWord() {
    if (this.shuffledWords.length === 0) {
      throw new Error('No words available');
    }

    // If we've used all words, reshuffle
    if (this.currentIndex >= this.shuffledWords.length) {
      this.shuffleWords();
    }

    const word = this.shuffledWords[this.currentIndex];
    this.currentIndex++;
    
    return {
      word,
      remaining: this.shuffledWords.length - this.currentIndex,
      total: this.shuffledWords.length
    };
  }

  getBatchWords(count = 10) {
    const words = [];
    for (let i = 0; i < count; i++) {
      try {
        words.push(this.getNextWord().word);
      } catch (error) {
        break; // No more words available
      }
    }
    return words;
  }

  getWordCount() {
    return this.words.length;
  }

  getStats() {
    return {
      totalWords: this.words.length,
      remainingInShuffle: Math.max(0, this.shuffledWords.length - this.currentIndex),
      currentIndex: this.currentIndex,
      shuffleComplete: this.currentIndex >= this.shuffledWords.length
    };
  }

  // Admin method to reload words from file
  async reloadWords() {
    console.log('Reloading words from file...');
    await this.loadWords();
    return this.getStats();
  }
}

module.exports = new WordService();