# Technology Stack Template

## Metadata
- **Category**: tech
- **Output File**: stack-project.md
- **Dependencies**: [project-overview.md]
- **Required**: true
- **Priority**: 2 (Execute after project overview)

## Description
This template analyzes and documents the complete technology stack used in the project, including frameworks, libraries, databases, tools, and services. It provides a comprehensive technical inventory for developers and stakeholders.

---

## Analysis Instructions

### What to Analyze
- `package.json` - All dependencies and devDependencies
- `next.config.js` / `next.config.ts` - Next.js configuration
- `tailwind.config.js` / `tailwind.config.ts` - Styling framework
- `.env.example` - External services and integrations
- Configuration files - Database, authentication, etc.
- Import statements in key files - Actual library usage

### What to Extract
- Frontend framework and version
- Backend framework/runtime
- Database and ORM
- Authentication system
- UI component libraries
- State management
- API clients
- Build tools
- Testing frameworks
- Deployment platform

### What to Ignore
- Development-only tools (unless significant)
- Transitive dependencies
- Internal utilities
- Deprecated packages

---

## Output Structure

### Required Sections

#### 1. Core Framework
- **Prompt**: What is the primary framework powering this application?
- **Format**: Framework name, version, and brief description
- **Detection Logic**:
  - Check `package.json` for `next`, `react`, `vue`, `angular`, etc.
  - Verify version from dependencies
  - Identify if using App Router or Pages Router (Next.js)
- **Example**:
  ```
  **Next.js 14.x** (App Router)
  
  Modern React framework with server-side rendering, static site generation, 
  and API routes. Using the new App Router for improved performance.
  ```

#### 2. Frontend Technologies
- **Prompt**: What technologies are used for the user interface?
- **Format**: Categorized list with versions and purposes
- **Categories**:
  - UI Framework (React, Vue, etc.)
  - Styling (Tailwind, CSS Modules, etc.)
  - Component Libraries (Shadcn, HeroUI, etc.)
  - State Management (Context, Redux, Zustand, etc.)
- **Example**:
  ```
  **UI Framework**:
  - React 18.x - Component-based UI library
  - TypeScript 5.x - Type-safe JavaScript
  
  **Styling**:
  - Tailwind CSS 3.x - Utility-first CSS framework
  
  **Component Libraries**:
  - Shadcn UI - Customizable component collection
  - HeroUI - Pre-styled accessible components
  ```

#### 3. Backend Technologies
- **Prompt**: What technologies power the backend and API?
- **Format**: Categorized list with versions and purposes
- **Categories**:
  - Runtime (Node.js, Deno, etc.)
  - API Framework (Next.js API routes, Express, etc.)
  - Authentication (NextAuth, Supabase Auth, etc.)
  - File Storage
- **Example**:
  ```
  **Runtime**:
  - Node.js 20.x - JavaScript runtime
  
  **API Layer**:
  - Next.js API Routes - Serverless API endpoints
  
  **Authentication**:
  - Supabase Auth - User authentication and authorization
  ```

#### 4. Database & Data Layer
- **Prompt**: What database and data management tools are used?
- **Format**: Database type, ORM/client, and data management tools
- **Detection Logic**:
  - Check for Supabase, PostgreSQL, MongoDB, etc.
  - Identify ORM (Prisma, Drizzle, etc.)
  - Check for migration tools
- **Example**:
  ```
  **Database**:
  - PostgreSQL 15.x - Relational database (via Supabase)
  
  **Database Client**:
  - Supabase JS Client - Type-safe database queries
  
  **Data Management**:
  - Supabase Migrations - Database version control
  - Row Level Security (RLS) - Database-level authorization
  ```

#### 5. Development Tools
- **Prompt**: What tools are used for development, testing, and building?
- **Format**: Categorized list of development tools
- **Categories**:
  - Build Tools
  - Testing Frameworks
  - Code Quality
  - Development Servers
