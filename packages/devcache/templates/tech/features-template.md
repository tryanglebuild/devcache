# Features Template

## Metadata
- **Category**: tech
- **Output File**: features.md (overview) + individual feature files in features/
- **Dependencies**: [project-overview.md, architecture-project.md]
- **Required**: true
- **Priority**: 4 (Execute after overview and architecture)

## Description
This template analyzes and documents the main features and functionality of the project. It provides a comprehensive inventory with impact classification (0-10 scale), creates an overview document, and generates detailed documentation for high-impact features in the `features/` directory.

---

## Analysis Instructions

### What to Analyze
- Application pages and routes - User-facing features
- API routes - Backend functionality
- Component files - UI capabilities
- Authentication setup - Security features
- Database schema - Data management
- Configuration files - Integration points
- README and documentation - Feature descriptions
- Usage patterns - Feature adoption

### What to Extract
- Core features and capabilities
- Feature impact scores (using classification guide)
- API endpoints and their purposes
- Authentication and authorization mechanisms
- Main UI components and pages
- Data management approach
- External integrations
- User workflows and journeys
- Configuration requirements

### What to Ignore
- Implementation details (save for individual docs)
- Code-level specifics
- Styling and design details
- Internal utilities
- Test implementations

### Impact Classification
Use `features/feature-impact-classification.md` to:
1. Identify all features in the project
2. Score each feature on 5 criteria (0-10 each)
3. Calculate weighted impact score (0-10)
4. Classify features by impact level
5. Prioritize documentation accordingly

---

## Output Structure

### Main Output: features.md

#### Required Sections

##### 1. Feature Overview
- **Prompt**: What are all the features in this application, ranked by impact?
- **Format**: Table with feature name, impact score, category, and brief description
- **Example**:
  ```markdown
  | Feature | Impact | Category | Description |
  |---------|--------|----------|-------------|
  | User Authentication | 9.4 | Critical | Secure user access and session management |
  | Agent Marketplace | 8.5 | Major | Browse and share AI agent templates |
  | Real-time Execution | 8.2 | Major | Execute agents with live progress monitoring |
  | Dashboard Analytics | 7.1 | Important | Usage statistics and performance metrics |
  | Profile Customization | 5.3 | Supporting | User profile and preferences |
  | Dark Mode | 2.8 | Minor | UI theme toggle |
  ```

##### 2. Critical Features (Impact 8-10)
- **Prompt**: What are the critical features that define this application?
- **Format**: Detailed list with descriptions
- **Note**: Each critical feature should have its own detailed document in `features/`
- **Example**:
  ```markdown
  ### User Authentication (9.4/10)
  Comprehensive authentication system with email/password and OAuth support. Handles user registration, login, session management, and password recovery. Critical for platform security and user data protection.
  
  **Key Capabilities**:
  - Email/password authentication
  - OAuth integration (Google, GitHub)
  - Session management with JWT
  - Password reset flow
  - Email verification
  
  **Documentation**: See [features/user-authentication.md](./features/user-authentication.md)
  
  ---
  
  ### Agent Marketplace (8.5/10)
  Central hub for discovering, sharing, and downloading AI agent templates. Enables community collaboration and accelerates agent development.
  
  **Key Capabilities**:
  - Browse agent templates
  - Search and filter
  - Rate and review
  - Download and customize
  - Publish custom agents
  
  **Documentation**: See [features/agent-marketplace.md](./features/agent-marketplace.md)
  ```

##### 3. Major Features (Impact 6-7.9)
- **Prompt**: What are the major features that significantly enhance the application?
- **Format**: List with brief descriptions
- **Note**: Major features may have individual docs if complex
- **Example**:
  ```markdown
  ### Dashboard Analytics (7.1/10)
  Real-time analytics dashboard showing usage statistics, performance metrics, and activity logs.
  
  ### Team Collaboration (6.8/10)
  Features for team workspaces, shared agents, and collaborative editing.
  
  ### Export/Import (6.2/10)
  Bulk export and import of agent configurations and execution results.
  ```

##### 4. Supporting Features (Impact 4-5.9)
- **Prompt**: What supporting features enhance usability?
- **Format**: Bulleted list with one-line descriptions
- **Example**:
  ```markdown
  - **Profile Customization** (5.3) - User profile and preference management
  - **Notification System** (4.8) - Real-time notifications for events
  - **Activity Logs** (4.5) - Historical record of user actions
  - **Keyboard Shortcuts** (4.2) - Quick actions via keyboard
  ```

