Specification for adding header font configuration parameters for movie title and release year to @apps/web/src/config/movie-detail-ui-config.ts:

New Header Font Configuration Section:
Add a new `headers` section to the MovieDetailUIConfig object that will include specific parameters for the two header fields:

```
// Header typography configuration
headers: {
  title: {
    fontFamily: "Inter", // Font family for movie title
    fontSize: "2.5rem", // Size for movie title
    fontWeight: "800", // Font weight for movie title (bold)
    color: "text-white", // Text color for movie title
    lineHeight: "1.2", // Line height for movie title
    letterSpacing: "-0.02em", // Letter spacing for movie title
  },
  releaseYear: {
    fontFamily: "Inter", // Font family for release year
    fontSize: "1.5rem", // Size for release year
    fontWeight: "400", // Font weight for release year (normal)
    color: "text-gray-300", // Text color for release year
    lineHeight: "1.4", // Line height for release year
    letterSpacing: "0.05em", // Letter spacing for release year
  },
},
```

This would allow developers to easily customize the typography of both the movie title and release year headers through the centralized configuration file.