
# Incubyte Salary Management Kata

This repository contains the backend API for the Incubyte Salary Management coding exercise. It is built following a strict Test-Driven Development (TDD) workflow.

## Stack

- **Framework**: [Fastify](https://www.fastify.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Features

- ✅ **Employee CRUD**: Full Create, Read, Update, Delete operations for employees.
- ✅ **Salary Calculation**: Endpoint to calculate net salary based on country-specific TDS rules.
- ✅ **Salary Metrics**: Endpoints to provide salary analytics (min, max, avg) by country and job title.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-classroom-repo-url>
    cd <repo-name>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

- **Development Mode** (with hot-reloading):
  ```bash
  npm run dev
  ```
  The server will start on `http://localhost:3000`.

- **Production Mode**:
  ```bash
  npm run build
  npm start
  ```

### Running Tests

To run the test suite:

```bash
npm test
```

To run tests in watch mode:
```bash
npm test -- --watch
```

## Implementation Details

This project was scaffolded and developed using AI assistance to accelerate development while ensuring high-quality, production-ready code.

- **AI Tool**: Google Gemini
- **Prompts**:
  - "Scaffold a production-ready Fastify API with TypeScript, Zod, Better-SQLite3, and Vitest, following a strict Repository Pattern."
  - "Generate a failing Vitest test for creating an employee via a POST /employees endpoint."
  - "Write the minimal implementation code (route, service, repository) to make the employee creation test pass."
- **Rationale**: Using AI for initial setup, boilerplate, and test generation allows for a greater focus on the core business logic and architectural decisions, which is the heart of software craftsmanship. The TDD cycle was strictly followed, with AI generating the failing test first, followed by the minimal implementation.
