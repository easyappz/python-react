import React from 'react';
import * as sourceMappedStackTrace from 'sourcemapped-stacktrace';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Парсим stack trace с помощью source maps
    this.parseStackTrace(error, errorInfo);
  }

  parseStackTrace = async (error, errorInfo) => {
    try {
      // Если есть исходный stack trace
      if (error.stack) {
        sourceMappedStackTrace.mapStackTrace(
          error.stack,
          (mappedStack) => {
            const enhancedError = {
              message: error.message,
              originalStack: error.stack,
              mappedStack: mappedStack,
              componentStack: errorInfo.componentStack,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              userAgent: navigator.userAgent
            };
            
            console.log('Enhanced error with source maps:', {
              ...enhancedError,
              // Форматируем mappedStack для удобства чтения
              formattedStack: mappedStack.join('\n')
            });
            
            // Отправляем улучшенную ошибку
            window.parent.postMessage({
              type: 'reactError',
              message: error.message,
              stack: mappedStack,
              componentStack: errorInfo.componentStack,
            }, '*');
          },
          {
            // Опции для source maps
            sync: false,
            cacheGlobally: true,
            filter: (line) => {
              // Фильтруем строки, которые не нужно мапить
              return !line.includes('node_modules');
            }
          }
        );
      } else {
        // Fallback: отправляем без source maps
        this.sendFallbackError(error, errorInfo);
      }
    } catch (parseError) {
      console.error('Failed to parse stack trace:', parseError);
      // Отправляем оригинальную ошибку
      this.sendFallbackError(error, errorInfo);
    }
  };

  sendFallbackError = (error, errorInfo) => {
    const errorData = {
      type: 'reactError',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    console.log('Fallback error data:', errorData);
    window.parent.postMessage(errorData, '*');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Ошибка в компоненте</h2>
          <p>{this.state.error?.toString()}</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Подробности ошибки</summary>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
