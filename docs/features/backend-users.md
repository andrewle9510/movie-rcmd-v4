# Backend Users Feature

Users feature manages user profiles, preferences, and behavioral tracking.

## File Inventory

### Core Files:
- `packages/backend/convex/features/users/queries/users.ts` - User profile queries and mutations
- `packages/backend/convex/features/users/mutations/user_events.ts` - User event recording

## Functioning Purpose

### Users Queries & Mutations:
- `getUserProfile()`: Fetch user profile with preferences and privacy settings
- `updateUserProfile()`: Update user profile information
- `updateUserPreferences()`: Change user preferences (favorite genres, language, notifications)
- `updateUserPrivacy()`: Update privacy settings (profile visibility, watch history sharing)
- `followCrewMember()`: Add crew member to followed list
- `unfollowCrewMember()`: Remove crew member from followed list
- `followStudio()`: Add studio to followed list
- `unfollowStudio()`: Remove studio from followed list
- `followUser()`: Follow another user
- `unfollowUser()`: Unfollow a user
- `getFollowedCrewMembers()`: Get list of followed crew members
- `getFollowedStudios()`: Get list of followed studios
- `getFollowers()`: Get users following this user
- `getFollowing()`: Get users this user is following

### User Events:
- `recordEvent()`: Log user behavior events (views, ratings, additions to watchlist)
- `getUserEvents()`: Retrieve user event history with pagination
- `deleteUserEvent()`: Remove user event record

## User Profile Structure

```
User {
  _id: Id<"users">
  username: string
  display_name: string
  bio: string
  avatar_url: string
  created_at: string
  preferences: {
    fav_genres: number[]
    adult_content: boolean
    notification_settings: Record<string, boolean>
    language: string
  }
  privacy: {
    profile_public: boolean
    watch_history_public: boolean
    show_ratings_public: boolean
  }
  followed: {
    crew_members: number[]
    studios: number[]
    other_users: Id<"users">[]
  }
}
```

## Event Types

Events recorded include:
- `view`: Movie view
- `rating`: Movie rating
- `watchlist_add`: Movie added to watchlist
- `watchlist_remove`: Movie removed from watchlist
- `review`: User wrote a review

## Related Features

- **watchlist**: Tracks user-movie interactions
- **frontend**: Submits user events and fetches profile
