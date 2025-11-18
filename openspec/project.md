# Project Context

## Purpose
Movie recommendation application built with modern web technologies. The goal is to provide personalized movie recommendations to users based on their preferences and viewing history.

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui components
- **Backend**: Convex (backend-as-a-service platform)
- **Monorepo Tooling**: Turborepo for managing multiple packages
- **Package Manager**: npm 11.6.2
- **UI Components**: radix-ui, lucide-react icons
- **Form Handling**: @tanstack/react-form
- **Validation**: Zod schema validation
- **State Management**: Built-in React hooks and Context API

## Project Conventions

### Code Style
- Strict TypeScript with `"strict": true` in tsconfig.json
- ES Modules with modern JavaScript features (ES2017+ target)
- Path aliases using `@/*` mapped to `./src/*` in web app
- Verbatim module syntax enabled for explicit imports/exports
- JSX transform using react-jsx

### Architecture Patterns
- Monorepo structure with apps and packages separation
- Frontend-backend separation with Convex handling backend logic
- Component-driven UI development with reusable shadcn/ui components
- Type-safe API interactions through Convex functions

### Testing Strategy
- Currently no specific testing framework configured
- Type safety enforced through TypeScript strict mode
- Potential for adding Jest/Vitest for unit tests and Playwright/Cypress for E2E tests

### Git Workflow
- Main branch as default
- Standard commit conventions (implied)
- Clean working directory with organized file structure

## Domain Context
Movie recommendation system that likely involves:
- User profiles and preferences
- Movie data management
- Recommendation algorithms
- Viewing history tracking
- Personalized content delivery

## Important Constraints
- Relies on Convex platform for backend functionality
- Uses specific versions of Next.js (16.0.0) and React (19.2.0)
- Monorepo structure requires Turborepo for coordinated builds
- Backend functions must conform to Convex runtime environment

## External Dependencies
- Convex platform for backend services
- TMDB or similar movie database API (assumed based on project purpose)
- npm registry for package dependencies
