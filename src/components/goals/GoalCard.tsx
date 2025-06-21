import React from 'react';
import { Card, Badge, ProgressBar, Row, Col } from 'react-bootstrap';
import { GoalProgress, GoalType } from '@/types/rescuetime';

interface GoalCardProps {
  goalProgress: GoalProgress;
  className?: string;
}

const getGoalIcon = (type: GoalType) => {
  return type === 'more_than' ? '↗️' : '↙️';
};

const getProgressVariant = (achieved: boolean, progressPercentage: number, type: GoalType) => {
  if (achieved) return 'success';
  if (type === 'more_than') {
    return progressPercentage >= 80 ? 'warning' : progressPercentage >= 50 ? 'info' : 'secondary';
  } else {
    return progressPercentage >= 80 ? 'danger' : progressPercentage >= 50 ? 'warning' : 'success';
  }
};

const getStatusBadge = (achieved: boolean, type: GoalType, progressPercentage: number) => {
  if (achieved) {
    return <Badge bg="success">✓ Achieved</Badge>;
  }
  
  if (type === 'less_than' && progressPercentage > 100) {
    return <Badge bg="danger">⚠️ Exceeded</Badge>;
  }
  
  return <Badge bg="secondary">In Progress</Badge>;
};

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

export const GoalCard: React.FC<GoalCardProps> = ({ goalProgress, className = '' }) => {
  const { goal, status, todayData } = goalProgress;
  const { type, name, target, targetHours, targetMinutes = 0, schedule, notifications } = goal;
  const { actualHours, actualMinutes, achieved, progressPercentage } = status;

  const targetTimeStr = formatTime(targetHours, targetMinutes);
  const actualTimeStr = formatTime(actualHours, actualMinutes);
  const progressVariant = getProgressVariant(achieved, progressPercentage, type);

  return (
    <Card className={`h-100 ${className}`} style={{ minHeight: '200px' }}>
      <Card.Body className="d-flex flex-column">
        <Row className="align-items-center mb-3">
          <Col>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="fs-4">{getGoalIcon(type)}</span>
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
            {getStatusBadge(achieved, type, progressPercentage)}
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