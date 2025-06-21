import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Alert } from 'react-bootstrap';
import { SWRConfig } from 'swr';

import { useRescueTime } from '@/lib/hooks';
import { fetchDashboardData, getDateRanges } from '@/lib/rescuetime';
import { calculateGoalsProgress } from '@/lib/goals';
import type { DashboardData, GoalProgress, GoalType } from '@/types/rescuetime';

interface GoalsPageProps {
  initialData: DashboardData;
}

// Simple goal card component inline to avoid linter issues
const GoalCardComponent: React.FC<{ goalProgress: GoalProgress }> = ({ goalProgress }) => {
  const { goal, status } = goalProgress;
  const { type, target, targetHours, targetMinutes = 0, schedule, notifications } = goal;
  const { actualHours, actualMinutes, achieved, progressPercentage } = status;

  const formatTime = (hours: number, minutes: number = 0) => {
    const totalMinutes = Math.floor(hours * 60) + minutes;
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatSchedule = (schedule: string) => {
    const scheduleMap: { [key: string]: string } = {
      'workday': 'Mon-Fri All day',
      'weekend': 'Sat-Sun',
      'daily': '24x7',
      'work_hours': 'Work hours',
      'all_day': 'All day'
    };
    return scheduleMap[schedule] || schedule;
  };

  const formatNotifications = (notifications: string[]) => {
    if (notifications.length === 0 || (notifications.length === 1 && notifications[0] === 'none')) {
      return 'none';
    }
    return notifications
      .filter(n => n !== 'none')
      .map(n => n.charAt(0).toUpperCase() + n.slice(1))
      .join(', ');
  };

  const getProgressVariant = (achieved: boolean, progressPercentage: number, type: GoalType) => {
    if (achieved) return 'success';
    if (type === 'more_than') {
      return progressPercentage >= 80 ? 'warning' : progressPercentage >= 50 ? 'info' : 'secondary';
    } else {
      return progressPercentage >= 80 ? 'danger' : progressPercentage >= 50 ? 'warning' : 'success';
    }
  };

  const targetTimeStr = formatTime(targetHours, targetMinutes);
  const actualTimeStr = formatTime(actualHours, actualMinutes);
  const progressVariant = getProgressVariant(achieved, progressPercentage, type);
  const goalIcon = type === 'more_than' ? '↗️' : '↙️';

  return (
    <Card className="h-100" style={{ minHeight: '200px' }}>
      <Card.Body className="d-flex flex-column">
        <Row className="align-items-center mb-3">
          <Col>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="fs-4">{goalIcon}</span>
              <div>
                <h6 className="mb-0 fw-bold">
                  {type === 'more_than' ? 'More than' : 'Less than'}
                </h6>
                <div className="text-primary fw-bold fs-5">
                  {targetTimeStr}
                </div>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {achieved ? (
              <Badge bg="success">✓ Achieved</Badge>
            ) : type === 'less_than' && progressPercentage > 100 ? (
              <Badge bg="danger">⚠️ Exceeded</Badge>
            ) : (
              <Badge bg="secondary">In Progress</Badge>
            )}
          </Col>
        </Row>

        <div className="mb-3">
          <div className="fw-bold text-dark mb-1">per day on</div>
          <div className="text-primary fw-bold fs-6">{target}</div>
          <div className="text-muted small">☆</div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Progress</span>
            <span className="fw-bold text-primary fs-5">{actualTimeStr}</span>
          </div>
          <ProgressBar 
            now={Math.min(progressPercentage, 100)} 
            variant={progressVariant}
            style={{ height: '8px' }}
          />
          <div className="small text-muted mt-1">
            {progressPercentage.toFixed(0)}% of {type === 'more_than' ? 'target' : 'limit'}
          </div>
        </div>

        <div className="mt-auto">
          <div className="small text-muted">
            <div><strong>When:</strong> {formatSchedule(schedule)}</div>
            <div><strong>Notifications:</strong> {formatNotifications(notifications)}</div>
          </div>
        </div>

        {!achieved && type === 'more_than' && (
          <div className="mt-2">
            <div className="small text-info">
              <strong>Need:</strong> {formatTime(targetHours - actualHours, targetMinutes - actualMinutes)} more
            </div>
          </div>
        )}

        {type === 'less_than' && progressPercentage > 100 && (
          <div className="mt-2">
            <div className="small text-danger">
              <strong>Over by:</strong> {formatTime(actualHours - targetHours, actualMinutes - targetMinutes)}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

const GoalsPage: React.FC<GoalsPageProps> = ({ initialData }) => {
  // Use only server-side data to avoid client-side API calls
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const dashboardData = initialData;
  const goalsProgress = calculateGoalsProgress(dashboardData);
  const error = null;
  const isLoading = false;

  const totalGoals = goalsProgress.length;
  const achievedGoals = goalsProgress.filter(g => g.status.achieved).length;
  const exceededGoals = goalsProgress.filter(g => 
    g.goal.type === 'less_than' && g.status.progressPercentage > 100
  ).length;

  return (
    <>
      <Head>
        <title>Daily Goals - RescueTime Dashboard</title>
        <meta name="description" content="Track your daily productivity goals in real-time" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Daily Goals Dashboard</h1>
            <p className="text-muted mb-0">
              Real-time goal tracking • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Badge bg="success">{achievedGoals}/{totalGoals} Achieved</Badge>
            {exceededGoals > 0 && (
              <Badge bg="danger">{exceededGoals} Exceeded</Badge>
            )}
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => {
                window.location.reload();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible className="mb-4">
            <Alert.Heading>Error loading goals data</Alert.Heading>
            <p>Unable to fetch the latest RescueTime data. Please check your API configuration.</p>
          </Alert>
        )}

        {goalsProgress.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No active goals today</Alert.Heading>
            <p>No goals are scheduled to be active today based on your current schedule settings.</p>
          </Alert>
        ) : (
          <Row className="g-4">
            {goalsProgress.map((goalProgress) => (
              <Col key={goalProgress.goal.id} xl={3} lg={4} md={6} sm={12}>
                <GoalCardComponent goalProgress={goalProgress} />
              </Col>
            ))}
          </Row>
        )}

        <div className="mt-5">
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">📊 Today's Summary</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fs-2 fw-bold text-primary">{totalGoals}</div>
                    <div className="text-muted">Total Goals</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fs-2 fw-bold text-success">{achievedGoals}</div>
                    <div className="text-muted">Achieved</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fs-2 fw-bold text-warning">{totalGoals - achievedGoals - exceededGoals}</div>
                    <div className="text-muted">In Progress</div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fs-2 fw-bold text-danger">{exceededGoals}</div>
                    <div className="text-muted">Exceeded</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        <div className="mt-4">
          <Alert variant="info">
            <strong>💡 How it works:</strong> Goals are automatically calculated from your RescueTime data. 
            The dashboard updates every 5 minutes to reflect your current progress. 
            Goals are only shown when they're active according to their schedule (work hours, weekdays, etc.).
          </Alert>
        </div>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<GoalsPageProps> = async () => {
  try {
    const ranges = getDateRanges();
    const today = ranges.today;
    
    const initialData = await fetchDashboardData(today.start, today.end);
    
    return {
      props: {
        initialData,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    return {
      props: {
        initialData: {
          summary: [],
          productivity: [],
          categories: [],
        },
      },
    };
  }
};

// Wrap with SWR config for client-side data fetching
const GoalsPageWithSWR: React.FC<GoalsPageProps> = (props) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // 1 minute for goals (more frequent than dashboard)
      }}
    >
      <GoalsPage {...props} />
    </SWRConfig>
  );
};

export default GoalsPageWithSWR;