import type {
  DailySummaryResponse,
  ProductivityDataResponse,
  AnalyticDataResponse,
  DailySummary,
  ProductivityData,
  CategoryData,
  DashboardData,
  ApiError,
} from '@/types/rescuetime';

const RESCUETIME_BASE_URL = 'https://www.rescuetime.com/anapi';

// Utility function to format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generic fetch function for RescueTime API
export const fetchRT = async <T>(
  endpoint: string,
  query: Record<string, string>
): Promise<T> => {
  const apiKey = process.env.RESCUETIME_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESCUETIME_API_KEY environment variable is not set');
  }

  const url = new URL(`${RESCUETIME_BASE_URL}/${endpoint}`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('format', 'json');
  
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const error: ApiError = {
        message: `RescueTime API error: ${response.status} ${response.statusText}`,
        status: response.status,
        endpoint,
      };
      throw error;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
        endpoint,
      };
      throw apiError;
    }
    throw error;
  }
};

// Fetch daily summary data
export const fetchDailySummary = async (
  startDate: Date,
  endDate: Date
): Promise<DailySummary[]> => {
  const query = {
    perspective: 'interval' as const,
    resolution_time: 'day' as const,
    restrict_begin: formatDate(startDate),
    restrict_end: formatDate(endDate),
  };

  const response = await fetchRT<DailySummaryResponse>('daily_summary_feed', query);
  
  return response.rows.map(([date, seconds, notes]) => ({
    date,
    totalSeconds: seconds,
    totalHours: Math.round((seconds / 3600) * 100) / 100,
    notes: notes || undefined,
  }));
};

// Fetch productivity data
export const fetchProductivityData = async (
  startDate: Date,
  endDate: Date
): Promise<ProductivityData[]> => {
  const query = {
    perspective: 'interval' as const,
    resolution_time: 'day' as const,
    restrict_begin: formatDate(startDate),
    restrict_end: formatDate(endDate),
    restrict_kind: 'productivity' as const,
  };

  const response = await fetchRT<ProductivityDataResponse>('data', query);
  
  return response.rows.map(([date, seconds, , activity, productivity]) => ({
    date,
    activity,
    seconds,
    hours: Math.round((seconds / 3600) * 100) / 100,
    productivityScore: productivity,
  }));
};

// Fetch category data
export const fetchCategoryData = async (
  startDate: Date,
  endDate: Date
): Promise<CategoryData[]> => {
  const query = {
    perspective: 'rank' as const,
    resolution_time: 'day' as const,
    restrict_begin: formatDate(startDate),
    restrict_end: formatDate(endDate),
    restrict_kind: 'category' as const,
  };

  const response = await fetchRT<AnalyticDataResponse>('data', query);
  
  const categoryData = response.rows.map(([date, seconds, , activity, category]) => ({
    date,
    category,
    seconds,
    hours: Math.round((seconds / 3600) * 100) / 100,
    activity,
  }));

  // Calculate percentages
  const totalSeconds = categoryData.reduce((sum, item) => sum + item.seconds, 0);
  return categoryData.map(item => ({
    ...item,
    percentage: totalSeconds > 0 ? Math.round((item.seconds / totalSeconds) * 10000) / 100 : 0,
  }));
};

// Aggregate function to fetch all dashboard data
export const fetchDashboardData = async (
  startDate: Date,
  endDate: Date
): Promise<DashboardData> => {
  try {
    const [summary, productivity, categories] = await Promise.all([
      fetchDailySummary(startDate, endDate),
      fetchProductivityData(startDate, endDate),
      fetchCategoryData(startDate, endDate),
    ]);

    return {
      summary,
      productivity,
      categories,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Utility functions for date ranges
export const getDateRanges = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  return {
    today: { start: today, end: today },
    yesterday: { start: yesterday, end: yesterday },
    last7Days: { start: weekAgo, end: today },
    last30Days: { start: monthAgo, end: today },
  };
};