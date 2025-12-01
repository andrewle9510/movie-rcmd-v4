# Development Guidelines

This document provides comprehensive guidelines for AI assistants working on the movie recommendation project. It covers project structure, conventions, workflows, and best practices.

## Project Overview

### Purpose
Movie recommendation application built with modern web technologies. The goal is to provide personalized movie recommendations to users based on their preferences and viewing history.

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui components
- **Backend**: Convex (backend-as-a-service platform)
- **Monorepo Tooling**: Turborepo for managing multiple packages
- **Package Manager**: npm 11.6.2
- **UI Components**: radix-ui, lucide-react icons
- **Form Handling**: @tanstack/react-form
- **Validation**: Zod schema validation
- **State Management**: Built-in React hooks and Context API

## Project Structure

```
movie-rcmd-v4/
├── apps/                  # Frontend applications
│   └── web/              # React web application
├── packages/             # Shared libraries and services
│   ├── backend/          # Backend services (Convex, API)
│   └── config/           # Shared configuration
├── docs/                 # Documentation
│   ├── development-guidelines.md  # This file
│   ├── environment-setup.md      # Environment setup rules
│   ├── file-folder-creation-rules.md  # File organization rules
│   ├── naming-conventions.md     # Naming rules
│   └── features/              # Feature documentation
├── turbo.json            # Turborepo configuration
└── package.json          # Root package definitions
```

## Development Workflow

### Before Starting Any Task

**Context Checklist:**
- [ ] Read relevant feature documentation in `docs/features/`
- [ ] Check existing project structure using file-folder-creation-rules.md
- [ ] Review project conventions in development-guidelines.md
- [ ] Understand naming conventions from naming-conventions.md
- [ ] Check environment setup requirements

### Three-Stage Development Approach

#### Stage 1: Planning
Create informal documentation when you need to:
- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns  
- Optimize performance (changes behavior)
- Update security patterns

**Skip planning for:**
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

**Workflow:**
1. Review `docs/development-guidelines.md`, project structure, and existing features
2. Understand the scope and impact of changes needed
3. Plan implementation approach
4. Consider dependencies and potential side effects

#### Stage 2: Implementation
Track these steps and complete them one by one:
1. **Understand the requirements** - Review feature documentation and patterns
2. **Plan file structure** - Use `docs/file-folder-creation-rules.md`
3. **Implement sequentially** - Complete in logical order
4. **Update documentation** - Create/update feature docs at `docs/features/`
5. **Verify completion** - Ensure all aspects are properly implemented
6. **Test thoroughly** - Verify functionality works as expected

#### Stage 3: Documentation
After implementation:
1. **Create feature documentation** - Add to `docs/features/<feature-name>.md`
2. **Update related docs** - Modify any affected documentation
3. **Review consistency** - Ensure docs match implementation
4. **Maintain sync** - Keep documentation updated with code changes

## Code Conventions

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
- Type safety enforced through TypeScript strict mode
- Consider adding unit tests for complex logic
- Consider adding E2E tests for critical user flows
- Always test the implementation before completing work

### Git Workflow
- Main branch as default
- Clean working directory with organized file structure
- Commit messages should be descriptive and clear
- Always test before committing changes

## File Organization

### Key Principles
1. **Follow naming conventions**: Use kebab-case for directories, PascalCase for components
2. **Group related functionality**: Create folders to group related files together
3. **Keep structure shallow**: Avoid deep nesting - maximum 3-4 levels deep
4. **Be descriptive**: File and folder names should clearly indicate their purpose

### App-Specific Structure
For new features in web app:
```
apps/web/src/
├── app/
│   ├── shared/              # Layout providers (Convex, theme)
│   ├── layout.tsx
│   ├── page.tsx
│   └── [feature]/           # Nested routes
├── features/
│   ├── movie-browsing/      # Example feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── index.ts
│   └── movie-detail/        # Example feature
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── types/
│       └── index.ts
└── shared/
    ├── components/
    ├── providers/
    ├── hooks/
    ├── types/
    ├── utils/
    └── constants/
```

