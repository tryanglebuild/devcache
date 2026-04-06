# Architecture Template

## Metadata
- **Category**: tech
- **Output File**: architecture-project.md
- **Dependencies**: [project-overview.md, stack-project.md]
- **Required**: true
- **Priority**: 3 (Execute after overview and stack)

## Description
This template analyzes and documents the technical architecture, design patterns, project structure, and key architectural decisions. It provides a comprehensive view of how the system is organized and how components interact.

---

## Analysis Instructions

### What to Analyze
- Project directory structure - Folder organization
- Configuration files - Framework and build setup
- Entry points - Main application files
- Component files - UI component structure
- API routes - Backend architecture
- State management - Data flow patterns
- Routing configuration - Navigation structure

### What to Extract
- Main framework and version
- Architecture pattern (MVC, MVVM, Clean Architecture, etc.)
- Project structure and organization
- Component hierarchy
- Data flow patterns
- Routing structure
- State management approach
- Key design decisions

### What to Ignore
- Individual component implementations
- Business logic details
- Styling specifics
- Test files (unless architecture-relevant)

---

## Output Structure

### Required Sections

#### 1. Framework
- **Prompt**: What is the main framework and its architectural approach?
- **Format**: Framework name with architectural description
- **Detection Logic**:
  - Check for Next.js (App Router vs Pages Router)
  - Identify React, Vue, Angular, etc.
  - Determine SSR, SSG, CSR approach
- **Example**:
  ```
  **Next.js 14 (App Router)**
  
  Server-first architecture with React Server Components as the default. 
  Supports server-side rendering (SSR), static site generation (SSG), 
  and client-side rendering (CSR) in a unified framework.
  ```

#### 2. Architecture Pattern
- **Prompt**: What design patterns and architectural principles are used?
- **Format**: Pattern name with explanation and rationale
- **Common Patterns**:
  - MVC (Model-View-Controller)
  - MVVM (Model-View-ViewModel)
  - Clean Architecture
  - Feature-based architecture
  - Layered architecture
- **Example**:
  ```
  **Feature-based Architecture with Server Components**
  
  The project follows a feature-based organization where related components, 
  hooks, and utilities are grouped together. Server Components handle data 
  fetching and business logic, while Client Components manage interactivity.
  
  **Key Principles**:
  - Separation of concerns (Server vs Client)
  - Co-location of related code
  - Unidirectional data flow
  - Component composition
  ```

#### 3. Project Structure
- **Prompt**: How is the project organized? What is the folder structure?
- **Format**: Directory tree with explanations
- **Example**:
  ```
  ```
  app/                    # Next.js App Router
  ├── (auth)/            # Route group for authentication
  │   ├── login/         # Login page
  │   └── signup/        # Signup page
  ├── (dashboard)/       # Route group for dashboard
  │   ├── layout.tsx     # Dashboard layout
  │   └── page.tsx       # Dashboard home
  ├── api/               # API routes
  │   ├── agents/        # Agent endpoints
  │   └── auth/          # Auth endpoints
  └── layout.tsx         # Root layout
  
  components/            # Reusable components
  ├── ui/               # Base UI components (Shadcn)
  ├── common/           # Shared components
  └── features/         # Feature-specific components
  
  lib/                  # Utilities and configurations
  ├── supabase/         # Supabase client
  ├── utils/            # Helper functions
  └── hooks/            # Custom React hooks
  
  types/                # TypeScript type definitions
  └── database.types.ts # Supabase generated types
  ```
  
  **Organization Principles**:
  - Route groups for logical separation
  - Co-located components with routes
  - Centralized utilities and types
  - Clear separation of concerns
  ```

