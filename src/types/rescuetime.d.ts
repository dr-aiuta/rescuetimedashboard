// RescueTime API Response Types

export interface DailySummaryResponse {
  notes: string;
  rows: Array<[string, number, string]>; // [date, seconds, notes]
}

export interface ProductivityDataResponse {
  notes: string;
  rows: Array<[string, number, number, string, number]>; // [date, seconds, people, activity, productivity]
}

export interface AnalyticDataResponse {
  notes: string;
  rows: Array<[string, number, number, string, string]>; // [date, seconds, people, activity, category]
}

// Normalized DTOs
export interface DailySummary {
  date: string;
  totalSeconds: number;
  totalHours: number;
  notes?: string;
}

export interface ProductivityData {
  date: string;
  activity: string;
  seconds: number;
  hours: number;
  productivityScore: number;
  category?: string;
}

export interface CategoryData {
  date: string;
  category: string;
  seconds: number;
  hours: number;
  activity: string;
  percentage?: number;
}

export interface DashboardData {
  summary: DailySummary[];
  productivity: ProductivityData[];
  categories: CategoryData[];
}

// API Query Parameters
export interface RescueTimeQuery {
  perspective: 'rank' | 'interval';
  resolution_time: 'day' | 'week' | 'month';
  restrict_begin?: string; // YYYY-MM-DD
  restrict_end?: string; // YYYY-MM-DD
  restrict_kind?: 'category' | 'activity' | 'productivity';
  format: 'json';
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  hours?: number;
  percentage?: number;
}

export interface ProductivityTrendPoint {
  date: string;
  score: number;
  hours: number;
}

// UI State Types
export interface DateRange {
  start: Date;
  end: Date;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  status?: number;
  endpoint?: string;
}