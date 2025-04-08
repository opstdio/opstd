# @opstd/logger

A flexible and configurable logging utility for Opstd projects, built on top of Pino.

## Features

- Configurable logging with Zod validation
- Environment-specific logging strategies
- Multiple transport options
- TypeScript support

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

## Error Handling

The logger includes built-in error handling. If configuration fails, it falls back to a default logger with minimal configuration.

## License

MIT License