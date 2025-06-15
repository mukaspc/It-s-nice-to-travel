# It's nice to travel

A web application with mobile responsiveness that allows users to easily plan engaging and interesting trips with the help of LLMs. The app converts simple notes about places and travel goals into detailed plans, taking into account user preferences, time, number of people, and potential places and attractions.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

"It's nice to travel" solves the main problem of difficulty in planning engaging and interesting trips. Trip planning often requires:

- Time-consuming research on attractions and places worth visiting
- Adapting plans to the number of people, length of travel, and personal preferences
- Coordinating multiple places and activities into a logical and feasible route
- Finding interesting but less known attractions outside the standard tourist routes

The application offers:

- Simple user account system
- Ability to save tourist preferences in your profile
- Creating, viewing, editing, and deleting travel plans
- Generating detailed travel plans by AI based on notes and preferences
- Daily schedule with attractions and dining recommendations
- Exporting the generated plan to PDF

## Tech Stack

### Frontend

- [Astro 5](https://astro.build/) for building fast, efficient websites and applications with minimal JavaScript
- [React 19](https://react.dev/) for interactive components
- [TypeScript 5](https://www.typescriptlang.org/) for static typing and better IDE support
- [Tailwind 4](https://tailwindcss.com/) for convenient application styling
- [Shadcn/ui](https://ui.shadcn.com/) for a library of accessible React components

### Backend

- [Supabase](https://supabase.io/) as a comprehensive backend solution:
  - PostgreSQL database
  - SDK in multiple languages that will serve as Backend-as-a-Service
  - Open-source solution that can be hosted locally or on your own server
  - Built-in user authentication

### AI

- [Openrouter.ai](https://openrouter.ai/) for communication with AI models:
  - Access to a wide range of models (OpenAI, Anthropic, Google, and many others)
  - Allows setting financial limits on API keys

### Testing

- [Vitest](https://vitest.dev/) for unit and integration testing
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) for testing React components
- [@testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/) for additional DOM matchers
- [Playwright](https://playwright.dev/) for end-to-end testing and cross-browser compatibility
- [ESLint](https://eslint.org/) for static code analysis
- Code coverage reporting and automated test execution in CI/CD

### CI/CD and Hosting

- Github Actions for creating CI/CD pipelines and automated testing
- DigitalOcean for hosting the application via Docker image

## Getting Started

### Prerequisites

- Node.js **22.14.0** (we recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions)

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/it-is-nice-to-travel.git
cd it-is-nice-to-travel
```

2. Use the correct Node.js version

```bash
nvm use
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:4321

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit and integration tests with Vitest
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Project Scope

### MVP Includes

- User accounts system (registration, login, password recovery, profile editing)
- Managing travel plans (viewing, editing, deleting, sorting)
- Creating new travel plans with notes, details, and preferences
- AI-generated travel plans based on user input
- Daily schedule with tourist attractions and restaurant recommendations
- Export of generated plans to PDF
- Responsive user interface with mobile priority
- Tutorial for first-time users

### MVP Does Not Include

- Sharing travel plans between user accounts
- Rich multimedia handling and analysis
- Advanced time and logistics planning
- Integration with hotel, ticket, or transportation booking systems
- Social features such as commenting on other users' plans
- Mobile app version (only responsive website)
- Paid subscriptions or premium features
- Support for multiple languages (initially only Polish)
- Synchronization with other travel planning applications

## Project Status

All features will be available for free after registration, according to the freemium model without limitations in the MVP version.

## License

[MIT License](LICENSE)
