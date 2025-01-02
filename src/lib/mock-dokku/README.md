# Mock Dokku API

Simple mock implementation of Dokku API for development and testing.

## Features

- Full Dokku API emulation
- Real-time logs and metrics
- Deployment simulation
- Error scenarios

## API Endpoints

### Apps

- `GET /api/mock-dokku/apps` - List all apps
- `POST /api/mock-dokku/apps` - Create app
- `GET /api/mock-dokku/apps/:name` - Get app details
- `DELETE /api/mock-dokku/apps/:name` - Delete app

### Deployment

- `POST /api/mock-dokku/deploy/:name` - Deploy app
- `GET /api/mock-dokku/deploy/:name/status` - Get deployment status

### Events & Logs

- `GET /api/mock-dokku/events/:name` - SSE stream with events
- `GET /api/mock-dokku/logs/:name` - Get app logs

## Events

1. **Log Events**
```typescript
{
  type: 'log',
  appName: string,
  data: {
    timestamp: number,
    type: 'system' | 'app' | 'deploy',
    level: 'info' | 'warn' | 'error',
    message: string
  }
}
```

2. **Deployment Events**
```typescript
{
  type: 'deployment',
  appName: string,
  data: {
    status: 'pending' | 'building' | 'deploying' | 'completed' | 'failed',
    message?: string
  }
}
```

## Example Usage

```bash
# Subscribe to events
curl -N http://localhost:4321/api/mock-dokku/events/my-app

# Create app
curl -X POST http://localhost:4321/api/mock-dokku/apps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app",
    "gitUrl": "https://github.com/user/repo.git",
    "env": {
      "NODE_ENV": "production"
    }
  }'

# Deploy app
curl -X POST http://localhost:4321/api/mock-dokku/deploy/my-app \
  -H "Content-Type: application/json" \
  -d '{"gitUrl": "https://github.com/user/repo.git"}'
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## License

MIT License
