import type {
  DailySummaryResponse,
  ProductivityDataResponse,
  AnalyticDataResponse,
  DailySummary,
  ProductivityData,
  CategoryData,
  DashboardData,
  ApiError,
} from "@/types/rescuetime";

const RESCUETIME_BASE_URL = "https://www.rescuetime.com/anapi";

// Utility function to format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Generic fetch function for RescueTime API
export const fetchRT = async <T>(
  endpoint: string,
  query: Record<string, string>
): Promise<T> => {
  const apiKey = process.env.RESCUETIME_API_KEY;

  if (!apiKey) {
    throw new Error("RESCUETIME_API_KEY environment variable is not set");
  }

  const url = new URL(`${RESCUETIME_BASE_URL}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("format", "json");

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
    console.error(`Error in fetchRT for endpoint ${endpoint}:`, error);
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
    perspective: "interval" as const,
    resolution_time: "day" as const,
    restrict_begin: formatDate(startDate),
    restrict_end: formatDate(endDate),
  };

  const response = await fetchRT<any>("daily_summary_feed", query);

  // Check if response exists
  if (!response) {
    console.error("fetchDailySummary: Response is null or undefined");
    return [];
  }

  // The daily_summary_feed endpoint returns an array directly, not a rows property
  if (Array.isArray(response)) {
    return response.map((item: any) => ({
      date: item.date,
      totalSeconds: Math.round(item.total_hours * 3600),
      totalHours: item.total_hours,
      notes: null,
    }));
  }

  // Fallback: check if it has the rows structure
  if (response.rows && Array.isArray(response.rows)) {
    return response.rows.map(
      ([date, seconds, notes]: [string, number, string]) => ({
        date,
        totalSeconds: seconds,
        totalHours: Math.round((seconds / 3600) * 100) / 100,
        notes: notes || null,
      })
    );
  }

  console.error("fetchDailySummary: Unexpected response structure:", response);
  return [];
};

// Fetch productivity data
export const fetchProductivityData = async (
  startDate: Date,
  endDate: Date
): Promise<ProductivityData[]> => {
  const query = {
    perspective: "interval" as const,
    resolution_time: "day" as const,
    restrict_begin: formatDate(startDate),
    restrict_end: formatDate(endDate),
    restrict_kind: "productivity" as const,
  };

  const response = await fetchRT<ProductivityDataResponse>("data", query);

  if (!response || !response.rows || !Array.isArray(response.rows)) {
    console.error(
      "fetchProductivityData: Invalid response structure",
      response
    );
    return [];
  }

  return response.rows.map((row: any[]) => {
    // Handle different possible row structures
    const [first, seconds, third, fourth, fifth] = row;

    return {
      date:
        typeof first === "string"
          ? first
          : startDate.toISOString().split("T")[0],
      activity: typeof fourth === "string" ? fourth : "Unknown",
      seconds: typeof seconds === "number" ? seconds : 0,
      hours: Math.round((seconds / 3600) * 100) / 100,
      productivityScore: typeof fifth === "number" ? fifth : null, // Use null instead of undefined
    };
  });
};

// Fetch category data
export const fetchCategoryData = async (
  startDate: Date,
  endDate: Date
): Promise<CategoryData[]> => {
  const query = {
    perspective: "rank" as const,
    resolution_time: "day" as const,
    restrict_begin: formatDate(startDate),
    restrict_end: formatDate(endDate),
    restrict_kind: "category" as const,
  };

  const response = await fetchRT<AnalyticDataResponse>("data", query);

  if (!response || !response.rows || !Array.isArray(response.rows)) {
    console.error("fetchCategoryData: Invalid response structure", response);
    return [];
  }

  const categoryData = response.rows.map(
    ([rank, seconds, people, category]) => ({
      date: formatDate(startDate), // Categories are aggregated, so use the start date
      category,
      seconds,
      hours: Math.round((seconds / 3600) * 100) / 100,
      activity: category, // For categories, the activity is the same as category
    })
  );

  // Calculate percentages
  const totalSeconds = categoryData.reduce(
    (sum, item) => sum + item.seconds,
    0
  );
  return categoryData.map((item) => ({
    ...item,
    percentage:
      totalSeconds > 0
        ? Math.round((item.seconds / totalSeconds) * 10000) / 100
        : 0,
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
    console.error("Error fetching dashboard data:", error);
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
