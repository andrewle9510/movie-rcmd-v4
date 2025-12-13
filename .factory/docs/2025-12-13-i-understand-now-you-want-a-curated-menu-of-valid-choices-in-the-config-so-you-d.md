I understand now. You want a **curated menu** of valid choices in the config, so you don't have to deal with raw strings or imports. You want to pick from a list of "safe" options I provide.

I will implement a **`MovieDetailDesignSystem`** within the config file.

### 1. Update `apps/web/src/app/layout.tsx`
I will import a selection of great Google Fonts for you to choose from (Montserrat, Inter, Playfair Display, Lato). I will set them all up so they are ready to use.

### 2. Update `apps/web/src/config/movie-detail-ui-config.ts`

I will create Enums that act as your "Menu":

```typescript
// The Menu
export enum FontFamily {
  // Styles
  Headline = "var(--font-montserrat), sans-serif",
  Body     = "var(--font-inter), sans-serif",
  Classic  = "var(--font-playfair), serif",
  Modern   = "var(--font-lato), sans-serif",
}

export enum TextColor {
  White   = "text-white",
  Light   = "text-gray-200",
  Muted   = "text-gray-400",
  Accent  = "text-blue-400",
}

// Your Config (Using the Menu)
export const MovieDetailUIConfig = {
  headers: {
    title: {
      fontFamily: FontFamily.Headline, // You pick from the list!
      color: TextColor.White,          // You pick from the list!
      // ...
    },
    // ...
  }
}
```

This gives you exactly what you asked for: **`FontFamily.Headline`** or **`FontFamily.Classic`**. It hides the complexity but lets you switch styles instantly.