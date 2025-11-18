# Directory and File Naming Conventions

To ensure consistency across the project and improve discoverability for AI agents, adhere to the following rules:

## Directories
- Use **kebab-case** (e.g., `user-management`, `auth-service`)
- All lowercase letters
- Hyphens for word separation (no underscores)
- Avoid spaces and special characters

## Files
- **React components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Non-component files**: `kebab-case` (e.g., `utility-functions.ts`, `api-client.js`)
- **Configuration files**: Standard names (e.g., `.env`, `tsconfig.json`, `eslint.config.js`)
- All files must be lowercase except component names

## Agent-Friendly Naming
- File names SHOULD clearly describe their purpose and functionality
- Include relevant context in the filename when possible
- Examples of good agent-friendly names:
  - `fetch-movie-data-tmdb.ts` (clearly indicates data fetching from TMDB)
  - `import-movie-data-to-db-convex.ts` (clearly indicates data import to Convex DB)
  - `validate-user-input-form.ts` (clearly indicates form validation)
- Avoid vague names like `utils.ts` or `helpers.ts` that don't indicate specific functionality

## Top-level Structure
- `apps/`: Frontend applications (e.g., `apps/web`, `apps/mobile`)
- `packages/`: Shared libraries (e.g., `packages/ui`, `packages/data-access`)
- `config/`: Runtime configuration files (e.g., `.env`)
- `scripts/`: Build scripts and utilities
- Top-level files:
  - `turbo.json`: Turborepo configuration
  - `bts.jsonc`: Project-specific settings
  - `package.json`, `package-lock.json`: Node.js dependency management

## Exceptions
- Ignore for existing files that violate conventions; fix during refactor

This ensures clarity, cross-platform compatibility, and alignment with common industry practices for TypeScript projects and Turborepo monorepos. Following agent-friendly naming conventions improves codebase navigation for both human developers and AI assistants.
