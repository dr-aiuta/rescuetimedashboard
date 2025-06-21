import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

interface LoadingSkeletonProps {
  type?: 'chart' | 'table' | 'card';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'chart', 
  count = 1 
}) => {
  const renderChartSkeleton = () => (
    <Card>
      <Card.Header>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={4} />
        </Placeholder>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <Placeholder animation="wave" style={{ width: '100%', height: '100%' }}>
            <Placeholder xs={12} style={{ height: '100%' }} />
          </Placeholder>
        </div>
      </Card.Body>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Card>
      <Card.Header>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={4} />
        </Placeholder>
      </Card.Header>
      <Card.Body>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-3">
            <Placeholder animation="glow">
              <Placeholder xs={3} className="me-2" />
              <Placeholder xs={2} className="me-2" />
              <Placeholder xs={4} />
            </Placeholder>
          </div>
        ))}
      </Card.Body>
    </Card>
  );

  const renderCardSkeleton = () => (
    <Card>
      <Card.Body>
        <Placeholder animation="glow">
          <Placeholder xs={6} />
          <Placeholder xs={4} />
          <Placeholder xs={8} />
          <Placeholder xs={5} />
        </Placeholder>
      </Card.Body>
    </Card>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return renderTableSkeleton();
      case 'card':
        return renderCardSkeleton();
      default:
        return renderChartSkeleton();
    }
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};