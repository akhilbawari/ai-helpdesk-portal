# AI-First Internal Helpdesk Portal - Frontend

This is the frontend application for the AI-First Internal Helpdesk Portal, built using React, TypeScript, and Vite with Tailwind CSS.

## Features

- User authentication (login, register, profile)
- Role-based access control
- Dashboard for different user roles
- Responsive design with Tailwind CSS
- Modern UI components with ShadCN UI

## Tech Stack

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Component Library**: Custom components based on ShadCN UI
- **Icons**: Lucide Icons
- **Fonts**: Google Fonts (Inter, Sora)
- **Animations**: Framer Motion
- **State Management**: React Context API
- **API Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies

```bash
cd ai-helpdesk-portal/frontend
npm install
```

4. Create a `.env` file based on `.env.example` and update the values

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/         # API services and configuration
│   ├── assets/      # Static assets (images, fonts)
│   ├── components/  # Reusable UI components
│   │   ├── auth/    # Authentication components
│   │   └── ui/      # UI components (buttons, cards, etc.)
│   ├── context/     # React Context providers
│   ├── layouts/     # Page layouts
│   ├── pages/       # Application pages
│   ├── utils/       # Utility functions
│   ├── App.tsx      # Main application component
│   └── main.tsx     # Application entry point
├── public/          # Public assets
├── .env             # Environment variables
├── .env.example     # Example environment variables
└── README.md        # Project documentation
```

## Available Routes

- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard (protected)
- `/unauthorized` - Access denied page

## Authentication

The application uses JWT-based authentication with the following features:

- Access tokens for API requests
- Refresh tokens for extended sessions
- Automatic token refresh
- Role-based access control

## Contributing

1. Follow the established coding style
2. Write tests for new features
3. Update documentation as needed