- **Example**:
  ```
  **Build Tools**:
  - Turbopack - Fast bundler (Next.js 14+)
  - PostCSS - CSS processing
  
  **Testing**:
  - Jest - Unit testing framework
  
  **Code Quality**:
  - ESLint - Code linting
  - TypeScript - Type checking
  ```

#### 6. External Services & Integrations
- **Prompt**: What external services and APIs are integrated?
- **Format**: List of services with their purposes
- **Detection Logic**:
  - Analyze `.env.example` for service keys
  - Check for SDK imports
  - Review API client configurations
- **Security Note**: List service names only, never expose keys or credentials
- **Example**:
  ```
  **Backend as a Service**:
  - Supabase - Database, Auth, Storage, Realtime
  
  **Analytics** (if detected):
  - [Service name] - Usage analytics
  ```

### Optional Sections

#### 7. Deployment & Infrastructure
- **Prompt**: Where and how is the application deployed?
- **Format**: Platform and deployment configuration
- **Detection Logic**:
  - Check for `vercel.json`, `netlify.toml`, etc.
  - Look for Docker files
  - Check package.json scripts
- **Example**:
  ```
  **Hosting Platform**:
  - Vercel - Serverless deployment platform
  
  **CI/CD**:
  - GitHub Actions - Automated testing and deployment
  ```

---

## Validation Rules

### Content Validation
- [ ] All major dependencies are documented
- [ ] Versions are accurate and up-to-date
- [ ] Categories are appropriate and clear
- [ ] Purposes are explained for each technology
- [ ] No deprecated or unused packages listed
- [ ] All required sections are present

### Accuracy Checks
- [ ] Versions match `package.json`
- [ ] Technologies listed are actually used in code
- [ ] Framework configuration is correctly identified
- [ ] External services are verified from env files

### Security Checklist
- [ ] No API keys or tokens mentioned
- [ ] No service credentials exposed
- [ ] No internal service URLs
- [ ] Only service names listed (not configuration)
- [ ] Environment variable names only (not values)

### Consistency Checks
- [ ] Stack aligns with project type from overview
- [ ] Technologies are compatible with each other
- [ ] No contradictions with architecture document

---

## Example Output

```markdown
# Technology Stack

> **Generated**: 2024-01-15
> **Template**: stack-project
> **Version**: 1.0.0

## Core Framework

**Next.js 14.2** (App Router)

Modern React framework with server-side rendering, static site generation, and API routes.

## Frontend Technologies

### UI Framework
- **React 18.2** - Component-based UI library
- **TypeScript 5.3** - Type-safe JavaScript

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework

### Component Libraries
- **Shadcn UI** - Customizable component collection
- **HeroUI 2.x** - Pre-styled accessible components

## Backend Technologies

### Runtime
- **Node.js 20.x** - JavaScript runtime

### API Layer
- **Next.js API Routes** - Serverless API endpoints

### Authentication
- **Supabase Auth** - User authentication and authorization

## Database & Data Layer

### Database
- **PostgreSQL 15.x** - Relational database (via Supabase)

### Database Client
- **Supabase JS Client 2.x** - Type-safe database queries

## Development Tools

### Build Tools
- **Turbopack** - Fast bundler

### Code Quality
- **ESLint** - Code linting
- **TypeScript** - Type checking

## External Services & Integrations

### Backend as a Service
- **Supabase** - Database, Auth, Storage, Realtime

---

**Note**: This document was automatically generated by DevCache. Last updated: 2024-01-15
```

---

## Notes for Orchestrator

1. **Cross-reference with project overview** - Ensure stack aligns with project type
2. **Verify actual usage** - Don't just list dependencies, confirm they're used
3. **Group logically** - Categorize technologies by purpose
4. **Include versions** - Always specify major versions
5. **Explain purposes** - Don't assume readers know what each technology does
6. **Security first** - Never expose credentials or sensitive configuration
7. **Keep updated** - Regenerate when dependencies change significantly