#### 4. Data Flow
- **Prompt**: How does data move through the application?
- **Format**: Flow description with diagrams (text-based)
- **Example**:
  ```
  **Server-to-Client Data Flow**:
  
  1. **Server Components** fetch data directly from Supabase
  2. Data is rendered on the server and sent as HTML
  3. **Client Components** receive data as props
  4. User interactions trigger client-side state updates
  5. Mutations are sent to API routes
  6. API routes update database and revalidate cache
  
  ```
  User Request
       ↓
  Server Component (fetch data)
       ↓
  Supabase Database
       ↓
  Render HTML
       ↓
  Client Hydration
       ↓
  User Interaction
       ↓
  API Route (mutation)
       ↓
  Database Update
       ↓
  Cache Revalidation
  ```
  
  **State Management**:
  - Server state: React Server Components
  - Client state: React Context + useState
  - Form state: React Hook Form
  - Cache: Next.js built-in caching
  ```

#### 5. Key Design Decisions
- **Prompt**: What are the most important architectural choices and why were they made?
- **Format**: List of decisions with rationale
- **Example**:
  ```
  **1. App Router over Pages Router**
  - **Decision**: Use Next.js 14 App Router
  - **Rationale**: Better performance with Server Components, improved routing, 
    and modern React features
  - **Trade-off**: Newer API with less community resources
  
  **2. Supabase for Backend**
  - **Decision**: Use Supabase instead of custom backend
  - **Rationale**: Faster development, built-in auth and real-time, 
    PostgreSQL with RLS for security
  - **Trade-off**: Vendor lock-in, less control over infrastructure
  
  **3. Server Components by Default**
  - **Decision**: Use Server Components for most pages
  - **Rationale**: Better performance, reduced JavaScript bundle, 
    improved SEO
  - **Trade-off**: More complex mental model, client/server boundary
  
  **4. Feature-based Structure**
  - **Decision**: Organize by feature rather than by type
  - **Rationale**: Better scalability, easier to find related code, 
    clearer ownership
  - **Trade-off**: Some code duplication, less obvious for new developers
  ```

### Optional Sections

#### 6. Component Hierarchy
- **Prompt**: How are components organized and related?
- **Format**: Component tree with descriptions
- **Example**:
  ```
  **Component Structure**:
  
  ```
  RootLayout
  ├── Providers (Client)
  │   ├── ThemeProvider
  │   └── AuthProvider
  ├── Header (Server)
  │   ├── Logo
  │   ├── Navigation (Client)
  │   └── UserMenu (Client)
  └── Page Content
      ├── ServerComponent (data fetching)
      └── ClientComponent (interactivity)
  ```
  
  **Component Types**:
  - **Layout Components**: Shared UI structure
  - **Page Components**: Route-specific content
  - **Feature Components**: Business logic components
  - **UI Components**: Reusable primitives
  ```

#### 7. Routing Structure
- **Prompt**: How is routing organized and configured?
- **Format**: Route tree with descriptions
- **Example**:
  ```
  **Route Structure**:
  
  - `/` - Landing page (public)
  - `/login` - Authentication (public)
  - `/signup` - Registration (public)
  - `/dashboard` - User dashboard (protected)
    - `/dashboard/projects` - Project list
    - `/dashboard/settings` - User settings
  - `/marketplace` - Agent marketplace (public)
    - `/marketplace/[id]` - Agent details
  - `/api/agents` - Agent API endpoints
  - `/api/auth` - Authentication endpoints
  
  **Route Protection**:
  - Middleware checks authentication
  - Redirects to login if unauthorized
  - Server Components verify permissions
  ```

#### 8. State Management
- **Prompt**: How is application state managed?
- **Format**: State management approach with examples
- **Example**:
  ```
  **State Management Strategy**:
  
  **Server State**:
  - React Server Components for data fetching
  - Next.js caching for performance
  - Supabase real-time for live updates
  
  **Client State**:
  - React Context for global UI state (theme, user preferences)
  - useState for local component state
  - React Hook Form for form state
  
  **No Redux/Zustand needed** - Server Components handle most state
  ```

---

## Validation Rules

### Content Validation
- [ ] Framework is correctly identified
- [ ] Architecture pattern is appropriate
- [ ] Project structure is accurately represented
- [ ] Data flow is clear and logical
- [ ] Design decisions have clear rationale
- [ ] All required sections are present
- [ ] No placeholder text remains

