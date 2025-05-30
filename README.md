# AI-First Internal Helpdesk Portal

A comprehensive internal helpdesk system leveraging AI to automate and enhance employee support across IT, HR, and Admin departments.

## Project Overview

This project implements an AI-first helpdesk portal with the following features:

- User authentication with role-based access control
- Ticket management system with AI-powered routing
- Knowledge base with versioning and search capabilities
- AI-powered response suggestions for support agents
- Self-service answer bot for employees
- Advanced analytics and pattern detection

## Repository Structure

This project consists of two main components:

- **Backend**: Node.js with Express and MongoDB API
- **Frontend**: React with TypeScript and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd ai-helpdesk-portal/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and update values

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ai-helpdesk-portal/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and update values

4. Start the development server:
```bash
npm run dev
```

## Architecture

- **Authentication**: JWT-based with refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful endpoints with Express
- **Frontend**: React with Context API for state management
- **Styling**: Tailwind CSS with custom components

## User Roles

- **Employee**: Can raise and track tickets, use self-service
- **Support Agent**: Can respond to tickets with AI suggestions
- **Team Lead**: Can manage workloads and view analytics
- **Admin**: Full system access and configuration

## Development Phases

This project is being developed in phases:

1. Core Setup & Authentication
2. Ticket Management
3. Knowledge Base
4. AI Features
5. Dashboard & Analytics
6. Security & Deployment

## Documentation

For more detailed information, see:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Product Requirements Document](./PRD.md)