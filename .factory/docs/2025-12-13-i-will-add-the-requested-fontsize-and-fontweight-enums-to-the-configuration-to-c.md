I will add the requested `FontSize` and `FontWeight` enums to the configuration to complete the simplified design system.

### 1. Update `apps/web/src/config/movie-detail-ui-config.ts`

I will add two new Enums with 3 clear options each:

```typescript
export enum FontSize {
  Large  = "3rem",      // For main titles
  Medium = "1.5rem",    // For taglines/subtitles
  Small  = "1.125rem",  // For body text
}

export enum FontWeight {
  Bold   = "800",
  Medium = "500",
  Regular = "400",
}
```

I will then update the `MovieDetailUIConfig` to use these new Enums, fully replacing all raw strings with safe choices.

This will give you total control over the design using only Enums:
*   `FontFamily`
*   `TextColor`
*   `FontSize`
*   `FontWeight`