# OPSTD.io Monorepo

## Project Overview

OPSTD.io is a modern, modular monorepo built with TypeScript, Next.js, and a robust microservices architecture. The project is designed to provide a scalable and maintainable software development ecosystem.

## Tech Stack

- **Package Manager**: pnpm
- **Build Tool**: Turborepo
- **Language**: TypeScript
- **Frontend**: Next.js
- **ORM**: Drizzle
- **Linting & Formatting**: Biome
- **Environment Validation**: Custom env-validator package
- **Logging**: Custom logger package
- **Testing**: Vitest

## Project Structure

```
.
├── apps/                # Application-specific code
│   └── studio/         # Main application
├── packages/           # Shared packages and utilities
│   ├── env-validator/  # Environment configuration validation
│   ├── logger/         # Logging utility
│   ├── studio-ui/      # Shared UI components
│   └── tsconfig/       # Shared TypeScript configurations
└── services/           # Microservices
    ├── auth/           # Authentication service
    └── db/             # Database service
```

### Services Overview

#### Authentication Service (services/auth)
- User authentication and authorization
- JWT token management
- Session handling
- OAuth integration support
- Secure cookie management

#### Database Service (services/db)
- Central data management
- Schema migrations with Drizzle
- Data validation
- Query optimization
- Connection pooling

## Prerequisites

- Node.js 22+
- pnpm 10.4.1+
- Docker and Docker Compose (for running services)

## Setup and Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example env files
   cp .env.example .env
   cp services/auth/.env.example services/auth/.env
   cp services/db/.env.example services/db/.env
   ```

4. Start services:
   ```bash
   docker-compose up -d
   ```

## Development Workflow

### Running the Project

- Start development mode:
  ```bash
  pnpm dev
  ```

- Build the project:
  ```bash
  pnpm build
  ```

### Code Quality

- Format code:
  ```bash
  pnpm format
  ```

- Lint code:
  ```bash
  pnpm lint
  ```

- Type checking:
  ```bash
  pnpm typecheck
  ```

### Testing

- Run all tests:
  ```bash
  pnpm test
  ```

- Run tests with coverage:
  ```bash
  pnpm test:coverage
  ```

#### Package-Specific Testing

Each package has its own test suite:

- **env-validator**: Tests environment variable validation
  - Covers default environment variables
  - Supports custom environment schemas
  - Handles different app modes
  - Validates service-specific prefixes

- **logger**: Tests logging utility
  - Validates logger creation
  - Checks log level configuration
  - Verifies transport options
  - Ensures service metadata inclusion

### Database Operations

- Generate database schema:
  ```bash
  pnpm db:generate
  ```

- Run database migrations:
  ```bash
  pnpm db:migrate
  ```

## Environment Configuration

The project uses a custom `env-validator` package for robust environment configuration:
- Supports multiple .env files
- Validates environment variables
- Provides type-safe configuration
- Service-specific variable prefixes

## Service Communication

Services communicate through:
- RESTful APIs
- WebSocket connections (when needed)
- Message queues (for async operations)

## Monitoring and Logging

- Centralized logging with custom logger package
- Service-specific log levels and transports
- Structured JSON logging
- Development-friendly pretty printing

## Deployment

1. Build all packages and applications:
   ```bash
   pnpm build
   ```

2. Push Docker images:
   ```bash
   docker-compose build
   docker-compose push
   ```

3. Deploy services:
   ```bash
   # Using your preferred deployment method
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Versioning and Releases

- Create a changeset:
  ```bash
  pnpm changeset
  ```

- Publish a release:
  ```bash
  pnpm release
  ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes using conventional commits
4. Push and create a pull request
5. Ensure all tests pass before submitting

## Troubleshooting

Common issues and solutions:

1. **Service Connection Issues**
   - Check if all required services are running
   - Verify environment variables
   - Check network connectivity

2. **Build Failures**
   - Clear build caches: `pnpm clean`
   - Update dependencies: `pnpm update`
   - Check TypeScript errors: `pnpm typecheck`

3. **Database Issues**
   - Verify connection strings
   - Check migration status
   - Ensure proper permissions

## License

ISC License

## Contact

For more information, please contact the project maintainers.