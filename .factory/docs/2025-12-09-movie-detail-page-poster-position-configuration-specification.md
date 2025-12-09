Based on my analysis of the existing code, I've found that the movie detail page already has a configuration parameter for poster positioning in the MovieDetailUIConfig. Here's the specification:

Current Implementation:
- File: @apps/web/src/config/movie-detail-ui-config.ts
- Parameter: poster.position
- Values: "left" or "right"
- Current default: "right"

Specification for Developer Configuration:
1. The poster position is already configurable via the existing MovieDetailUIConfig.poster.position parameter
2. Developers can change the value from "right" to "left" to move the poster to the left side of the movie detail page
3. The configuration system is already implemented and functional
4. No additional development is required as this feature already exists

Implementation Steps:
1. Document the existing functionality for future reference
2. Confirm the configuration works as expected in the UI
3. Update documentation if needed to highlight this configurable option