# Naija Sniper Backend

This is the backend service for the Naija Sniper mobile game, built with NestJS and MongoDB.

## Features

- **User Management**: Registration, authentication, profile management
- **Tournament System**: Create tournaments, record scores, view leaderboards
- **Bounty System**: Create bounties, record winners

## Prerequisites

- Node.js (v16 or later)
- MongoDB (local or Atlas)

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory and add the following variables:

```
MONGODB_URI=mongodb://localhost:27017/naija-sniper
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## Running the app

```bash
# Development
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tournaments

- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/active` - Get active tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament
- `POST /api/tournaments/record-score` - Record a score
- `GET /api/tournaments/leaderboard/:tournamentId` - Get tournament leaderboard

### Bounties

- `GET /api/bounties` - Get all bounties
- `GET /api/bounties/active` - Get active bounties
- `GET /api/bounties/:id` - Get bounty by ID
- `POST /api/bounties` - Create bounty
- `PUT /api/bounties/:id` - Update bounty
- `DELETE /api/bounties/:id` - Delete bounty
- `POST /api/bounties/winners` - Add a bounty winner
- `GET /api/bounties/winners/:bountyId` - Get winners for a bounty
- `DELETE /api/bounties/winners/:id` - Remove a bounty winner

## License

This project is licensed under the MIT License.
