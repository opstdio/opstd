# OPSTD.io Studio

OPSTD.io Studio is the main web application of the OPSTD.io platform, built with Next.js and TypeScript.

## Features

- Modern React with Next.js App Router
- Type-safe environment configuration
- Structured logging
- Component library integration
- Authentication service integration

## Development

### Prerequisites

- Node.js 22+
- pnpm 10.4.1+

### Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run linting
- `pnpm typecheck` - Check types
- `pnpm test` - Run tests

## Project Structure

```
.
├── public/          # Static assets
├── src/
│   ├── app/        # Next.js App Router pages
│   ├── components/ # React components
│   ├── hooks/      # Custom React hooks
│   ├── lib/        # Utility functions
│   └── middleware/ # Next.js middleware
```

## Architecture

The Studio application integrates with various microservices:
- Authentication service for user management
- Database service for data persistence
- Additional services as needed

## Contributing

Please refer to the root-level README.md for contribution guidelines.

## License

ISC License
