
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

// Calculate Levenshtein distance
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// Check if two words are similar enough
const isWordMatch = (source: string, target: string): boolean => {
  if (source === target) return true;
  
  const len = Math.max(source.length, target.length);
  const dist = levenshteinDistance(source, target);
  
  // Very short words (<= 3 chars) must match exactly (e.g. 'is' vs 'in')
  if (target.length <= 3) return dist === 0;
  
  // Short words (4-5 chars) allow max 1 error (e.g. 'cook' vs 'could' -> dist 2 -> Fail)
  if (target.length <= 5) return dist <= 1;

  // Longer words allow slightly more flexibility but tighter than before (0.8 instead of 0.7)
  const similarity = 1 - (dist / len);
  return similarity >= 0.8; 
};

export const checkAnswerLocally = (userInput: string, questionData: Question): boolean => {
  const normalizedInput = normalizeText(userInput);
  const inputWords = normalizedInput.split(/\s+/).filter(w => w.length > 0);
  
  const allAnswers = [questionData.main_answer, ...questionData.variations];
  
  for (const answer of allAnswers) {
    const normalizedTarget = normalizeText(answer);
    const targetWords = normalizedTarget.split(/\s+/).filter(w => w.length > 0);

    if (targetWords.length === 0) continue;

    let matchedCount = 0;
    // Clone input words to mark them as consumed so we don't match one input word to multiple target words
    const availableInputWords = [...inputWords];

    for (const tWord of targetWords) {
      const matchIndex = availableInputWords.findIndex(iWord => isWordMatch(iWord, tWord));
      if (matchIndex !== -1) {
        matchedCount++;
        availableInputWords.splice(matchIndex, 1); // Remove consumed word
      }
    }

    // Calculate coverage percentage
    // How many important words from the target did the user say?
    const coverage = matchedCount / targetWords.length;

    // Strict threshold: Must match at least 95% of the words in the target sentence
    // This forces almost perfect matches locally. Any missing adjectives/nouns will fail 
    // this check and be sent to AI for a smarter evaluation.
    if (coverage >= 0.9) {
      return true;
    }
  }

  return false;
};
