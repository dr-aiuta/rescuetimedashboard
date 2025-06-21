# Testing the Daily Goals Dashboard

## 🚀 Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Set up your RescueTime API Key**:
   - Create a `.env.local` file in the root directory
   - Add your RescueTime API key:
     ```
     RESCUETIME_API_KEY=your_api_key_here
     ```
   - Get your API key from: https://www.rescuetime.com/anapi/manage

3. **Access the Goals Dashboard**:
   - Visit: http://localhost:3000/goals
   - Or click "🎯 Daily Goals" button from the main dashboard

## 🎯 What You'll See

### If Goals Are Active Today:
- **Goal cards** showing progress for each active goal
- **Progress bars** with color-coded status
- **Achievement badges** (✓ Achieved, ⚠️ Exceeded, In Progress)
- **Real-time updates** every 5 minutes
- **Summary statistics** at the bottom

### If No Goals Are Active:
- **Info message** explaining no goals are scheduled for today
- This happens on weekends for work-only goals, or outside work hours for work-time goals

## 🕐 Schedule Testing

The goals are schedule-aware, so you'll see different goals depending on:

- **Monday-Friday 9 AM - 5 PM**: All work-related goals active
- **Monday-Friday outside work hours**: Only "workday" and "daily" goals
- **Saturday-Sunday**: Only weekend and daily goals
- **Anytime**: 24x7 goals always show

## 📊 Sample Data

The system includes these predefined goals matching your examples:

1. **8+ hours All Work** (Weekdays)
2. **3+ hours Cursor** (Work hours)  
3. **<6 hours total time** (Weekends)
4. **<30 minutes Distracting** (Work hours)
5. **<20 minutes Personal** (Work hours)
6. **<20 minutes Distracting** (Weekdays)
7. **<1 hour Distracting** (24x7)
8. **<10 hours total time** (Weekdays)

## 🔄 Testing Real-time Updates

- Goals automatically refresh every 5 minutes
- Click the "Refresh" button for immediate updates
- Progress bars and achievements update based on your actual RescueTime data

## 🐛 Troubleshooting

### No data showing?
- Check your RescueTime API key is correct
- Ensure you have RescueTime data for today
- Verify the RescueTime desktop app is running and syncing

### Goals not appearing?
- Check if it's the right time/day for the goal schedule
- Weekend goals only show on Saturday/Sunday
- Work hours goals only show Monday-Friday 9 AM - 5 PM

### TypeScript errors?
- The system may have some TypeScript configuration issues
- Goals will still work in the browser despite linter warnings
- Run `npm run build` to check for blocking errors

## 🎨 Visual Examples

You should see goal cards that look like:

```
↗️ More than          ✓ Achieved
   8h 0m
per day on
All Work              2h 44m
☆                     [████████████] 34%

When: Mon-Fri All day
Notifications: Email, Desktop & Mobile
```

The progress bars will be:
- **Green**: Goals achieved or under limits
- **Yellow**: Getting close to limits  
- **Red**: Limits exceeded or far from targets

## 📱 Mobile Testing

The goals dashboard is fully responsive. Test on:
- Desktop (4 cards per row)
- Tablet (2 cards per row)
- Mobile (1 card per row)

All functionality works across devices.