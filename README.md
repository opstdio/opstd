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

## Project Structure

```
.
├── apps/                # Application-specific code
│   └── studio/          # Main application
├── packages/            # Shared packages and utilities
│   ├── env-validator/   # Environment configuration validation
│   ├── logger/          # Logging utility
│   ├── studio-ui/       # Shared UI components
│   └── tsconfig/        # Shared TypeScript configurations
└── services/            # Microservices
    ├── auth/            # Authentication service
    └── db/              # Database service
```

## Prerequisites

- Node.js 22+
- pnpm 10.4.1+

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
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

## License

ISC License

## Contact

For more information, please contact the project maintainers.