##### 5. Minor Features (Impact 0-3.9)
- **Prompt**: What minor features exist in the application?
- **Format**: Simple list
- **Example**:
  ```markdown
  - Dark Mode (2.8)
  - Welcome Tour (2.3)
  - Tooltips (1.5)
  ```

### Secondary Output: Individual Feature Documents

For features with impact score ≥ 6, create detailed documentation in `features/` directory using `individual-feature-template.md`.

**File naming**: `features/[feature-name-kebab-case].md`

**Content**: Follow the individual feature template structure with:
- Impact classification details
- Implementation architecture
- Configuration requirements
- API endpoints
- Database schema
- User interface
- Integration points
- Security considerations
- Performance notes

---

#### 2. API Endpoints
- **Prompt**: What API endpoints are available and what do they do?
- **Format**: Grouped list of endpoints with methods and descriptions
- **Detection Logic**:
  - Scan `app/api/` or `pages/api/` directories
  - Identify route handlers
  - Extract HTTP methods
- **Security Note**: Document endpoints but not authentication tokens or secrets
- **Example**:
  ```
  **Agent Endpoints** (`/api/agents`):
  - `GET /api/agents` - List all agents
  - `POST /api/agents` - Create new agent
  - `GET /api/agents/[id]` - Get agent details
  - `PUT /api/agents/[id]` - Update agent
  - `DELETE /api/agents/[id]` - Delete agent
  - `POST /api/agents/[id]/execute` - Execute agent
  
  **Authentication Endpoints** (`/api/auth`):
  - `POST /api/auth/signup` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/session` - Get current session
  
  **User Endpoints** (`/api/user`):
  - `GET /api/user/profile` - Get user profile
  - `PUT /api/user/profile` - Update profile
  - `GET /api/user/preferences` - Get preferences
  ```

#### 3. Authentication
- **Prompt**: How does authentication and authorization work?
- **Format**: Description of auth system with features
- **Detection Logic**:
  - Check for auth libraries (NextAuth, Supabase Auth, etc.)
  - Identify protected routes
  - Review middleware
- **Security Note**: Describe the system, not the implementation details
- **Example**:
  ```
  **Authentication System**: Supabase Auth
  
  **Features**:
  - Email/password authentication
  - OAuth providers (Google, GitHub)
  - Magic link authentication
  - Session management with JWT
  - Automatic token refresh
  
  **Authorization**:
  - Row Level Security (RLS) policies in database
  - Role-based access control (RBAC)
  - Protected routes with middleware
  - API endpoint authentication
  
  **Security Features**:
  - Password strength requirements
  - Email verification
  - Rate limiting on auth endpoints
  - Secure session storage
  ```

#### 4. User Interface
- **Prompt**: What are the main UI components and pages?
- **Format**: Categorized list of pages and components
- **Detection Logic**:
  - Scan route directories
  - Identify page components
  - Review component library usage
- **Example**:
  ```
  **Public Pages**:
  - Landing page with feature showcase
  - Marketplace for browsing agents
  - Agent detail pages
  - Documentation and guides
  
  **Authentication Pages**:
  - Login page
  - Signup page
  - Password reset
  - Email verification
  
  **Dashboard Pages**:
  - Dashboard home with overview
  - My Agents library
  - Agent editor
  - Execution history
  - Settings and preferences
  
  **Key Components**:
  - Agent card with preview
  - Code editor for agent configuration
  - Execution console
  - Real-time status indicators
  - Notification system
  ```

#### 5. Data Management
- **Prompt**: How is data handled and stored?
- **Format**: Description of data layer with key entities
- **Detection Logic**:
  - Analyze database schema
  - Check for ORM/client usage
  - Review data fetching patterns
- **Security Note**: Describe structure, not sensitive data
- **Example**:
  ```
  **Database**: PostgreSQL via Supabase
  
  **Key Entities**:
  - **Users**: User accounts and profiles
  - **Agents**: Agent templates and configurations
  - **Executions**: Agent execution history and results
  - **Collections**: User-organized agent collections
  - **Ratings**: User ratings and reviews
  
  **Data Operations**:
  - Real-time subscriptions for live updates
  - Optimistic updates for better UX
  - Automatic data validation
  - Soft deletes for data recovery
  
  **Caching Strategy**:
  - Next.js automatic caching
  - Revalidation on mutations
  - Client-side cache for frequently accessed data
  ```

#### 6. Integration Points
- **Prompt**: What external services and APIs are integrated?
- **Format**: List of integrations with purposes
- **Detection Logic**:
  - Check `.env.example` for service keys
  - Review import statements for SDKs
  - Analyze API client configurations
- **Security Note**: List services only, never expose credentials
- **Example**:
  ```
  **Backend Services**:
  - **Supabase**: Database, authentication, storage, real-time
  
  **AI/ML Services** (if detected):
  - **OpenAI API**: AI model integration
  - **Anthropic API**: Claude model access
  
  **Analytics** (if detected):
  - **[Service name]**: Usage tracking and analytics
  
  **Email** (if detected):
  - **[Service name]**: Transactional emails
  
  **Payment** (if detected):
  - **[Service name]**: Payment processing
  ```

#### 7. User Flows
- **Prompt**: What are the main user workflows and journeys?
- **Format**: Step-by-step descriptions of key flows
- **Example**:
  ```
  **Creating an Agent**:
  1. User navigates to "Create Agent" page
  2. Selects a template or starts from scratch
  3. Configures agent parameters in editor
  4. Tests agent in sandbox environment
  5. Saves agent to library
  6. Optionally publishes to marketplace
  
  **Executing an Agent**:
  1. User selects agent from library
  2. Provides required input parameters
  3. Initiates execution
  4. Monitors real-time progress
  5. Views execution results
  6. Downloads or shares output
  
  **Discovering Agents**:
  1. User browses marketplace
  2. Filters by category, rating, or popularity
  3. Views agent details and reviews
  4. Tests agent with sample data
  5. Adds to personal library
  6. Customizes for specific use case
  ```

---

## Validation Rules

### Content Validation
- [ ] All major features identified and classified
- [ ] Impact scores calculated using classification guide
- [ ] Features ranked by impact (highest to lowest)
- [ ] Critical features (8-10) have individual documentation
- [ ] Major features (6-7.9) adequately described
- [ ] Supporting and minor features listed
- [ ] API endpoints documented for relevant features
- [ ] Authentication approach described
- [ ] No placeholder text remains

### Impact Classification Validation
- [ ] All 5 criteria scored for each feature
- [ ] Weighted formula applied correctly
- [ ] Scores justified with evidence
- [ ] High-impact features verified as truly critical
- [ ] Low-impact features confirmed as minor

### Individual Feature Documentation
- [ ] Created for all features with impact ≥ 6
- [ ] Follows individual-feature-template.md structure
- [ ] Includes all required sections
- [ ] Configuration steps are clear
- [ ] Integration points documented
- [ ] Security considerations addressed

### Accuracy Checks
- [ ] Features match actual implementation
- [ ] Impact scores reflect reality
- [ ] API routes exist in codebase
- [ ] Authentication method is correct
- [ ] UI pages are accessible
- [ ] Database entities are real
- [ ] Integrations are active

### Security Checklist
- [ ] No API keys or tokens exposed
- [ ] No authentication secrets revealed
- [ ] No database credentials shown
- [ ] No internal endpoints with auth details
- [ ] No sensitive user data examples
- [ ] Environment variable names only (not values)
- [ ] No security vulnerability details
- [ ] No rate limiting specifics

### Consistency Checks
- [ ] Features align with project overview
- [ ] Architecture supports listed features
- [ ] Stack includes necessary technologies
- [ ] No contradictions with other docs
- [ ] Impact scores consistent across features
- [ ] Feature categories make sense

---

## Example Output

### Main File: features.md

```markdown
# Features

