# File and Folder Creation Rules

This document provides comprehensive guidelines for AI agents on how to create and organize files and folders in this movie recommendation project. For naming conventions, refer to [`docs/naming-conventions.md`](./naming-conventions.md).

## Project Structure Overview

This is a Turborepo monorepo with the following top-level structure:

```
movie-rcmd-v4/
├── apps/                  # Frontend applications
│   └── web/              # React web application
├── packages/             # Shared libraries and services
│   ├── backend/          # Backend services (Convex, API)
│   └── config/           # Shared configuration
├── docs/                 # Documentation
├── turbo.json            # Turborepo configuration
└── package.json          # Root package definitions
```

## File Placement Rules

### Apps Directory (`apps/`)

The `apps/` directory contains standalone applications that users interact with:

- **New Frontend Apps**: Place in `apps/<app-name>/`
- **App-Specific Components**: Inside the app directory, typically in `apps/<app-name>/src/components/`
- **App-Specific Pages**: Inside the app directory, typically in `apps/<app-name>/src/pages/`
- **App-Specific Utilities**: Inside the app directory, typically in `apps/<app-name>/src/utils/`
- **App-Specific Styles**: Inside the app directory, typically in `apps/<app-name>/src/styles/`

### Packages Directory (`packages/`)

The `packages/` directory contains shared code and services used by multiple apps:

- **Shared Components**: `packages/ui/src/components/`
- **Data Access Layer**: `packages/data-access/src/`
- **Backend Services**: `packages/backend/src/`
- **Configuration**: `packages/config/src/`
- **Shared Utilities**: `packages/<package-name>/src/utils/`
- **Shared Types**: `packages/<package-name>/src/types/`

### Documentation Directory (`docs/`)

All documentation files should be placed in the `docs/` directory:
- **Project Guidelines**: `docs/naming-conventions.md`, `docs/file-folder-creation-rules.md`
- **Setup Instructions**: `docs/environment-setup.md`
- **Feature Documentation**: `docs/features/<feature-name>.md`

## Folder Creation Guidelines

### Creating New Folders

1. **Follow Naming Conventions**: Use kebab-case for all folder names (e.g., `movie-browser`, `user-auth`)
2. **Group Related Functionality**: Create folders to group related files together
3. **Keep Shallow Structure**: Avoid deep nesting - maximum 3-4 levels deep
4. **Be Descriptive**: Folder names should clearly indicate their purpose

### App-Specific Folder Structure

For new features in web app:
```
apps/web/src/
├── features/
│   ├── movie-browser/
│   │   ├── components/
│   │   │   ├── movie-card/
│   │   │   │   ├── MovieCard.tsx
│   │   │   │   ├── MovieCard.styles.ts
│   │   │   │   └── MovieCard.types.ts
│   │   │   └── movie-grid/
│   │   │       ├── MovieGrid.tsx
│   │   │       └── MovieGrid.styles.ts
│   │   ├── hooks/
│   │   │   └── use-movie-data.ts
│   │   ├── utils/
│   │   │   └── process-movie-data.ts
│   │   └── types/
│   │       └── movie-browser.types.ts
│   └── user-profile/
└── shared/
    ├── components/
    └── utils/
```

### Package-Specific Folder Structure

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

## Cross-Package Organization

### Package Dependencies

1. **Avoid Circular Dependencies**: Package A can depend on Package B, but Package B cannot depend on Package A
2. **Respect Boundaries**: Apps can import from packages, but packages shouldn't import from apps
3. **Shared Types**: Common types should be in `packages/config/src/types/` or dedicated types package

### Cross-Package Communication

1. **API Layer**: Backend packages expose APIs that apps consume
2. **Shared Components**: UI packages provide components to multiple apps
3. **Event System**: Use event bus for cross-package communication when needed

## File and Folder Templates

### New Component Template

```
<component-name>/
├── <ComponentName>.tsx        # Main component file
├── <ComponentName>.styles.ts  # Styles for the component
├── <ComponentName>.types.ts   # TypeScript interfaces/types
├── <ComponentName>.test.tsx   # Unit tests
└── index.ts                   # Exports
```

### New Service Template

