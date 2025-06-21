# RescueTime API Endpoints Verification

This document verifies all RescueTime API endpoints based on the official documentation at https://www.rescuetime.com/anapi/setup/documentation

## ✅ Currently Implemented Endpoints

### 1. Analytic Data API
- **Endpoint**: `/anapi/data` (API Key) or `/api/oauth/data` (OAuth2)
- **Status**: ✅ **IMPLEMENTED**
- **Usage**: Used in `fetchProductivityData()` and `fetchCategoryData()`
- **Parameters Supported**:
  - `perspective`: 'rank' | 'interval'
  - `resolution_time`: 'day' | 'week' | 'month' | 'hour' | 'minute'
  - `restrict_begin`: YYYY-MM-DD format
  - `restrict_end`: YYYY-MM-DD format
  - `restrict_kind`: 'category' | 'activity' | 'productivity'
  - `format`: 'json'

### 2. Daily Summary Feed API
- **Endpoint**: `/anapi/daily_summary_feed` (API Key) or `/api/oauth/daily_summary_feed` (OAuth2)
- **Status**: ✅ **IMPLEMENTED**
- **Usage**: Used in `fetchDailySummary()`
- **Returns**: Daily rollup data including total time, productivity levels, and categories

## 🔄 Available But Not Implemented Endpoints

### 3. Alerts Feed API
- **Endpoint**: `/anapi/alerts_feed` (API Key) or `/api/oauth/alerts_feed` (OAuth2)
- **Status**: ⏳ **NOT IMPLEMENTED**
- **Purpose**: Access user-defined alerts (Premium feature only)
- **Parameters**:
  - `op`: 'status' | 'list'
  - `alert_id`: Integer (optional)

### 4. Daily Highlights Feed API
- **Endpoint**: `/anapi/highlights_feed` (API Key) or `/api/oauth/highlights_feed` (OAuth2)
- **Status**: ⏳ **NOT IMPLEMENTED**
- **Purpose**: Retrieve user-entered daily highlights (Premium feature only)

### 5. Daily Highlights Post API
- **Endpoint**: `/anapi/highlights_post` (API Key) or `/api/oauth/highlights_post` (OAuth2)
- **Status**: ⏳ **NOT IMPLEMENTED**
- **Purpose**: Post daily highlights programmatically (Premium feature only)
- **Method**: POST
- **Parameters**:
  - `highlight_date`: YYYY-MM-DD
  - `description`: String (255 chars max)
  - `source`: String (optional)

### 6. Focus Session Trigger API
- **Endpoints**: 
  - `/anapi/start_focustime` (API Key) or `/api/oauth/start_focustime` (OAuth2)
  - `/anapi/end_focustime` (API Key) or `/api/oauth/end_focustime` (OAuth2)
- **Status**: ⏳ **NOT IMPLEMENTED**
- **Purpose**: Start/end Focus Sessions programmatically (Premium feature only)
- **Method**: POST
- **Parameters**:
  - `duration`: Integer (multiples of 5 minutes, or -1 for end of day)

### 7. Focus Session Feed API
- **Endpoints**: 
  - `/anapi/focustime_started_feed` (API Key) or `/api/oauth/focustime_started_feed` (OAuth2)
  - `/anapi/focustime_ended_feed` (API Key) or `/api/oauth/focustime_ended_feed` (OAuth2)
- **Status**: ⏳ **NOT IMPLEMENTED**
- **Purpose**: Monitor Focus Session events (Premium feature only)

### 8. Offline Time POST API
- **Endpoint**: `/anapi/offline_time_post` (API Key) or `/api/oauth/offline_time_post` (OAuth2)
- **Status**: ⏳ **NOT IMPLEMENTED**
- **Purpose**: Post offline time entries programmatically (Premium feature only)
- **Method**: POST
- **JSON Body**:
  - `start_time`: YYYY-MM-DD HH:MM:SS
  - `end_time` OR `duration`: String or Integer
  - `activity_name`: String (255 chars max)
  - `activity_details`: String (optional, 255 chars max)

## 🔐 Authentication Methods

### API Key Access (Currently Used)
- **Setup**: Users create API key at https://www.rescuetime.com/anapi/manage
- **Usage**: Include `key` parameter in requests
- **Security**: Keep key private, can be revoked anytime

### OAuth2 Access (Available)
- **Setup**: Contact RescueTime for OAuth2 application setup
- **Scopes Available**:
  - `time_data`: Access activity history and summary time data
  - `category_data`: Access category time data
  - `productivity_data`: Access productivity level data
  - `alert_data`: Access alert history
  - `highlight_data`: Access daily highlights
  - `focustime_data`: Access Focus Sessions

## 📊 Data Sync Intervals

- **Premium/Organization users**: 3 minutes
- **Lite (free) users**: 30 minutes

## 🔧 Implementation Recommendations

### Priority 1: Focus Session APIs
For the goals dashboard, implementing Focus Session APIs would be valuable:
```typescript
// Add to rescuetime.ts
export const startFocusSession = async (duration: number): Promise<void> => {
  const response = await fetchRT('/start_focustime', { duration: duration.toString() });
  // Handle response
};

export const endFocusSession = async (): Promise<void> => {
  const response = await fetchRT('/end_focustime', {});
  // Handle response  
};
```

### Priority 2: Highlights APIs
For goal tracking and productivity insights:
```typescript
export const fetchHighlights = async (): Promise<Highlight[]> => {
  const response = await fetchRT('/highlights_feed', {});
  return response; // Process highlights data
};

export const postHighlight = async (date: string, description: string, source?: string): Promise<void> => {
  // POST implementation
};
```

### Priority 3: Alerts APIs
For automated notifications:
```typescript
export const fetchAlerts = async (alertId?: number): Promise<Alert[]> => {
  const query = alertId ? { op: 'status', alert_id: alertId.toString() } : { op: 'status' };
  const response = await fetchRT('/alerts_feed', query);
  return response;
};
```

## 🎯 Current Implementation Status

### ✅ What's Working
1. **Daily Summary**: Complete implementation with date ranges
2. **Productivity Data**: Hourly/daily productivity scores
3. **Category Data**: Time spent in different categories
4. **Activity Data**: Individual application/website tracking
5. **Error Handling**: Proper API error management
6. **Caching**: SWR-based data caching

### 🔧 What's Missing
1. **Focus Session Integration**: Start/stop/monitor sessions
2. **Highlights**: User productivity notes
3. **Alerts**: Automated goal notifications
4. **Offline Time**: Manual time entry
5. **OAuth2 Support**: Enterprise-grade authentication

## 🚀 Goals Dashboard Integration

The new goals dashboard (`/goals`) uses the existing API implementation and adds:

1. **Real-time Goal Tracking**: Updates every 5 minutes
2. **Schedule-based Goals**: Different goals for work hours, weekdays, etc.
3. **Progress Visualization**: Visual progress bars and status indicators
4. **Achievement Tracking**: Goals achieved/exceeded counts
5. **Notification Settings**: Email, desktop, mobile notification preferences

The goals system works entirely with existing API data, calculating progress based on:
- Total time tracking
- Category-based time limits
- Productivity score analysis
- Activity-specific targets

## 📋 Next Steps

1. **Implement Focus Session APIs** for enhanced goal management
2. **Add Highlights APIs** for qualitative goal tracking
3. **Consider OAuth2** for team/enterprise features
4. **Add Alerts APIs** for automated notifications
5. **Implement Offline Time** for comprehensive tracking

All endpoints have been verified against the official RescueTime API documentation and are ready for implementation.