> **Generated**: 2024-01-15
> **Template**: features
> **Version**: 1.0.0

## Feature Overview

This document provides a comprehensive inventory of all features in the application, ranked by impact score (0-10). Features are classified using a systematic approach that considers user adoption, business value, technical complexity, failure impact, and development effort.

**Impact Classification Guide**: See [features/feature-impact-classification.md](./features/feature-impact-classification.md)

### Feature Summary

| Feature | Impact | Category | Status | Documentation |
|---------|--------|----------|--------|---------------|
| User Authentication | 9.4 | Critical | Active | [View](./features/user-authentication.md) |
| Agent Marketplace | 8.5 | Major | Active | [View](./features/agent-marketplace.md) |
| Real-time Execution | 8.2 | Major | Active | [View](./features/real-time-execution.md) |
| Dashboard Analytics | 7.1 | Important | Active | [View](./features/dashboard-analytics.md) |
| Team Collaboration | 6.8 | Important | Active | [View](./features/team-collaboration.md) |
| Profile Customization | 5.3 | Supporting | Active | Brief description below |
| Notification System | 4.8 | Supporting | Active | Brief description below |
| Dark Mode | 2.8 | Minor | Active | Brief description below |

---

## Critical Features (Impact 8-10)

### User Authentication (9.4/10)

Comprehensive authentication system that handles user registration, login, session management, and OAuth integration. This is the foundation of platform security and enables personalized user experiences.

