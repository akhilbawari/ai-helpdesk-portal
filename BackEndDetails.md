# AI-First Internal Helpdesk Portal – Backend Documentation

## 1. Framework

**Node.js** with **Express.js**

* Lightweight and performant.
* Modular and middleware-friendly.
* Easy integration with AI services.

## 2. Databases

### Primary: MongoDB (Free Tier on MongoDB Atlas)

* Document-based storage for Tickets, Users, Knowledge Base, and AI Logs.

### Vector Store: FAISS (Open-source, local deployment)

* Semantic search for RAG chatbot with embeddings.

## 3. Authentication & Authorization

### Authentication

* JWT-based auth with token refresh mechanism.
* OAuth2 / SSO integration (Google - Free for basic usage).

### Authorization

* Role-Based Access Control (RBAC):

  * Roles: Employee, Support Agent, Team Lead, Admin.

### Libraries

* `passport.js`, `bcrypt`, `jsonwebtoken`

## 4. Third-Party Integrations (Free Options Only)

| Integration                                    | Purpose                |
| ---------------------------------------------- | ---------------------- |
| OpenRouter (Free-tier LLM API aggregator)      | LLM-based AI responses |
| FAISS                                          | Local vector store     |
| Cloudinary (Free Tier)                         | File uploads           |
| Resend / Mailersend (Free tier)                | Email notifications    |
| Slack (Free for Dev/Test)                      | Future integration     |
| Plausible / Umami (Self-hosted free analytics) | Analytics              |

## 5. Schema Design (MongoDB)

### Users

```json
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "role": String,
  "passwordHash": String,
  "department": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Tickets

```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "raisedBy": ObjectId,
  "assignedTo": ObjectId,
  "category": String,
  "priority": String,
  "status": String,
  "comments": [{ "userId": ObjectId, "text": String, "timestamp": Date }],
  "attachments": [String],
  "createdAt": Date,
  "updatedAt": Date
}
```

### Knowledge Base

```json
{
  "_id": ObjectId,
  "title": String,
  "content": String,
  "category": String,
  "tags": [String],
  "fileUrl": String,
  "version": String,
  "visibility": String,
  "createdBy": ObjectId,
  "createdAt": Date,
  "updatedAt": Date
}
```

### AI Logs

```json
{
  "_id": ObjectId,
  "ticketId": ObjectId,
  "inputText": String,
  "aiResponse": String,
  "status": String,
  "reviewedBy": ObjectId,
  "createdAt": Date
}
```

## 6. API Design

### Base URL

`/api/v1/`

### Auth

* `POST /auth/login`
* `POST /auth/signup`
* `POST /auth/refresh`

### Tickets

* `GET /tickets`
* `POST /tickets`
* `PUT /tickets/:id`
* `POST /tickets/:id/comment`
* `POST /tickets/:id/assign`

### AI

* `POST /ai/route`
* `POST /ai/response`
* `POST /ai/ask`

### Knowledge Base

* `GET /kb`
* `POST /kb`
* `GET /kb/:id`
* `PUT /kb/:id`

### Documentation

* Swagger UI at `/api-docs`

## 7. Security Measures

| Measure          | Tool                    |
| ---------------- | ----------------------- |
| Password hashing | bcrypt                  |
| JWT Auth         | jsonwebtoken            |
| Rate limiting    | express-rate-limit      |
| Input validation | Joi / Zod               |
| CORS             | cors                    |
| CSRF/XSS         | Helmet, CSRF middleware |
| Audit Logs       | winston / morgan        |
| HTTPS            | Enforced in deployment  |
| File Security    | Signed URLs, virus scan |

## 8. Testing & CI/CD

### Testing

* Unit: Jest / Mocha
* Integration: Supertest / Postman
* Mongo Memory Server for in-memory DB tests

### CI/CD

* GitHub Actions
* Dockerized services
* Free tier hosting: Render, Railway, Vercel (API), or Fly.io
* Secrets management via `.env` and GitHub Secrets

---

End of Backend Documentation
