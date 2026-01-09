import { ContractAnalysis } from '../types';

const STORAGE_KEY = 'contract_review_history';

export const saveToHistory = (analysis: ContractAnalysis): void => {
  try {
    const existing = getHistory();
    const updated = [analysis, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getHistory = (): ContractAnalysis[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};