### Package-Specific Structure
For new shared packages:
```
packages/<package-name>/src/
├── components/        # React components
├── hooks/            # Custom React hooks
├── services/         # API/service integrations
├── utils/            # Utility functions
├── types/            # TypeScript definitions
├── constants/        # Constants and enums
└── index.ts          # Main export file
```

## Best Practices

### Simplicity First
- Default to <100 lines of new code
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns

### Complexity Triggers
Only add complexity with:
- Performance data showing current solution too slow
- Concrete scale requirements (>1000 users, >100MB data)
- Multiple proven use cases requiring abstraction

### Clear References
- Use `file.ts:42` format for code locations
- Reference docs as `docs/development-guidelines.md`
- Link related features and documentation

### Feature Naming
- Use verb-noun: `movie-browsing`, `user-auth`
- Single purpose per feature
- 10-minute understandability rule
- Split if description needs "AND"

## Cross-Package Organization

### Package Dependencies
1. **Avoid Circular Dependencies**: Package A can depend on Package B, but Package B cannot depend on Package A
2. **Respect Boundaries**: Apps can import from packages, but packages shouldn't import from apps
3. **Shared Types**: Common types should be in `packages/config/src/types/` or dedicated types package

### Cross-Package Communication
1. **API Layer**: Backend packages expose APIs that apps consume
2. **Shared Components**: UI packages provide components to multiple apps
3. **Event System**: Use event bus for cross-package communication when needed

## Documentation Requirements

### Feature Documentation
When creating new files or folders for a specific feature, you must create a corresponding feature note to document the implementation.

**Requirements:**
1. **Creation**: Whenever a new feature structure is created, create a matching documentation file
2. **Location**: Place the file in `docs/features/<feature-name>.md`
3. **Content**:
   - **File Inventory**: List the key files and folders created
   - **Functioning Purpose**: Explain the purpose of each file
   - **Interaction**: Describe how files work together to provide the feature

### Documentation Format
```markdown
# <Feature Name>

## File Inventory

### Core Files:
- `path/to/file1.tsx` - Brief description

### Supporting Files:
- `path/to/file2.ts` - Brief description

## Functioning Purpose

- **File 1**: Detailed description of purpose and responsibility
- **File 2**: Detailed description of purpose and responsibility

## Interaction

Description of how files work together to provide the feature functionality.
```

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

## Tool Selection Guide

| Task | Tool | Why |
|------|------|-----|
| Find files by pattern | Glob | Fast pattern matching |
| Search code content | Grep | Optimized regex search |
| Read specific files | Read | Direct file access |
| Explore unknown scope | Task | Multi-step investigation |

## Error Recovery

### Common Issues
1. **Import Errors**: Verify paths and ensure package.json exports are properly configured
2. **Build Failures**: Check for circular dependencies and improper package boundaries
3. **Naming Conflicts**: Be specific with names to avoid conflicts with existing code
4. **Missing Types**: Ensure types are properly exported and imported where needed

### Troubleshooting Steps
1. Check documentation in `docs/` directory
2. Review similar existing implementations
3. Verify file structure follows conventions
4. Test changes incrementally
5. Update documentation as needed

## Quick Reference

### Key Documentation Files
- **`docs/development-guidelines.md`**: Main development guidelines (this file)
- **`docs/environment-setup.md`**: Environment setup rules
- **`docs/file-folder-creation-rules.md`**: File organization rules
- **`docs/naming-conventions.md`**: Naming conventions
- **`docs/features/`**: Feature-specific documentation

### Decision Tree for File Placement
When creating a new file or folder:
1. **Is it for a specific app?** → `apps/<app-name>/src/`
2. **Is it shared between apps?** → `packages/<appropriate-package>/src/`
3. **Is it backend/infrastructure?** → `packages/backend/src/`
4. **Is it UI components?** → `packages/ui/src/`
5. **Is it configuration or types?** → `packages/config/src/`

Remember: Documentation is truth. Keep it in sync with the code.
