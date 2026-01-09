export type RiskLevel = 'high' | 'medium' | 'low';

export type PartyPerspective = 'disclosing' | 'receiving' | null;

export interface ClauseInsight {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  category: string;
  riskLevel: RiskLevel;
  quote: string;
  insight: string;
  suggestedChange: string;
}

export interface ContractAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  perspective: PartyPerspective;
  summary: string;
  insights: ClauseInsight[];
  timestamp: number;
}

export type SortOption = 'clause' | 'risk';

export type Step = 'upload' | 'context' | 'results';
