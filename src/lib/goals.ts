import type {
  Goal,
  GoalStatus,
  GoalProgress,
  DashboardData,
  CategoryData,
  ProductivityData,
} from '@/types/rescuetime';

// Sample goals based on the user's requirements
export const getSampleGoals = (): Goal[] => [
  {
    id: '1',
    name: 'Work Time Goal',
    type: 'more_than',
    targetHours: 8,
    targetMinutes: 0,
    category: 'category',
    target: 'All Work',
    schedule: 'workday',
    notifications: ['email', 'desktop', 'mobile'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Cursor Development',
    type: 'more_than',
    targetHours: 3,
    targetMinutes: 0,
    category: 'activity',
    target: 'Cursor',
    schedule: 'work_hours',
    notifications: ['none'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Weekend Limit',
    type: 'less_than',
    targetHours: 6,
    targetMinutes: 0,
    category: 'total_time',
    target: 'all time',
    schedule: 'weekend',
    notifications: ['none'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Distracting Limit (Work)',
    type: 'less_than',
    targetHours: 0,
    targetMinutes: 30,
    category: 'productivity',
    target: 'Distracting',
    schedule: 'work_hours',
    notifications: ['desktop', 'mobile'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Personal Time Limit (Work)',
    type: 'less_than',
    targetHours: 0,
    targetMinutes: 20,
    category: 'category',
    target: 'Personal',
    schedule: 'work_hours',
    notifications: ['desktop', 'mobile'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Daily Distracting Limit (Workday)',
    type: 'less_than',
    targetHours: 0,
    targetMinutes: 20,
    category: 'productivity',
    target: 'Distracting',
    schedule: 'workday',
    notifications: ['email', 'desktop', 'mobile'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Daily Distracting Limit (24x7)',
    type: 'less_than',
    targetHours: 1,
    targetMinutes: 0,
    category: 'productivity',
    target: 'Distracting',
    schedule: 'daily',
    notifications: ['desktop', 'mobile'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Work Day Time Limit',
    type: 'less_than',
    targetHours: 10,
    targetMinutes: 0,
    category: 'total_time',
    target: 'all time',
    schedule: 'workday',
    notifications: ['email', 'desktop', 'mobile'],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Calculate actual time for a goal based on dashboard data
export const calculateActualTime = (goal: Goal, data: DashboardData): number => {
  const today = new Date().toISOString().split('T')[0];
  
  switch (goal.category) {
    case 'total_time':
      const todaySummary = data.summary.find(s => s.date === today);
      return todaySummary?.totalSeconds || 0;
      
    case 'category':
      const categoryTime = data.categories
        .filter(c => c.date === today && c.category === goal.target)
        .reduce((sum, c) => sum + c.seconds, 0);
      return categoryTime;
      
    case 'activity':
      const activityTime = data.categories
        .filter(c => c.date === today && c.activity === goal.target)
        .reduce((sum, c) => sum + c.seconds, 0);
      return activityTime;
      
    case 'productivity':
      let productivityTime = 0;
      if (goal.target === 'Distracting') {
        productivityTime = data.productivity
          .filter(p => p.date === today && p.productivityScore < 0)
          .reduce((sum, p) => sum + p.seconds, 0);
      } else if (goal.target === 'All Work') {
        productivityTime = data.productivity
          .filter(p => p.date === today && p.productivityScore > 0)
          .reduce((sum, p) => sum + p.seconds, 0);
      }
      return productivityTime;
      
    default:
      return 0;
  }
};

// Calculate goal status
export const calculateGoalStatus = (goal: Goal, actualSeconds: number): GoalStatus => {
  const targetSeconds = (goal.targetHours * 3600) + (goal.targetMinutes || 0) * 60;
  const actualHours = Math.floor(actualSeconds / 3600);
  const actualMinutes = Math.floor((actualSeconds % 3600) / 60);
  
  let achieved = false;
  let progressPercentage = 0;
  
  if (goal.type === 'more_than') {
    achieved = actualSeconds >= targetSeconds;
    progressPercentage = targetSeconds > 0 ? (actualSeconds / targetSeconds) * 100 : 0;
  } else {
    achieved = actualSeconds <= targetSeconds;
    progressPercentage = targetSeconds > 0 ? (actualSeconds / targetSeconds) * 100 : 0;
  }
  
  return {
    goalId: goal.id,
    date: new Date().toISOString().split('T')[0],
    actualHours,
    actualMinutes,
    targetHours: goal.targetHours,
    targetMinutes: goal.targetMinutes || 0,
    achieved,
    progressPercentage,
  };
};

// Get relevant activities for a goal
export const getRelevantActivities = (goal: Goal, data: DashboardData) => {
  const today = new Date().toISOString().split('T')[0];
  
  switch (goal.category) {
    case 'category':
      return data.categories.filter(c => c.date === today && c.category === goal.target);
    case 'activity':
      return data.categories.filter(c => c.date === today && c.activity === goal.target);
    case 'productivity':
      if (goal.target === 'Distracting') {
        return data.productivity.filter(p => p.date === today && p.productivityScore < 0);
      } else if (goal.target === 'All Work') {
        return data.productivity.filter(p => p.date === today && p.productivityScore > 0);
      }
      return [];
    default:
      return [];
  }
};

// Check if goal should be active based on schedule
export const isGoalActiveToday = (goal: Goal): boolean => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  switch (goal.schedule) {
    case 'workday':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case 'weekend':
      return dayOfWeek === 0 || dayOfWeek === 6; // Saturday or Sunday
    case 'work_hours':
      return (dayOfWeek >= 1 && dayOfWeek <= 5) && (hour >= 9 && hour <= 17);
    case 'daily':
    case 'all_day':
    default:
      return true;
  }
};

// Calculate all goal progress
export const calculateGoalsProgress = (data: DashboardData): GoalProgress[] => {
  const goals = getSampleGoals();
  
  return goals
    .filter(goal => goal.enabled && isGoalActiveToday(goal))
    .map(goal => {
      const actualSeconds = calculateActualTime(goal, data);
      const status = calculateGoalStatus(goal, actualSeconds);
      const relevantActivities = getRelevantActivities(goal, data);
      
      return {
        goal,
        status,
        todayData: {
          totalSeconds: actualSeconds,
          relevantActivities,
        },
      };
    });
};