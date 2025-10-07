const fs = require('fs').promises;
const path = require('path');

class WordService {
  constructor() {
    this.wordFilePath = path.join(__dirname, '../data/words.json');
    this.wordsByLanguage = {}; // { lang: [words] }
    this.shuffleState = {}; // { lang: { words: [], index: 0 } }
  }

  async loadWords() {
    try {
      const fileContent = await fs.readFile(this.wordFilePath, 'utf8');
      const parsed = JSON.parse(fileContent);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Word file is not a valid JSON object');
      }

      const languages = Object.keys(parsed);
      if (languages.length === 0) {
        throw new Error('Word file does not contain any languages');
      }

      this.wordsByLanguage = {};
      this.shuffleState = {};

      for (const language of languages) {
        const entries = (parsed[language] || [])
          .map(word => (typeof word === 'string' ? word.trim() : ''))
          .filter(Boolean);

        if (entries.length === 0) {
          throw new Error(`No words found for language: ${language}`);
        }

        this.wordsByLanguage[language] = entries;
        this.shuffleState[language] = {
          words: this.shuffle(entries),
          index: 0
        };

        console.log(`Loaded ${entries.length} words for language "${language}"`);
      }
    } catch (error) {
      console.error('Failed to load words:', error.message);
      throw error;
    }
  }

  shuffle(source) {
    const words = [...source];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  }

  ensureLanguage(language) {
    if (!this.wordsByLanguage[language]) {
      throw new Error(`Unsupported language: ${language}`);
    }
  }

  getNextWord(language = 'he') {
    this.ensureLanguage(language);
    const state = this.shuffleState[language];

    if (!state || state.words.length === 0) {
      throw new Error('Word pool is empty');
    }

    if (state.index >= state.words.length) {
      state.words = this.shuffle(this.wordsByLanguage[language]);
      state.index = 0;
    }

    const word = state.words[state.index];
    state.index += 1;

    return {
      word,
      remaining: state.words.length - state.index,
      total: state.words.length,
      language
    };
  }

  getBatchWords(count = 10, language = 'he') {
    this.ensureLanguage(language);
    const source = this.wordsByLanguage[language];
    if (count >= source.length) {
      return [...source];
    }
    return this.shuffle(source).slice(0, count);
  }

  getWordCount(language = 'he') {
    this.ensureLanguage(language);
    return this.wordsByLanguage[language].length;
  }

  getStats(language = 'he') {
    this.ensureLanguage(language);
    const state = this.shuffleState[language];
    return {
      language,
      totalWords: this.wordsByLanguage[language].length,
      remainingInShuffle: Math.max(0, state.words.length - state.index),
      currentIndex: state.index,
      shuffleComplete: state.index >= state.words.length
    };
  }

  async reloadWords() {
    console.log('Reloading word pools from disk...');
    await this.loadWords();
    return Object.keys(this.wordsByLanguage).map(lang => this.getStats(lang));
  }
}

module.exports = new WordService();
