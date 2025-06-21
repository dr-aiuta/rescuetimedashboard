import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card } from 'react-bootstrap';

interface ProductivityLineProps {
  data: Array<{
    date: string;
    score: number;
    hours: number;
  }>;
  title?: string;
  loading?: boolean;
  showArea?: boolean;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length && label) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="mb-1 fw-bold">{new Date(label).toLocaleDateString()}</p>
        <p className="mb-1 text-success">
          Productivity Score: {data.score.toFixed(1)}
        </p>
        <p className="mb-0 text-primary">
          Total Time: {data.hours.toFixed(1)} hours
        </p>
      </div>
    );
  }
  return null;
};

export const ProductivityLine: React.FC<ProductivityLineProps> = ({ 
  data, 
  title = "Productivity Trend",
  loading = false,
  showArea = false
}) => {
  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="mb-0">{title}</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="mb-0">{title}</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <p className="text-muted">No data available</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date),
  }));

  const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">{title}</Card.Title>
        <small className="text-muted">
          Avg: {averageScore.toFixed(1)}
        </small>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          {showArea ? (
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                fontSize={12}
              />
              <YAxis 
                domain={[-2, 2]}
                tickFormatter={(value) => value.toFixed(1)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#198754"
                fill="#198754"
                fillOpacity={0.3}
                name="Productivity Score"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                fontSize={12}
              />
              <YAxis 
                domain={[-2, 2]}
                tickFormatter={(value) => value.toFixed(1)}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#198754"
                strokeWidth={3}
                dot={{ fill: '#198754', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#198754', strokeWidth: 2 }}
                name="Productivity Score"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
        <div className="mt-3">
          <small className="text-muted">
            <strong>Productivity Scale:</strong> Very Productive (+2) → Neutral (0) → Very Distracting (-2)
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};