/**
 * Represents an audit observation
 */
export interface Observation {
  observationId: number;
  date: string;
  chapter: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Complied';
  description: string;
}

/**
 * Statistics for a specific chapter
 */
export interface ChapterStats {
  chapter: string;
  total: number;
  open: number;
  complied: number;
  complianceRate: number;
}

/**
 * Monthly observation count by status
 */
export interface MonthlyCount {
  month: string;
  status: string;
  count: number;
}

/**
 * Matrix of chapters and severity counts for heatmap
 */
export interface ChapterSeverityMatrix {
  chapter: string;
  Low: number;
  Medium: number;
  High: number;
}

/**
 * Monthly data breakdown by chapter
 */
export interface ChapterMonthlyData {
  month: string;
  chapter: string;
  count: number;
}