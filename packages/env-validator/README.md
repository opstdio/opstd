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

## Real-World Examples

### Service-Specific Configuration

```typescript
// auth-service.ts
const authSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  AUTH_EXPIRES_IN: z.string().regex(/^\d+[hdwm]$/),
  AUTH_COOKIE_NAME: z.string(),
  AUTH_SERVICE_PORT: z.coerce.number().min(1000)
});

const authEnv = new EnvValidator(authSchema, {
  servicePrefix: 'AUTH_',
  debug: process.env.NODE_ENV === 'development'
});

// Now you have type-safe access to AUTH_* variables
const { AUTH_SECRET, AUTH_EXPIRES_IN } = authEnv.env;
```

### Multiple Environment Files

```typescript
// Load different .env files based on environment
const envValidator = new EnvValidator(schema, {
  envPath: process.env.NODE_ENV === 'test' 
    ? '.env.test'
    : '.env'
});
```

## Troubleshooting

### Common Issues

1. **Missing Required Variables**
   ```typescript
   // Problem: Required variables not defined
   const schema = z.object({
     API_KEY: z.string()
   });
   // Solution: Provide default values
   const schema = z.object({
     API_KEY: z.string().default('development-key')
   });
   ```

2. **Invalid Variable Types**
   ```typescript
   // Problem: Number stored as string
   PORT=3000
   // Solution: Use coerce
   const schema = z.object({
     PORT: z.coerce.number()
   });
   ```

3. **Prefix Conflicts**
   ```typescript
   // Problem: Multiple services using same prefix
   AUTH_PORT=3000
   AUTH_API_PORT=3001
   // Solution: Use unique prefixes
   const authEnv = new EnvValidator(schema, {
     servicePrefix: 'AUTH_API_'
   });
   ```

### Debug Mode

Enable debug mode to get detailed validation errors:

```typescript
const envValidator = new EnvValidator(schema, {
  debug: true,
  onValidationError: (error) => {
    console.error('Validation failed:', error.errors);
    // Log additional context if needed
    console.error('Current env:', process.env);
  }
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License