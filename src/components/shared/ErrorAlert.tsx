import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import type { ApiError } from '@/types/rescuetime';

interface ErrorAlertProps {
  error: ApiError | Error | null;
  onRetry?: () => void;
  variant?: 'danger' | 'warning';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  variant = 'danger',
  dismissible = false,
  onDismiss,
}) => {
  if (!error) return null;

  const getErrorMessage = () => {
    if ('message' in error) {
      // Handle ApiError
      if ('status' in error && error.status) {
        switch (error.status) {
          case 401:
            return 'Invalid RescueTime API key. Please check your configuration.';
          case 403:
            return 'Access denied. Please verify your RescueTime API permissions.';
          case 429:
            return 'Too many requests. Please wait a moment before trying again.';
          case 500:
            return 'RescueTime service is temporarily unavailable. Please try again later.';
          default:
            return error.message;
        }
      }
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const getErrorIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <Alert 
      variant={variant} 
      dismissible={dismissible} 
      onClose={onDismiss}
      className="d-flex align-items-center justify-content-between"
    >
      <div className="d-flex align-items-center">
        <span className="me-2" style={{ fontSize: '1.2em' }}>
          {getErrorIcon()}
        </span>
        <div>
          <Alert.Heading className="mb-1 h6">
            Something went wrong
          </Alert.Heading>
          <p className="mb-0">
            {getErrorMessage()}
          </p>
          {'endpoint' in error && error.endpoint && (
            <small className="text-muted">
              Endpoint: {error.endpoint}
            </small>
          )}
        </div>
      </div>
      {onRetry && (
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={onRetry}
          className="ms-3"
        >
          Try Again
        </Button>
      )}
    </Alert>
  );
};

// Specialized error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; reset: () => void }> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; reset: () => void }> }>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }

      return (
        <div className="my-4">
          <ErrorAlert 
            error={this.state.error} 
            onRetry={this.reset}
            variant="danger"
          />
        </div>
      );
    }

    return this.props.children;
  }
}