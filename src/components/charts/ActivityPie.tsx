import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, Table } from 'react-bootstrap';

interface ActivityPieProps {
  data: Array<{
    name: string;
    value: number;
    hours: number;
    percentage: number;
  }>;
  title?: string;
  loading?: boolean;
  showTable?: boolean;
}

// Color palette for different categories
const COLORS = [
  '#0d6efd', // Blue
  '#198754', // Green
  '#dc3545', // Red
  '#ffc107', // Yellow
  '#6f42c1', // Purple
  '#fd7e14', // Orange
  '#20c997', // Teal
  '#e83e8c', // Pink
  '#6c757d', // Gray
  '#17a2b8', // Cyan
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="mb-1 fw-bold">{data.name}</p>
        <p className="mb-1 text-primary">
          {data.hours.toFixed(1)} hours
        </p>
        <p className="mb-0 text-muted">
          {data.percentage.toFixed(1)}% of total time
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
  if (percent < 0.05) return null; // Don't show labels for very small slices
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const ActivityPie: React.FC<ActivityPieProps> = ({ 
  data, 
  title = "Time Distribution",
  loading = false,
  showTable = true
}) => {
  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="mb-0">{title}</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
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
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <p className="text-muted">No data available</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Limit to top 10 categories and group others
  const topData = data.slice(0, 9);
  const othersData = data.slice(9);
  
  const chartData = [...topData];
  
  if (othersData.length > 0) {
    const othersTotal = othersData.reduce((sum, item) => ({
      value: sum.value + item.value,
      hours: sum.hours + item.hours,
      percentage: sum.percentage + item.percentage,
    }), { value: 0, hours: 0, percentage: 0 });

    chartData.push({
      name: `Others (${othersData.length})`,
      ...othersTotal,
    });
  }

  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">{title}</Card.Title>
        <small className="text-muted">
          Total: {totalHours.toFixed(1)} hours
        </small>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-8">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: { color?: string }) => (
                    <span style={{ color: entry.color || '#000' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {showTable && (
            <div className="col-md-4">
              <h6 className="mb-3">Breakdown</h6>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Hours</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={item.name}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-2"
                              style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: COLORS[index % COLORS.length],
                                borderRadius: '2px'
                              }}
                            />
                            <small>{item.name}</small>
                          </div>
                        </td>
                        <td>
                          <small>{item.hours.toFixed(1)}</small>
                        </td>
                        <td>
                          <small>{item.percentage.toFixed(1)}%</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};