**Key Capabilities**:
- Email/password authentication with secure password hashing
- OAuth integration (Google, GitHub)
- Magic link authentication
- Session management with JWT tokens
- Password reset and email verification
- Row Level Security (RLS) integration

**Impact Breakdown**:
- User Adoption: 100% (all users must authenticate)
- Business Value: Critical (enables all paid features)
- Technical Complexity: High (OAuth, JWT, RLS, sessions)
- Failure Impact: Critical (application unusable)
- Development Effort: Weeks of development

**Technology Stack**:
- Supabase Auth
- Next.js middleware
- PostgreSQL with RLS

**Documentation**: [features/user-authentication.md](./features/user-authentication.md)

---

### Agent Marketplace (8.5/10)

Central hub for discovering, sharing, and downloading AI agent templates. Enables community collaboration and significantly accelerates agent development by providing pre-built templates.

**Key Capabilities**:
- Browse and search agent templates
- Advanced filtering (category, rating, popularity)
- Rate and review system
- Download and customize templates
- Publish custom agents to community
- Version control for templates

**Impact Breakdown**:
- User Adoption: 85% (most users browse marketplace)
- Business Value: High (key differentiator)
- Technical Complexity: High (search, ratings, versioning)
- Failure Impact: High (major feature unavailable)
- Development Effort: Weeks of development

**Technology Stack**:
- Next.js App Router
- Supabase database
- Real-time subscriptions

**Documentation**: [features/agent-marketplace.md](./features/agent-marketplace.md)

---

### Real-time Execution (8.2/10)

Agent execution environment with live progress monitoring, result streaming, and error handling. Core functionality that delivers the platform's primary value proposition.

**Key Capabilities**:
- Execute agents with custom parameters
- Real-time progress updates
- Live result streaming
- Error handling and recovery
- Execution history and logs
- Resource usage monitoring

**Impact Breakdown**:
- User Adoption: 90% (primary use case)
- Business Value: Critical (core product feature)
- Technical Complexity: Very high (real-time, sandboxing)
- Failure Impact: Critical (core functionality broken)
- Development Effort: Months of development

**Technology Stack**:
- Supabase Realtime
- Server-side execution environment
- WebSocket connections

**Documentation**: [features/real-time-execution.md](./features/real-time-execution.md)

---

## Major Features (Impact 6-7.9)

### Dashboard Analytics (7.1/10)

Real-time analytics dashboard providing insights into usage patterns, performance metrics, and system health. Helps users understand their agent usage and optimize performance.

**Key Capabilities**:
- Usage statistics and trends
- Performance metrics
- Execution history visualization
- Resource consumption tracking
- Activity logs

**Documentation**: [features/dashboard-analytics.md](./features/dashboard-analytics.md)

---

### Team Collaboration (6.8/10)

Features enabling teams to work together on agent development, including shared workspaces, collaborative editing, and permission management.

**Key Capabilities**:
- Team workspaces
- Shared agent libraries
- Role-based permissions
- Collaborative editing
- Team activity feeds

**Documentation**: [features/team-collaboration.md](./features/team-collaboration.md)

---

### Export/Import (6.2/10)

Bulk operations for exporting and importing agent configurations, execution results, and project data. Facilitates backup, migration, and integration workflows.

**Key Capabilities**:
- Export agents as JSON/YAML
- Import agent configurations
- Bulk operations
- Data migration tools

---

## Supporting Features (Impact 4-5.9)

- **Profile Customization** (5.3) - User profile management, avatar upload, bio, preferences
- **Notification System** (4.8) - Real-time notifications for events, email digests, notification preferences
- **Activity Logs** (4.5) - Historical record of user actions, audit trail, searchable logs
- **Keyboard Shortcuts** (4.2) - Quick actions via keyboard, customizable shortcuts, help overlay

---

## Minor Features (Impact 0-3.9)

- **Dark Mode** (2.8) - UI theme toggle between light and dark modes
- **Welcome Tour** (2.3) - Interactive onboarding for new users
- **Tooltips** (1.5) - Contextual help throughout the interface
- **Easter Eggs** (0.5) - Hidden features for user delight

---

## API Endpoints Summary

### High-Impact Feature Endpoints

