import useSWR from 'swr';
import type {
  DashboardData,
  DateRange,
  LoadingState,
  ApiError,
} from '@/types/rescuetime';
import { fetchDashboardData, getDateRanges } from './rescuetime';

// SWR fetcher function
const dashboardFetcher = ([startDate, endDate]: [Date, Date]): Promise<DashboardData> => {
  return fetchDashboardData(startDate, endDate);
};

// Custom hook for RescueTime dashboard data
export const useRescueTime = (dateRange?: DateRange) => {
  const ranges = getDateRanges();
  const range = dateRange || ranges.last7Days;
  
  const { data, error, isLoading, mutate } = useSWR(
    range ? [range.start, range.end] : null,
    dashboardFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  const loadingState: LoadingState = isLoading 
    ? 'loading' 
    : error 
    ? 'error' 
    : data 
    ? 'success' 
    : 'idle';

  return {
    data,
    error: error as ApiError | undefined,
    isLoading,
    loadingState,
    mutate,
    // Convenience getters
    summary: data?.summary || [],
    productivity: data?.productivity || [],
    categories: data?.categories || [],
  };
};

// Hook for specific date ranges
export const useRescueTimeToday = () => {
  const ranges = getDateRanges();
  return useRescueTime(ranges.today);
};

export const useRescueTimeWeek = () => {
  const ranges = getDateRanges();
  return useRescueTime(ranges.last7Days);
};

export const useRescueTimeMonth = () => {
  const ranges = getDateRanges();
  return useRescueTime(ranges.last30Days);
};

// Utility hook for localStorage persistence
export const usePersistedDateRange = (key: string = 'rescuetime-date-range') => {
  const ranges = getDateRanges();
  
  const getStoredRange = (): DateRange => {
    if (typeof window === 'undefined') return ranges.last7Days;
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          start: new Date(parsed.start),
          end: new Date(parsed.end),
        };
      }
    } catch (error) {
      console.warn('Failed to parse stored date range:', error);
    }
    
    return ranges.last7Days;
  };
  
  const setStoredRange = (range: DateRange) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      }));
    } catch (error) {
      console.warn('Failed to store date range:', error);
    }
  };
  
  return {
    getStoredRange,
    setStoredRange,
  };
};

// Hook for chart data transformations
export const useChartData = (data: DashboardData | undefined) => {
  if (!data) return null;

  // Transform category data for pie chart
  const categoryChartData = data.categories
    .reduce((acc, item) => {
      const existing = acc.find(c => c.name === item.category);
      if (existing) {
        existing.value += item.seconds;
        existing.hours = Math.round((existing.value / 3600) * 100) / 100;
      } else {
        acc.push({
          name: item.category,
          value: item.seconds,
          hours: Math.round((item.seconds / 3600) * 100) / 100,
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; hours: number; }>)
    .sort((a, b) => b.value - a.value);

  // Calculate percentages for pie chart
  const totalCategoryTime = categoryChartData.reduce((sum, item) => sum + item.value, 0);
  const categoryPieData = categoryChartData.map(item => ({
    ...item,
    percentage: totalCategoryTime > 0 ? Math.round((item.value / totalCategoryTime) * 10000) / 100 : 0,
  }));

  // Transform productivity data for line chart
  const productivityTrendData = data.summary.map(day => {
    const productivityForDay = data.productivity
      .filter(p => p.date === day.date)
      .reduce((acc, p) => acc + (p.productivityScore * p.seconds), 0);
    
    const totalSecondsForDay = data.productivity
      .filter(p => p.date === day.date)
      .reduce((acc, p) => acc + p.seconds, 0);

    return {
      date: day.date,
      score: totalSecondsForDay > 0 ? Math.round((productivityForDay / totalSecondsForDay) * 100) / 100 : 0,
      hours: day.totalHours,
    };
  });

  return {
    categoryChartData,
    categoryPieData,
    productivityTrendData,
  };
};