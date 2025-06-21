import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Container, Row, Col, Tab, Tabs, Card, Badge } from 'react-bootstrap';
import { SWRConfig } from 'swr';

import { CategoryBar } from '@/components/charts/CategoryBar';
import { ProductivityLine } from '@/components/charts/ProductivityLine';
import { ActivityPie } from '@/components/charts/ActivityPie';

import { ErrorAlert, ErrorBoundary } from '@/components/shared/ErrorAlert';

import { useRescueTime, useChartData } from '@/lib/hooks';
import { fetchDashboardData, getDateRanges } from '@/lib/rescuetime';
import type { DashboardData } from '@/types/rescuetime';

interface DashboardProps {
  initialData: DashboardData;
  dateRange: string;
}

const Dashboard: React.FC<DashboardProps> = ({ initialData, dateRange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data, error, isLoading, mutate } = useRescueTime();
  const dashboardData = data || initialData;
  const chartData = useChartData(dashboardData);

  // Calculate summary stats
  const totalHours = dashboardData?.summary.reduce((sum, day) => sum + day.totalHours, 0) || 0;
  const totalDays = dashboardData?.summary.length || 0;
  const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
  
  const avgProductivity = dashboardData?.productivity.length > 0 
    ? dashboardData.productivity.reduce((sum, item) => sum + item.productivityScore, 0) / dashboardData.productivity.length
    : 0;

  return (
    <>
      <Head>
        <title>RescueTime Dashboard</title>
        <meta name="description" content="Track your productivity and time usage with RescueTime data visualization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">RescueTime Dashboard</h1>
            <p className="text-muted mb-0">
              {dateRange} • {totalDays} days • {totalHours.toFixed(1)} total hours
            </p>
          </div>
          <div className="d-flex gap-2">
            <Badge bg="primary">{avgHoursPerDay.toFixed(1)}h avg/day</Badge>
            <Badge bg={avgProductivity >= 0 ? 'success' : 'warning'}>
              {avgProductivity >= 0 ? '+' : ''}{avgProductivity.toFixed(1)} productivity
            </Badge>
          </div>
        </div>

        <ErrorBoundary>
          {error && (
            <ErrorAlert 
              error={error} 
              onRetry={() => mutate()} 
              dismissible 
            />
          )}

          <Tabs
            id="dashboard-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'overview')}
            className="mb-4"
          >
            <Tab eventKey="overview" title="Overview">
              <Row className="g-4">
                <Col lg={8}>
                  <ProductivityLine 
                    data={chartData?.productivityTrendData || []}
                    loading={isLoading}
                    title="Productivity Trend"
                  />
                </Col>
                <Col lg={4}>
                  <Card>
                    <Card.Header>
                      <Card.Title className="mb-0">Summary Stats</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-3">
                        <span>Total Time:</span>
                        <strong>{totalHours.toFixed(1)} hours</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-3">
                        <span>Days Tracked:</span>
                        <strong>{totalDays}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-3">
                        <span>Avg per Day:</span>
                        <strong>{avgHoursPerDay.toFixed(1)} hours</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Avg Productivity:</span>
                        <strong className={avgProductivity >= 0 ? 'text-success' : 'text-warning'}>
                          {avgProductivity >= 0 ? '+' : ''}{avgProductivity.toFixed(1)}
                        </strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-4 mt-2">
                <Col lg={8}>
                  <CategoryBar 
                    data={chartData?.categoryChartData || []}
                    loading={isLoading}
                    title="Time by Category"
                  />
                </Col>
                <Col lg={4}>
                  <ActivityPie 
                    data={chartData?.categoryPieData.slice(0, 6) || []}
                    loading={isLoading}
                    title="Top Categories"
                    showTable={false}
                  />
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="categories" title="Categories">
              <Row className="g-4">
                <Col>
                  <ActivityPie 
                    data={chartData?.categoryPieData || []}
                    loading={isLoading}
                    title="Complete Category Breakdown"
                    showTable={true}
                  />
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="productivity" title="Productivity">
              <Row className="g-4">
                <Col lg={8}>
                  <ProductivityLine 
                    data={chartData?.productivityTrendData || []}
                    loading={isLoading}
                    title="Detailed Productivity Analysis"
                    showArea={true}
                  />
                </Col>
                <Col lg={4}>
                  <Card>
                    <Card.Header>
                      <Card.Title className="mb-0">Productivity Insights</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <h6 className="text-success">Most Productive Day</h6>
                        <p className="mb-1">
                          {chartData?.productivityTrendData.reduce((best, day) => 
                            day.score > best.score ? day : best, 
                            chartData.productivityTrendData[0] || {date: 'N/A', score: 0}
                          )?.date || 'N/A'}
                        </p>
                        <small className="text-muted">
                          Score: {chartData?.productivityTrendData.reduce((best, day) => 
                            day.score > best.score ? day : best, 
                            chartData.productivityTrendData[0] || {score: 0}
                          )?.score.toFixed(1) || '0.0'}
                        </small>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="text-warning">Improvement Opportunity</h6>
                        <p className="mb-1">
                          {chartData?.productivityTrendData.reduce((worst, day) => 
                            day.score < worst.score ? day : worst, 
                            chartData.productivityTrendData[0] || {date: 'N/A', score: 0}
                          )?.date || 'N/A'}
                        </p>
                        <small className="text-muted">
                          Score: {chartData?.productivityTrendData.reduce((worst, day) => 
                            day.score < worst.score ? day : worst, 
                            chartData.productivityTrendData[0] || {score: 0}
                          )?.score.toFixed(1) || '0.0'}
                        </small>
                      </div>

                      <div className="alert alert-info">
                        <small>
                          <strong>Tip:</strong> Focus on activities that scored +1 or higher to boost your overall productivity.
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </ErrorBoundary>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async () => {
  try {
    const ranges = getDateRanges();
    const range = ranges.last7Days; // Default to last 7 days for SSR
    
    const initialData = await fetchDashboardData(range.start, range.end);
    
    return {
      props: {
        initialData,
        dateRange: 'Last 7 Days',
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return minimal data structure to prevent page crash
    return {
      props: {
        initialData: {
          summary: [],
          productivity: [],
          categories: [],
        },
        dateRange: 'Last 7 Days',
      },
    };
  }
};

// Wrap with SWR config for client-side data fetching
const DashboardWithSWR: React.FC<DashboardProps> = (props) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 300000, // 5 minutes
      }}
    >
      <Dashboard {...props} />
    </SWRConfig>
  );
};

export default DashboardWithSWR;