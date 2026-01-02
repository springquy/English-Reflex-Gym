
import { FILLER_WORDS, CONTRACTIONS } from '../constants';
import { Question } from '../types';

export const normalizeText = (text: string): string => {
  let normalized = text.toLowerCase();
  // Remove punctuation
  normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  // Split into words
  let words = normalized.split(/\s+/);
  // Remove filler words
  words = words.filter(w => !FILLER_WORDS.includes(w));
  // Expand contractions
  const expandedWords = words.map(word => CONTRACTIONS[word] || word);
  return expandedWords.join(" ").trim();
};

export const checkAnswerLocally = (userInput: string, questionData: Question): boolean => {
  const normalizedInput = normalizeText(userInput);
  const allAnswers = [questionData.main_answer, ...questionData.variations];
  
  // Exact Match (normalized)
  const isMatch = allAnswers.some(ans => normalizeText(ans) === normalizedInput);
  if (isMatch) return true;

  // Word overlap matching (Fuzzy)
  const mainAnswerNorm = normalizeText(questionData.main_answer);
  const inputWords = normalizedInput.split(' ');
  const targetWords = mainAnswerNorm.split(' ');

  if (targetWords.length === 0) return false;

  const matchedCount = inputWords.reduce((count, word) => {
    return targetWords.includes(word) ? count + 1 : count;
  }, 0);

  // If sentence is short (<= 3 words), require high accuracy. If long, allow some leeway.
  const threshold = targetWords.length <= 3 ? 0.99 : 0.75;
  return matchedCount / targetWords.length >= threshold;
};
