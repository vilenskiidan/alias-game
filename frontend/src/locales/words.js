import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../api/client';

const WORD_BATCH_SIZE = 1000;

const shuffle = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const useWordPool = (language = 'he') => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInFlight = useRef(false);
  const latestWordsRef = useRef(words);

  useEffect(() => {
    latestWordsRef.current = words;
  }, [words]);

  const fetchWords = useCallback(async () => {
    if (fetchInFlight.current) {
      return latestWordsRef.current;
    }

    fetchInFlight.current = true;
    setIsLoading(true);

    try {
      const response = await apiClient.get(`/api/words/batch/${WORD_BATCH_SIZE}`, {
        params: { lang: language }
      });
      const incoming = Array.isArray(response.data?.words) ? response.data.words : [];
      const sanitized = incoming
        .map(word => (typeof word === 'string' ? word.trim() : ''))
        .filter(Boolean);

      const shuffled = shuffle(sanitized);
      setWords(shuffled);
      setCurrentIndex(0);
      setError(null);
      latestWordsRef.current = shuffled;
      return shuffled;
    } catch (err) {
      setError(err);
      return latestWordsRef.current;
    } finally {
      fetchInFlight.current = false;
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const ensureWordsSync = useCallback(() => {
    if (latestWordsRef.current.length === 0 && !fetchInFlight.current) {
      fetchWords();
    }
    return latestWordsRef.current;
  }, [fetchWords]);

  const ensureReady = useCallback(async () => {
    if (latestWordsRef.current.length === 0) {
      await fetchWords();
    }
    return latestWordsRef.current;
  }, [fetchWords]);

  const getCurrentWord = useCallback(() => {
    const current = ensureWordsSync();
    if (!current.length) {
      return '';
    }
    if (currentIndex >= current.length) {
      return current[0];
    }
    return current[currentIndex];
  }, [currentIndex, ensureWordsSync]);

  const getNextWord = useCallback(() => {
    const current = ensureWordsSync();
    if (!current.length) {
      return '';
    }

    const nextIndex = (currentIndex + 1) % current.length;
    const value = current[nextIndex];
    setCurrentIndex(nextIndex);

    if (nextIndex === 0) {
      // Refresh the pool asynchronously for a fresh shuffle
      fetchWords();
    }

    return value;
  }, [currentIndex, ensureWordsSync, fetchWords]);

  const getCurrentWordValue = useCallback(() => {
    const current = ensureWordsSync();
    if (!current.length) {
      return '';
    }
    return current[currentIndex] || current[0];
  }, [currentIndex, ensureWordsSync]);

  const initializeWords = useCallback(async () => {
    const current = latestWordsRef.current;
    if (!current.length) {
      await fetchWords();
    } else {
      const reshuffled = shuffle(current);
      setWords(reshuffled);
      latestWordsRef.current = reshuffled;
      setCurrentIndex(0);
    }
  }, [fetchWords]);

  return {
    initializeWords,
    getNextWord,
    getCurrentWord: getCurrentWordValue,
    currentWord: getCurrentWordValue(),
    remainingWords: Math.max(0, latestWordsRef.current.length - currentIndex - 1),
    isLoading,
    error,
    isReady: latestWordsRef.current.length > 0 && !isLoading,
    ensureReady
  };
};
