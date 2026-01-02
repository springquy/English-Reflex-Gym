
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

  // Word overlap matching (Fuzzy) but STRICTER
  const mainAnswerNorm = normalizeText(questionData.main_answer);
  const inputWords = normalizedInput.split(' ').filter(w => w.length > 0);
  const targetWords = mainAnswerNorm.split(' ').filter(w => w.length > 0);

  if (targetWords.length === 0) return false;

  const matchedCount = inputWords.reduce((count, word) => {
    return targetWords.includes(word) ? count + 1 : count;
  }, 0);

  // Use the maximum length to penalize adding extra incorrect words
  // e.g., Target: "Check please" (2) vs Input: "Check my pill please" (4)
  // Matched: 2. Max Length: 4. Accuracy: 0.5. Result: Fail.
  const maxLength = Math.max(inputWords.length, targetWords.length);
  const accuracy = matchedCount / maxLength;

  // If sentence is short (<= 3 words), require very high accuracy (0.9). 
  // If long, allow slightly more leeway (0.8) but still strict.
  const threshold = targetWords.length <= 3 ? 0.9 : 0.8;
  return accuracy >= threshold;
};
