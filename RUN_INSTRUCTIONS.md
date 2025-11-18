# How to Run the Movie Recommendation System

This guide provides detailed instructions for running both the frontend and backend components of the movie recommendation system.

## Prerequisites

Before running the project, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v11.6.2 or higher)

## Project Structure

```
movie-rcmd-v4/
├── apps/
│   └── web/         # Frontend application (Next.js)
├── packages/
│   └── backend/     # Convex backend functions and schema
```

## Initial Setup

1. **Clone and navigate to the repository** (if not already):
   ```bash
   cd /path/to/movie-rcmd-v4
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

## Backend Setup (Convex)

The backend uses Convex, a backend-as-a-service platform. Follow these steps to set it up:

1. **Initial Convex setup**:
   ```bash
   npm run dev:setup
   ```

   This command will:
   - Prompt you to create a new Convex project
   - Help you configure Convex for your application
   - Set up all necessary backend connections
   - Continue until setup is complete

2. **Start the backend in development mode**:
   ```bash
   npm run dev:server
   ```

   This starts the Convex backend which will handle:
   - Database operations
   - User authentication
   - Movie data management
   - API endpoints

## Frontend Setup (Next.js)

The frontend is a Next.js application that consumes the Convex backend.

1. **Start the frontend in development mode**:
   ```bash
   npm run dev:web
   ```

   This will:
   - Start the Next.js development server
   - Run on http://localhost:3001 by default
   - Connect to the Convex backend automatically

## Running Both Frontend and Backend Together

For a complete development experience, run both components simultaneously:

1. **Full stack development**:
   ```bash
   npm run dev
   ```

   This command uses Turborepo to:
   - Start the Convex backend
   - Start the Next.js frontend
   - Run both in parallel with hot-reloading

2. **Access the application**:
   - Open http://localhost:3001 in your browser
   - The frontend will automatically connect to the Convex backend

## Troubleshooting

### Common Issues

1. **Convex setup fails**:
   - Make sure you have a Convex account
   - Verify your internet connection
   - Run `npm run dev:setup` again

2. **Frontend won't start**:
   - Check if port 3001 is available
   - Verify all dependencies were installed with `npm install`
   - Check for errors in the console output

3. **Backend connection issues**:
   - Ensure Convex setup completed successfully
   - Check that your Convex project is properly configured
   - Verify backend is running with `npm run dev:server`

## Additional Commands

### Building for Production

```bash
# Build all applications
npm run build

# Start production servers
npm run dev:web
```

### Type Checking

```bash
# Check TypeScript types across all apps
npm run check-types
```

### Component-specific Development

```bash
# Run only the frontend
npm run dev:web

# Run only the backend setup
npm run dev:setup

# Run only the backend server
npm run dev:server
```

## Environment Variables

This project may require environment variables for configuration. Consult the documentation for specific variables needed for:

- Convex deployment keys
- Third-party API keys (for movie data)
- Other service configurations

## Development Workflow

During active development:

1. Make changes to frontend code in `apps/web/`
2. Make changes to backend logic in `packages/backend/`
3. Both components will hot-reload automatically
4. The frontend will automatically detect backend schema changes

For more information about the tech stack, refer to the main README.md file.
