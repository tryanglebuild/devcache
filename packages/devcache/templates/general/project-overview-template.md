# Project Overview Template

## Metadata
- **Category**: general
- **Output File**: project-overview.md
- **Dependencies**: []
- **Required**: true
- **Priority**: 1 (Execute first)

## Description
This template generates a comprehensive high-level overview of the project, including its purpose, objectives, target audience, and core concept. It provides the foundational understanding needed for all other documentation.

---

## Analysis Instructions

### What to Analyze
- `package.json` - Project name, description, version
- `README.md` - Project description and purpose
- Root directory structure - Project organization
- Configuration files - Project type indicators
- Entry points (`app/`, `src/`, `pages/`) - Application structure

### What to Extract
- Project name and version
- Main purpose and central idea
- Core objectives and goals
- Target audience and use cases
- Project type (web app, API, library, CLI, etc.)
- Key features (high-level only)

### What to Ignore
- Implementation details
- Code-level specifics
- Dependencies and packages
- Build configurations
- Test files

---

## Output Structure

### Required Sections

#### 1. Project Name
- **Prompt**: What is the official name of this project?
- **Format**: Plain text, single line
- **Source**: Extract from `package.json` → `name` field
- **Example**: 
  ```
  Agentic Platform
  ```

#### 2. Project Version
- **Prompt**: What is the current version of the project?
- **Format**: Semantic versioning (X.Y.Z)
- **Source**: Extract from `package.json` → `version` field
- **Example**:
  ```
  Version: 1.0.0
  ```

#### 3. Purpose
- **Prompt**: What is the main purpose of this project? What problem does it solve?
- **Format**: 2-3 paragraphs, conceptual description
- **Source**: Analyze README.md, package.json description, and project structure
- **Example**:
  ```
  This project is a comprehensive platform for creating, managing, and executing AI agents. 
  It provides developers with tools to build custom agents, share them with the community, 
  and integrate them into their workflows.
  ```

#### 4. Central Idea
- **Prompt**: What is the core concept and vision behind this project?
- **Format**: 1-2 paragraphs, visionary description
- **Source**: Synthesize from README, project structure, and feature analysis
- **Example**:
  ```
  The central idea is to democratize AI agent development by providing a marketplace-style 
  platform where developers can discover, customize, and deploy agents without deep ML expertise.
  ```

#### 5. Objectives
- **Prompt**: What are the main objectives and goals of this project?
- **Format**: Bulleted list, 4-6 items
- **Source**: Infer from features, architecture, and project structure
- **Example**:
  ```
  - Enable rapid AI agent development and deployment
  - Provide a secure, scalable infrastructure for agent execution
  - Foster a community-driven marketplace for agent templates
  ```

#### 6. Project Type
- **Prompt**: What type of project is this?
- **Format**: Category with brief description
- **Detection Logic**:
  - If `app/` or `pages/` directory exists → Web Application
  - If `app/api/` exists → Full-stack Application with API
  - If only `api/` or `src/api/` → API/Backend Service
  - If `lib/` or `dist/` → Library/Package
  - If `bin/` or CLI commands → CLI Tool
- **Example**:
  ```
  **Type**: Full-stack Web Application
  
  A Next.js-based web application with integrated API routes, database layer, 
  and real-time features.
  ```

### Optional Sections

#### 7. Target Audience
- **Prompt**: Who is the intended audience for this project?
- **Format**: Bulleted list with descriptions
- **Source**: Infer from features, UI complexity, and documentation
- **Example**:
  ```
  - **Developers**: Software engineers looking to integrate AI agents
  - **AI Enthusiasts**: Users interested in experimenting with AI capabilities
  - **Enterprises**: Organizations seeking scalable AI solutions
  ```

---

## Validation Rules

### Content Validation
- [ ] Project name matches `package.json`
- [ ] Version is valid semantic versioning
- [ ] Purpose is clear and concise (not too technical)
- [ ] Central idea is visionary (not implementation-focused)
- [ ] Objectives are specific and measurable
- [ ] Project type accurately reflects the codebase
- [ ] All required sections are present
- [ ] No placeholder text remains

### Quality Checks
- [ ] Language is clear and professional
- [ ] No jargon without explanation
- [ ] Consistent terminology throughout
- [ ] Proper markdown formatting
- [ ] No grammatical errors

### Security Checklist
- [ ] No API keys or tokens mentioned
- [ ] No internal URLs or endpoints
- [ ] No sensitive business metrics
- [ ] No proprietary algorithms described
- [ ] No customer/user data referenced

---

## Example Output

```markdown
# Project Overview

> **Generated**: 2024-01-15
> **Template**: project-overview
> **Version**: 1.0.0

## Project Name

Agentic Platform

## Project Version

Version: 1.2.0

## Purpose

This project is a comprehensive platform for creating, managing, and executing AI agents. It provides developers with tools to build custom agents, share them with the community, and integrate them into their workflows.

## Central Idea

The central idea is to democratize AI agent development by providing a marketplace-style platform where developers can discover, customize, and deploy agents without deep ML expertise.

## Objectives

- Enable rapid AI agent development and deployment
- Provide a secure, scalable infrastructure for agent execution
- Foster a community-driven marketplace for agent templates
- Integrate seamlessly with existing development workflows

## Project Type

**Type**: Full-stack Web Application

A Next.js-based web application with integrated API routes, database layer, and real-time features.

## Target Audience

- **Developers**: Software engineers looking to integrate AI agents into their applications
- **AI Enthusiasts**: Users interested in experimenting with AI agent capabilities
- **Enterprises**: Organizations seeking scalable AI agent solutions

---

**Note**: This document was automatically generated by DevCache. Last updated: 2024-01-15
```

---

## Notes for Orchestrator

1. **Execute this template first** - It provides foundational information for other templates
2. **Be conceptual, not technical** - Save technical details for architecture and stack templates
3. **Focus on the "why"** - Purpose and vision matter more than implementation
4. **Keep it accessible** - Write for non-technical stakeholders as well as developers
5. **Validate thoroughly** - This document sets the tone for all other documentation

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

**Template**: project-overview

---

*This document was automatically generated by AI-powered analysis. Please review and validate the content for accuracy.*
```