**Authentication** (`/api/auth`):
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/callback` - OAuth callback
- POST `/api/auth/signout` - User logout

**Agents** (`/api/agents`):
- GET `/api/agents` - List agents
- POST `/api/agents` - Create agent
- GET `/api/agents/[id]` - Get agent details
- PUT `/api/agents/[id]` - Update agent
- DELETE `/api/agents/[id]` - Delete agent
- POST `/api/agents/[id]/execute` - Execute agent

**Marketplace** (`/api/marketplace`):
- GET `/api/marketplace` - Browse templates
- GET `/api/marketplace/[id]` - Template details
- POST `/api/marketplace/[id]/rate` - Rate template
- POST `/api/marketplace/publish` - Publish template

---

## Feature Dependencies

```
User Authentication (9.4)
├── Agent Marketplace (8.5)
├── Real-time Execution (8.2)
├── Dashboard Analytics (7.1)
├── Team Collaboration (6.8)
└── Profile Customization (5.3)

Agent Marketplace (8.5)
├── Real-time Execution (8.2)
└── Export/Import (6.2)

Real-time Execution (8.2)
├── Dashboard Analytics (7.1)
└── Activity Logs (4.5)
```

---

## Integration Points

**Backend Services**:
- **Supabase**: Database, authentication, storage, real-time

**External APIs** (if detected):
- **OpenAI API**: AI model integration
- **Anthropic API**: Claude model access

---

## Security Overview

All features implement security best practices:
- Authentication required for protected features
- Row Level Security (RLS) at database level
- API endpoint authentication
- Rate limiting on public endpoints
- Input validation and sanitization
- Secure session management

---

## Performance Considerations

**High-Impact Features**:
- Optimized database queries
- Caching strategies implemented
- Real-time subscriptions managed efficiently
- Resource usage monitored

**Scalability**:
- Stateless authentication
- Database-level authorization
- Horizontal scaling supported

---

## Future Roadmap

**Planned High-Impact Features**:
- Multi-factor authentication (MFA)
- Advanced agent scheduling
- Marketplace monetization
- Enterprise SSO integration

**Planned Enhancements**:
- Improved analytics dashboards
- Enhanced collaboration tools
- Mobile app support
- API rate limit customization

---

**Note**: This document was automatically generated by DevCache. Last updated: 2024-01-15

For detailed documentation on individual features, see the `features/` directory.
```

---

## Notes for Orchestrator

1. **Use impact classification system** - Apply `feature-impact-classification.md` methodology
2. **Create features/ directory** - Store individual feature docs here
3. **Generate main overview** - Create `features.md` with ranked feature list
4. **Document high-impact features** - Create individual docs for features with impact ≥ 6
5. **Calculate impact scores** - Use the 5-criteria weighted formula
6. **Validate classifications** - Ensure scores reflect reality
7. **Security first** - Never expose sensitive information in any feature doc
8. **Cross-reference** - Link to individual feature docs from main overview
9. **Keep organized** - Use consistent file naming (kebab-case)
10. **Update regularly** - Regenerate when features change significantly

### Execution Workflow

1. **Phase 1: Feature Discovery**
   - Scan project structure for features
   - Identify routes, API endpoints, components
   - Review database schema
   - Check configuration files

2. **Phase 2: Impact Classification**
   - Score each feature on 5 criteria
   - Calculate weighted impact scores
   - Rank features by impact
   - Categorize (Critical/Major/Important/Supporting/Minor)

3. **Phase 3: Documentation Generation**
   - Create `features.md` overview with ranked list
   - Generate individual docs for high-impact features (≥6)
   - Include impact breakdown in each doc
   - Add configuration and integration details

4. **Phase 4: Validation**
   - Verify impact scores are justified
   - Check for sensitive information
   - Validate cross-references
   - Ensure consistency with other docs

### File Structure to Create

```
features/
├── feature-impact-classification.md (reference guide)
├── individual-feature-template.md (template for individual docs)
├── user-authentication.md (if impact ≥ 6)
├── agent-marketplace.md (if impact ≥ 6)
├── real-time-execution.md (if impact ≥ 6)
├── dashboard-analytics.md (if impact ≥ 6)
└── [other-high-impact-features].md
```

### Priority Guidelines

- **Impact 8-10 (Critical)**: Detailed individual documentation required
- **Impact 6-7.9 (Major/Important)**: Individual documentation recommended
- **Impact 4-5.9 (Supporting)**: Brief description in main overview sufficient
- **Impact 0-3.9 (Minor)**: Simple list entry sufficient

### Security Reminders

- ❌ Never include API keys, tokens, or credentials
- ❌ Never expose authentication secrets or mechanisms
- ❌ Never show database connection strings with passwords
- ❌ Never document security vulnerabilities
- ❌ Never include sensitive user data examples
- ✅ Reference environment variable names only
- ✅ Describe systems generally, not implementation details
- ✅ Focus on user-facing functionality
- ✅ Document configuration steps without secrets

