# @opstd/logger

A flexible and configurable logging utility for Opstd projects, built on top of Pino.

## Features

- Configurable logging with Zod validation
- Environment-specific logging strategies
- Multiple transport options
- TypeScript support
- Service metadata inclusion
- Structured JSON logging
- Pretty printing for development

## Installation

```bash
npm install @opstd/logger
# or
pnpm add @opstd/logger
# or
yarn add @opstd/logger
```

## Basic Usage

```typescript
import { createLogger } from '@opstd/logger';

// Create a basic logger
const logger = createLogger({
  serviceName: 'my-service',
  environment: 'development'
});

logger.info('Hello, world!');
logger.error('Something went wrong');

// With additional context
logger.info({ userId: '123' }, 'User logged in');

// With error objects
try {
  throw new Error('Database connection failed');
} catch (error) {
  logger.error({ err: error }, 'Failed to connect to database');
}
```

## Advanced Configuration

### Custom Log Level

```typescript
const logger = createLogger({
  serviceName: 'my-service',
  environment: 'production',
  logLevel: 'warn'
});
```

### Transport Options

```typescript
const logger = createLogger(
  {
    serviceName: 'my-service',
    environment: 'development'
  },
  {
    // Disable logfmt transport
    logfmt: false,
    // Add file logging
    file: {
      destination: './logs/app.log',
      maxSize: '10M',
      maxFiles: 5
    }
  }
);
```

## Configuration Options

### Logger Configuration

- `serviceName`: (required) Name of the service
- `environment`: (required) One of 'development', 'production', or 'test'
- `logLevel`: (optional) Log level ('trace', 'debug', 'info', 'warn', 'error', 'fatal')
- `prettyPrint`: (optional) Enable pretty printing in development
- `enableSourceLocation`: (optional) Include source code location in logs

### Transport Options

- `logfmt`: Enable/disable logfmt transport
- `console`: Enable/disable console transport
- `file`: Configure file logging
  - `destination`: Log file path
  - `maxSize`: Maximum log file size
  - `maxFiles`: Number of log files to keep

## Real-World Examples

### HTTP Request Logging

```typescript
import { createLogger } from '@opstd/logger';
import type { Request, Response, NextFunction } from 'express';

const logger = createLogger({
  serviceName: 'api-gateway',
  environment: process.env.NODE_ENV
});

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent')
    }, 'Request completed');
  });
  
  next();
}
```

### Structured Error Logging

```typescript
class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly query?: string
  ) {
    super(message);
  }
}

const logger = createLogger({
  serviceName: 'database-service',
  environment: 'production'
});

try {
  throw new DatabaseError(
    'Connection timeout',
    'DB_TIMEOUT',
    'SELECT * FROM users'
  );
} catch (error) {
  if (error instanceof DatabaseError) {
    logger.error({
      err: error,
      code: error.code,
      query: error.query
    }, 'Database operation failed');
  }
}
```

### Service Integration

```typescript
// auth-service.ts
const authLogger = createLogger({
  serviceName: 'auth-service',
  environment: process.env.NODE_ENV,
  logLevel: 'debug'
});

// db-service.ts
const dbLogger = createLogger({
  serviceName: 'db-service',
  environment: process.env.NODE_ENV,
  logLevel: 'info'
});

// Logs will include service context automatically
authLogger.info('Authentication successful');
dbLogger.error('Query failed');
```

## Troubleshooting

### Common Issues

1. **Missing Service Name**
```typescript
// Will throw an error
const logger = createLogger({
  environment: 'development'
});

// Fix: Always provide serviceName
const logger = createLogger({
  serviceName: 'my-service',
  environment: 'development'
});
```

2. **Invalid Log Level**
```typescript
// Will use default 'info' level
const logger = createLogger({
  serviceName: 'my-service',
  environment: 'development',
  logLevel: 'invalid-level'
});

// Fix: Use valid log level
const logger = createLogger({
  serviceName: 'my-service',
  environment: 'development',
  logLevel: 'debug'
});
```

3. **File Transport Issues**
```typescript
// Check directory permissions and existence
const logger = createLogger(
  {
    serviceName: 'my-service',
    environment: 'production'
  },
  {
    file: {
      destination: '/var/log/my-service.log' // Ensure directory exists
    }
  }
);
```

### Debug Mode

For development debugging:

```typescript
const logger = createLogger({
  serviceName: 'my-service',
  environment: 'development',
  logLevel: 'debug',
  prettyPrint: true,
  enableSourceLocation: true
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License