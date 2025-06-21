# RescueTime Dashboard

A production-ready dashboard built with Next.js 15, TypeScript, and React-Bootstrap that integrates with the RescueTime API to visualize your productivity and time tracking data.

![RescueTime Dashboard](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![React-Bootstrap](https://img.shields.io/badge/React--Bootstrap-2.11-purple?style=flat-square&logo=bootstrap)
![Recharts](https://img.shields.io/badge/Recharts-2.14-green?style=flat-square)

## ✨ Features

### 📊 Interactive Visualizations
- **Bar Charts** - Time spent per category with responsive design
- **Line Charts** - Productivity score trends over time
- **Pie Charts** - Activity distribution with detailed breakdowns
- **Area Charts** - Alternative productivity visualization

### 🔐 Secure Authentication
- API key-based authentication via environment variables
- Secure server-side data fetching with error handling
- Rate limiting and retry logic built-in

### 📱 Responsive Design
- Mobile-first approach with Bootstrap breakpoints
- Dark mode support (system preference)
- Touch-friendly interface for mobile devices
- Print-optimized layouts

### ⚡ Performance Optimized
- **SSR** (Server-Side Rendering) for initial page load
- **SWR** for client-side caching and revalidation
- Tree-shaking optimized bundle
- Lazy loading and code splitting

### 🎨 Modern UX
- Loading skeletons for better perceived performance
- Error boundaries with user-friendly error messages
- Toast notifications for API errors
- Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- RescueTime API key ([Get one here](https://www.rescuetime.com/anapi/manage))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dr-aiuta/rescuetimedashboard.git
   cd rescuetimedashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your RescueTime API key:
   ```env
   RESCUETIME_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── pages/
│   ├── index.tsx              # Main dashboard (SSR)
│   ├── _app.tsx               # App configuration
│   └── [...range]/index.tsx   # Date-range reports (ISR)
├── components/
│   ├── charts/
│   │   ├── CategoryBar.tsx    # Bar chart component
│   │   ├── ProductivityLine.tsx # Line chart component
│   │   └── ActivityPie.tsx    # Pie chart component
│   └── shared/
│       ├── LoadingSkeleton.tsx # Loading states
│       └── ErrorAlert.tsx     # Error handling
├── lib/
│   ├── rescuetime.ts          # API client
│   └── hooks.ts               # Custom hooks
├── types/
│   └── rescuetime.d.ts        # TypeScript definitions
└── styles/
    └── globals.css            # Global styles
```

## 📊 Dashboard Features

### Overview Tab
- **Productivity Trend Line Chart** - Shows your productivity score over time
- **Summary Statistics** - Total time, days tracked, averages
- **Category Bar Chart** - Time spent in different categories
- **Top Categories Pie Chart** - Quick overview of main activities

### Categories Tab
- **Complete Category Breakdown** - Detailed pie chart with data table
- **Time percentages** - See exactly how you spend your time
- **Color-coded visualization** - Easy to distinguish categories

### Productivity Tab
- **Detailed Productivity Analysis** - Area chart showing trends
- **Productivity Insights** - Most/least productive days
- **Actionable Tips** - Suggestions for improvement

## 🔧 Configuration

### Environment Variables
```env
# Required
RESCUETIME_API_KEY=your_rescuetime_api_key

# Optional
NODE_ENV=development
```

### API Endpoints Used
- `/daily_summary_feed` - Daily summary data
- `/data` - Productivity and category data
- `/anapi/data` - Analytic data

### Customization
- **Colors**: Edit `src/styles/globals.css` CSS variables
- **Date Ranges**: Modify `getDateRanges()` in `src/lib/rescuetime.ts`
- **Chart Types**: Switch between line/area charts in components

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t rescuetime-dashboard .
docker run -p 3000:3000 -e RESCUETIME_API_KEY=your_key rescuetime-dashboard
```

### Manual Build
```bash
npm run build
npm start
```

## 📈 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Optimization Features
- Server-side rendering (SSR)
- Static generation (SSG) for reports
- SWR caching with 5-minute deduplication
- Tree-shaking for smaller bundles
- Image optimization
- Font optimization

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking
```

### Code Quality
- **ESLint** - Code linting with Next.js rules
- **TypeScript** - Strict type checking
- **Prettier** - Code formatting (via ESLint)

## 🔍 API Reference

### RescueTime API Integration
The dashboard integrates with three main RescueTime API endpoints:

#### Daily Summary
```typescript
fetchDailySummary(startDate: Date, endDate: Date): Promise<DailySummary[]>
```

#### Productivity Data  
```typescript
fetchProductivityData(startDate: Date, endDate: Date): Promise<ProductivityData[]>
```

#### Category Data
```typescript
fetchCategoryData(startDate: Date, endDate: Date): Promise<CategoryData[]>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [RescueTime](https://rescuetime.com) - For the productivity tracking API
- [Next.js](https://nextjs.org) - React framework
- [React-Bootstrap](https://react-bootstrap.github.io) - UI components  
- [Recharts](https://recharts.org) - Chart library
- [SWR](https://swr.vercel.app) - Data fetching library

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/dr-aiuta/rescuetimedashboard/issues) page
2. Create a new issue with detailed information
3. Include error messages, browser info, and steps to reproduce

## 🎯 Roadmap

- [ ] Real-time data updates with WebSockets
- [ ] AI-powered productivity insights
- [ ] Cross-device data aggregation
- [ ] PWA support with offline functionality
- [ ] Custom date range picker
- [ ] Export to PDF/CSV functionality
- [ ] Multi-user support
- [ ] Advanced filtering and search