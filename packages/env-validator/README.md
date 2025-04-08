# @opstd/env-validator

A robust, type-safe environment variable validation library for Node.js applications.

## Features

- Type-safe environment variable validation using Zod
- Support for multiple .env file loading strategies
- Flexible configuration options
- Integrated logging
- Easy-to-use API

## Installation

```bash
npm install @opstd/env-validator
# or
pnpm add @opstd/env-validator
# or
yarn add @opstd/env-validator
```

## Basic Usage

```typescript
import { EnvValidator, z } from '@opstd/env-validator';

// Basic validation with default schema
const envValidator = new EnvValidator();
console.log(envValidator.env.NODE_ENV); // 'development'

// Custom schema validation
const CustomSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(10)
});

const customEnvValidator = new EnvValidator(CustomSchema);
console.log(customEnvValidator.env.DATABASE_URL);
```

## Advanced Configuration

```typescript
const envValidator = new EnvValidator(CustomSchema, {
  // Custom .env file path
  envPath: './config/.env',
  
  // Service-specific variable prefix
  servicePrefix: 'APP_',
  
  // Enable debug logging
  debug: true,
  
  // Custom error handling
  onValidationError: (error) => {
    // Custom error handling logic
    console.error('Validation failed', error);
  }
});
```

## API Reference

### `EnvValidator` Constructor

```typescript
new EnvValidator(
  schema?: ZodObject, 
  options?: EnvValidationOptions
)
```

#### Options

- `envPath`: Custom path for .env file
- `servicePrefix`: Prefix for service-specific environment variables
- `debug`: Enable debug logging
- `appMode`: Set application mode
- `onValidationError`: Custom error handling callback

### Methods

- `validate()`: Validate environment variables
- `env`: Getter for validated environment variables
- `getAppMode()`: Get current application mode
- `isAppMode(mode)`: Check if current mode matches specified mode

## Environment Modes

Supported modes:
- `development`
- `production`
- `test`
- `staging`

## Error Handling

The validator will exit the process by default on validation errors. You can provide a custom error handler to implement different error handling strategies.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License