```
<service-name>/
├── <ServiceName>.ts           # Main service implementation
├── <ServiceName>.types.ts     # Service interfaces
├── <ServiceName>.test.ts      # Unit tests
└── index.ts                   # Exports
```

### New Feature Template

```
<feature-name>/
├── components/                # Feature-specific components
├── hooks/                    # Feature-specific hooks
├── services/                 # Feature-specific services
├── utils/                    # Feature-specific utilities
├── types/                    # Feature-specific types
└── index.ts                  # Feature exports
```

## Feature Documentation Rules

When creating new files or folders for a specific feature, you must create a corresponding feature note to document the implementation.

### Feature Note Requirements

1. **Creation**: Whenever a new feature structure is created (e.g., `apps/web/src/features/<feature-name>`), create a matching documentation file.
2. **Location**: Place the file in `docs/features/<feature-name>.md`.
3. **Content**:
   - **File Inventory**: List the key files and folders created.
   - **Functioning Purpose**: Explain the specific purpose and responsibility of each file.
   - **Interaction**: Briefly describe how these files interact to provide the feature's functionality.

## Implementation Examples

### Example 1: Creating a New Movie Browse Feature

```bash
# 1. Create feature folder
mkdir -p apps/web/src/features/movie-browser

# 2. Create subfolders
mkdir -p apps/web/src/features/movie-browser/components
mkdir -p apps/web/src/features/movie-browser/hooks
mkdir -p apps/web/src/features/movie-browser/utils
mkdir -p apps/web/src/features/movie-browser/types

# 3. Create component folder
mkdir -p apps/web/src/features/movie-browser/components/movie-card
```

### Example 2: Creating a New Shared UI Package

```bash
# 1. Create package folder
mkdir -p packages/ui/src

# 2. Create subfolders
mkdir -p packages/ui/src/components
mkdir -p packages/ui/src/hooks
mkdir -p packages/ui/src/utils
mkdir -p packages/ui/src/styles

# 3. Create package.json
cat > packages/ui/package.json << EOF
{
  "name": "@movie-rcmd-v4/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
EOF
```

### Example 3: Creating a New Backend Service

```bash
# 1. Create service folder
mkdir -p packages/backend/src/services/movie-service

# 2. Create implementation files
touch packages/backend/src/services/movie-service/MovieService.ts
touch packages/backend/src/services/movie-service/MovieService.types.ts
touch packages/backend/src/services/movie-service/MovieService.test.ts
```

## Decision Tree for File Placement

When creating a new file or folder, use this decision tree:

1. **Is it for a specific app?**
   - Yes → Place in `apps/<app-name>/src/`
   - No → Go to step 2

2. **Is it shared between multiple apps or packages?**
   - Yes → Place in `packages/<appropriate-package>/src/`
   - No → Go to step 3

3. **Is it related to backend/infrastructure?**
   - Yes → Place in `packages/backend/src/`
   - No → Go to step 4

4. **Is it related to UI components?**
   - Yes → Create or use `packages/ui/src/`
   - No → Go to step 5

5. **Is it configuration or types?**
   - Yes → Place in `packages/config/src/`
   - No → Consider creating a new dedicated package

## Best Practices

1. **Create Only What You Need**: Don't create empty folders or files unnecessarily
2. **Follow Existing Patterns**: Look at how similar functionality is organized
3. **Keep It Simple**: Simple structure is better than complex structure
4. **Update References**: When moving files, update all import statements
5. **Document Major Changes**: Update relevant docs when making structural changes

## Integration with Naming Conventions

This document provides guidelines on **where** to create files and folders. For naming rules (kebab-case, PascalCase, etc.), refer to [`docs/naming-conventions.md`](./naming-conventions.md).

Example of combining both rules:
- **Correct**: `apps/web/src/features/movie-browser/components/MovieCard.tsx`
- **Incorrect**: `apps/web/src/Features/MovieBrowser/Components/movieCard.tsx`

## Troubleshooting common issues

1. **Import Errors**: Verify paths and ensure package.json exports are properly configured
2. **Build Failures**: Check for circular dependencies and improper package boundaries
3. **Naming Conflicts**: Be specific with names to avoid conflicts with existing code
4. **Missing Types**: Ensure types are properly exported and imported where needed
