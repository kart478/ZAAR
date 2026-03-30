# ZAAR Backend API

A Node.js + Express REST API for the ZAAR social web application with in-memory storage.

## Features

- **Authentication**: JWT-based auth with access/refresh tokens
- **Users**: Profile management, password changes
- **Communities**: Create, join, leave communities with role-based permissions
- **Posts & Comments**: Social feed with likes, shares, and comments
- **Events**: Community events with RSVP functionality
- **Projects**: Showcase projects and collaboration requests
- **Security**: Rate limiting, CORS, helmet, input validation
- **In-Memory Storage**: No database required - uses JavaScript Maps

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3001`

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update profile
- `PATCH /api/v1/users/me/password` - Change password

### Communities
- `POST /api/v1/communities` - Create community
- `GET /api/v1/communities` - List communities (with search, filters, pagination)
- `GET /api/v1/communities/:idOrSlug` - Get community details
- `POST /api/v1/communities/:id/join` - Join community
- `POST /api/v1/communities/:id/leave` - Leave community

### Posts
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/feed` - Get personalized feed (auth required)
- `GET /api/v1/posts/global` - Get global feed
- `GET /api/v1/posts/community/:communityId` - Get community feed
- `POST /api/v1/posts/:id/like` - Like post
- `POST /api/v1/posts/:id/unlike` - Unlike post
- `POST /api/v1/posts/:id/share` - Share post

### Comments
- `POST /api/v1/posts/:id/comments` - Create comment
- `GET /api/v1/posts/:id/comments` - Get post comments
- `DELETE /api/v1/comments/:commentId` - Delete own comment

### Events
- `POST /api/v1/events` - Create event (owner/moderator only)
- `GET /api/v1/events/upcoming` - Get upcoming events
- `POST /api/v1/events/:id/rsvp` - RSVP to event

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects (with search, filters)
- `POST /api/v1/projects/:id/request` - Request collaboration

### Development
- `POST /api/v1/dev/reset` - Reset in-memory data (development only)

## Sample Usage

### Register a new user
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "bio": "Software developer",
    "interests": ["programming", "react", "nodejs"]
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a community
```bash
curl -X POST http://localhost:3001/api/v1/communities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "React Developers",
    "description": "A community for React enthusiasts",
    "category": "technology",
    "rules": ["Be respectful", "Stay on topic"]
  }'
```

### Create a post
```bash
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "content": "Just built an amazing React component!",
    "tags": ["react", "javascript", "frontend"]
  }'
```

## Sample Data

The server comes pre-seeded with sample data:

**Users** (password: `admin123` for all):
- admin@zaar.com (Admin)
- sarah@example.com (Photography enthusiast)
- mike@example.com (Developer)
- emma@example.com (Gamer)

**Communities**:
- Photography Lovers
- React Developers  
- Indie Game Devs

**Posts, Events, and Projects** are also pre-populated for testing.

## Response Format

All API responses follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

## Authentication

The API uses JWT tokens for authentication:

1. **Access Token**: Short-lived (15 minutes) used for API requests
2. **Refresh Token**: Long-lived (7 days) used to get new access tokens

Include the access token in the `Authorization` header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication routes: 5 requests per 15 minutes per IP

## Security Features

- Password hashing with bcrypt
- JWT token validation
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection prevention (no SQL used)
- XSS protection

## Development

### Reset Data
To reset the in-memory data to initial state:
```bash
curl -X POST http://localhost:3001/api/v1/dev/reset
```

### Health Check
Check if the server is running:
```bash
curl http://localhost:3001/health
```

## Project Structure

```
src/
├── app.js              # Express app setup
├── server.js           # Server entry point
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── routes/            # API routes
├── utils/             # Utility functions
├── validators/        # Input validation schemas
└── data/              # In-memory data store
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## License

MIT License