### Accuracy Checks
- [ ] Directory structure matches actual project
- [ ] Framework version is correct
- [ ] Routing structure is accurate
- [ ] Component hierarchy reflects reality
- [ ] State management approach is verified

### Security Checklist
- [ ] No internal API endpoints exposed
- [ ] No authentication secrets revealed
- [ ] No database connection details
- [ ] No proprietary algorithms described
- [ ] No security vulnerabilities documented

### Consistency Checks
- [ ] Aligns with stack documentation
- [ ] Framework matches project overview
- [ ] Architecture supports listed features
- [ ] No contradictions with other docs

---

## Example Output

```markdown
# Architecture

> **Generated**: 2024-01-15
> **Template**: architecture-project
> **Version**: 1.0.0

## Framework

**Next.js 14 (App Router)**

Server-first architecture with React Server Components as the default. Supports server-side rendering (SSR), static site generation (SSG), and client-side rendering (CSR) in a unified framework.

## Architecture Pattern

**Feature-based Architecture with Server Components**

The project follows a feature-based organization where related components, hooks, and utilities are grouped together. Server Components handle data fetching and business logic, while Client Components manage interactivity.

**Key Principles**:
- Separation of concerns (Server vs Client)
- Co-location of related code
- Unidirectional data flow
- Component composition

## Project Structure

```
app/                    # Next.js App Router
├── (auth)/            # Route group for authentication
├── (dashboard)/       # Route group for dashboard
├── api/               # API routes
└── layout.tsx         # Root layout

components/            # Reusable components
├── ui/               # Base UI components
├── common/           # Shared components
└── features/         # Feature-specific components

lib/                  # Utilities and configurations
└── supabase/         # Supabase client
```

## Data Flow

**Server-to-Client Data Flow**:

1. Server Components fetch data directly from Supabase
2. Data is rendered on the server and sent as HTML
3. Client Components receive data as props
4. User interactions trigger client-side state updates
5. Mutations are sent to API routes

## Key Design Decisions

**1. App Router over Pages Router**
- **Decision**: Use Next.js 14 App Router
- **Rationale**: Better performance with Server Components
- **Trade-off**: Newer API with less community resources

**2. Supabase for Backend**
- **Decision**: Use Supabase instead of custom backend
- **Rationale**: Faster development, built-in auth
- **Trade-off**: Vendor lock-in

---

**Note**: This document was automatically generated by DevCache. Last updated: 2024-01-15
```

---

## Notes for Orchestrator

1. **Execute after stack** - Requires technology stack information
2. **Be accurate** - Verify directory structure and patterns
3. **Explain decisions** - Don't just describe, explain why
4. **Visual aids** - Use text-based diagrams for clarity
5. **Validate consistency** - Cross-check with stack and features
6. **Focus on structure** - Not implementation details


---

## Document Footer Requirements

All generated documents MUST include a standardized footer with the following metadata:

### Footer Structure

```markdown
---

## 📄 Document Metadata

**Project**: [Project Name from config]

**Generated Date**: [YYYY-MM-DD format]

**AI Model**: [AI Model from config.generation.aiModel]

**Generator**: DevCache Documentation System

**Template**: [Template name]

---

*This document was automatically generated by AI-powered analysis. Please review and validate the content for accuracy.*
```

### Footer Rules

1. **Always include** - Every generated document must have this footer
2. **Use config values** - Pull project name and AI model from `.devcache.json`
3. **Date format** - Use YYYY-MM-DD format (e.g., 2024-04-06)
4. **Consistent styling** - Use the exact format shown above
5. **Disclaimer** - Always include the accuracy review disclaimer

### Example Footer

```markdown
---

## 📄 Document Metadata

**Project**: devcache

**Generated Date**: 2024-04-06

**AI Model**: Claude Sonnet 4.5

**Generator**: DevCache Documentation System

**Template**: architecture-project

---

*This document was automatically generated by AI-powered analysis. Please review and validate the content for accuracy.*
```
