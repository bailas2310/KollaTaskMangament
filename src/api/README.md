# API Layer Documentation

## Overview

The API layer is designed to seamlessly switch between mock data (Phase 1) and real backend API (Phase 2) using a simple configuration flag.

## Configuration

Edit `src/api/config.ts` to toggle between mock and real API:

```typescript
export const API_CONFIG = {
  useMock: true,  // Set to false when backend is ready
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  // ...
}
```

## Architecture

### Phase 1: Mock Mode (Current)
- Uses in-memory mock repositories
- All data is stored locally
- No network requests
- Perfect for development and prototyping

### Phase 2: Real API Mode
- Uses Axios HTTP client
- Makes real API calls to backend
- Handles authentication tokens
- Error handling and interceptors

## Structure

```
api/
├── config.ts              # Configuration (useMock flag)
├── client.ts              # Axios client with interceptors
├── ServiceFactory.ts      # Factory that switches between mock/real
├── adapters/              # Adapters to make API services work like repositories
│   ├── TaskApiAdapter.ts
│   ├── UserApiAdapter.ts
│   ├── NotificationApiAdapter.ts
│   └── ActivityApiAdapter.ts
├── services/              # API service classes (for real API)
│   ├── TaskApiService.ts
│   ├── AuthApiService.ts
│   ├── NotificationApiService.ts
│   └── ActivityApiService.ts
└── Mock*Repository.ts     # Mock repositories (for mock mode)
```

## Switching to Real API

1. Set `useMock: false` in `config.ts`
2. Set `VITE_API_BASE_URL` in `.env` file
3. Ensure backend endpoints match the structure in `config.ts`
4. Test authentication flow

## API Endpoints Structure

The backend should implement these endpoints:

- `POST /auth/login` - Login with email and role
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user
- `GET /tasks` - Get all tasks (with filters)
- `POST /tasks` - Create task
- `PATCH /tasks/:id/status` - Update task status
- `PATCH /tasks/:id/priority` - Override priority
- `GET /notifications` - Get notifications
- `GET /activities` - Get activity feed

## Authentication

When using real API:
- Token is stored in `localStorage` as `kolla_token`
- Token is automatically added to requests via Axios interceptor
- On 401 error, user is redirected to login

## Error Handling

The Axios client includes interceptors for:
- Adding auth tokens to requests
- Handling 401 (unauthorized) errors
- Handling 403 (forbidden) errors
- Network errors
- Server errors

