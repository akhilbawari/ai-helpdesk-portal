# AI-First Internal Helpdesk Portal - Backend

This is the backend service for the AI-First Internal Helpdesk Portal, built using Node.js, Express, and MongoDB.

## Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- RESTful API endpoints
- MongoDB integration
- Comprehensive error handling
- Logging with Winston
- Unit and integration testing with Jest

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies

```bash
cd ai-helpdesk-portal/backend
npm install
```

4. Create a `.env` file based on `.env.example` and update the values

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

### Testing

```bash
npm test
```

### Seeding the Database

To seed the database with initial data (admin user and test users):

```bash
npm run seed
```

### Admin Tool

For administrative tasks like managing users:

```bash
npm run admin
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (clear refresh token)
- `GET /api/v1/auth/profile` - Get current user profile

### Other endpoints will be added as features are implemented

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # API controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── scripts/       # Utility scripts
│   ├── seeders/       # Database seeders
│   ├── utils/         # Utility functions
│   └── server.js      # Main application file
├── tests/
│   ├── integration/   # Integration tests
│   ├── unit/          # Unit tests
│   ├── setup.js       # Test setup
│   └── utils/         # Test utilities
├── .env               # Environment variables
├── .env.example       # Example environment variables
├── package.json       # Dependencies and scripts
└── README.md          # Project documentation
```

## Contributing

1. Follow the established coding style
2. Write tests for new features
3. Update documentation as needed

## License

This project is proprietary and confidential.