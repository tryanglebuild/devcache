# Orchestrator Template - DevCache Documentation System

## Purpose
The orchestrator is the central intelligence that manages, coordinates, and validates all documentation generation processes. It ensures quality, consistency, security, and completeness across all generated documentation.

---

## Core Responsibilities

### 1. Template Management
- **Select appropriate templates** based on project analysis
- **Determine execution order** for template processing
- **Coordinate dependencies** between templates
- **Validate template outputs** against expected structure

### 2. Quality Assurance
- **Review generated content** for completeness and accuracy
- **Ensure consistency** across all documentation files
- **Validate markdown formatting** and structure
- **Check for missing or incomplete sections**

### 3. Security & Privacy
- **Scan for sensitive information** (API keys, passwords, tokens)
- **Redact or reject** documents containing sensitive data
- **Validate environment variable references** are not exposed
- **Ensure no hardcoded credentials** in documentation

### 4. Project Analysis
- **Analyze project structure** before template execution
- **Identify technology stack** and frameworks
- **Detect project type** (web app, API, library, CLI, etc.)
- **Map dependencies** and relationships

---

## Template Execution Workflow

### Phase 1: Initial Analysis
```
1. Scan project root directory
2. Identify package.json, configuration files, and entry points
3. Detect technology stack (Next.js, React, Supabase, etc.)
4. Determine project type and architecture
5. Create execution plan for templates
```

### Phase 2: Template Selection
```
Based on project analysis, select templates in this order:

GENERAL TEMPLATES (Always execute):
1. project-overview.md
2. project-impact.md

TECH TEMPLATES (Conditional based on stack):
3. stack-project.md (if tech stack detected)
4. architecture-project.md (if complex architecture)
5. features.md (always - includes impact classification and individual feature docs)

SPECIALIZED TEMPLATES (Conditional):
6. api-documentation.md (if API routes detected)
7. database-schema.md (if database detected)
8. component-library.md (if component system detected)
```

**Special Note on Features Template**:
The features template has a unique two-part output:
- Main overview file: `features.md` with ranked feature list
- Individual feature docs: `features/[feature-name].md` for high-impact features (impact ≥ 6)

The orchestrator must:
1. Create `features/` directory
2. Copy classification guides to `features/`
3. Generate main `features.md` overview
4. Generate individual docs for high-impact features
5. Validate impact scores are justified
6. Ensure no sensitive information in any feature doc

### Phase 3: Template Execution
```
For each selected template:
1. Load template instructions
2. Execute analysis based on template prompts
3. Generate markdown content
4. Apply security validation
5. Store output in designated location
6. Mark template as completed
```

### Phase 4: Validation & Review
```
After all templates execute:
1. Review all generated files
2. Cross-reference information for consistency
3. Validate completeness of required sections
4. Check for security violations
5. Generate validation report
6. Approve or request regeneration
```

---

## Security Rules (CRITICAL)

### Prohibited Content
The orchestrator MUST reject any documentation containing:

1. **API Keys & Tokens**
   - Supabase keys (anon, service role)
   - Third-party API keys
   - OAuth client secrets
   - JWT secrets

2. **Credentials**
   - Passwords (plain or hashed)
   - Database connection strings with credentials
   - SSH keys or certificates

3. **Sensitive URLs**
   - Internal API endpoints with authentication
   - Database URLs with credentials
   - Admin panel URLs

4. **Business Logic**
   - Proprietary algorithms
   - Pricing calculations
   - Security implementations

5. **Personal Information**
   - Email addresses (except generic examples)
   - Phone numbers
   - Physical addresses

### Allowed References
- Environment variable names (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
- Generic examples (e.g., `your-api-key-here`)
- Public documentation URLs
- Technology names and versions

### Security Validation Process
```
For each generated document:
1. Scan for patterns matching sensitive data
2. Check against prohibited content list
3. Validate environment variable usage
4. If violations found:
   - Log the violation
   - Reject the document
   - Request regeneration with redaction
5. If clean:
   - Mark as approved
   - Proceed to next validation step
```

---

## Template Structure Requirements

All templates MUST be markdown (.md) files with this structure:

```markdown
# Template Name

## Metadata
- **Category**: general | tech | specialized
- **Output File**: filename.md
- **Dependencies**: [list of templates that must run first]
- **Required**: true | false

## Description
[Detailed description of what this template analyzes and documents]

## Analysis Instructions

### What to Analyze
[Specific files, directories, or patterns to examine]

### What to Extract
[Specific information to extract from the codebase]

### What to Ignore
[Files or patterns to skip during analysis]

## Output Structure

### Required Sections
1. **Section Name**
   - Prompt: [What question to answer]
   - Format: [How to format the response]
   - Example: [Example output]

## Validation Rules
- [ ] All required sections are present
- [ ] No sensitive information is exposed
- [ ] Markdown formatting is correct
- [ ] Information is accurate and up-to-date

## Security Checklist
- [ ] No API keys or tokens
- [ ] No passwords or credentials
- [ ] No internal URLs or endpoints
- [ ] No sensitive business logic
- [ ] No personal information
```

---

## Post-Generation Review Checklist

After all templates execute, the orchestrator MUST verify:

### Document Quality
- [ ] All required documents generated
- [ ] No placeholder content remains
- [ ] Markdown formatting is correct
- [ ] Code examples are accurate
- [ ] Links are valid

### Security Compliance
- [ ] No API keys or tokens exposed
- [ ] No credentials in documentation
- [ ] Environment variables properly referenced
- [ ] No sensitive business logic revealed

### Consistency
- [ ] Project name consistent across docs
- [ ] Technology versions match
- [ ] Architecture descriptions align
- [ ] No contradictory information

### Completeness
- [ ] All required sections present
- [ ] Sufficient detail in each section
- [ ] Examples provided where needed
- [ ] Cross-references are valid

### Accuracy
- [ ] Information matches actual codebase
- [ ] File paths are correct
- [ ] Technology stack is accurate
- [ ] Features listed actually exist

---

## Important Notes

1. **Always prioritize security** - When in doubt, reject and request manual review
2. **Be thorough** - Better to over-validate than under-validate
3. **Maintain consistency** - Cross-reference all documents
4. **Stay updated** - Regenerate when codebase changes significantly
5. **Document decisions** - Log all orchestrator decisions for audit trail

---

## Feature Documentation System

### Overview
The feature documentation system uses a systematic impact classification approach to identify, rank, and document features based on their importance to the project.

### Impact Classification (0-10 Scale)

Features are scored using 5 weighted criteria:
1. **User Adoption** (30%) - Percentage of users using the feature
2. **Business Value** (25%) - Contribution to business goals
3. **Technical Complexity** (20%) - Implementation complexity
4. **Failure Impact** (15%) - Impact if feature fails
5. **Development Effort** (10%) - Time invested in development

**Formula**:
```
Impact Score = (
  (User Adoption × 0.30) +
  (Business Value × 0.25) +
  (Technical Complexity × 0.20) +
  (Failure Impact × 0.15) +
  (Development Effort × 0.10)
) / 10
```

### Feature Categories

- **10 - Critical Core**: Essential features (e.g., authentication, core functionality)
- **8-9 - Major**: Highly important features (e.g., marketplace, real-time features)
- **6-7 - Important**: Valuable enhancements (e.g., analytics, collaboration)
- **4-5 - Supporting**: Useful additions (e.g., notifications, shortcuts)
- **2-3 - Minor**: Nice-to-have features (e.g., dark mode, tooltips)
- **0-1 - Experimental**: Rarely used or deprecated features

### Documentation Requirements

**Impact ≥ 8 (Critical/Major)**:
- Individual detailed documentation required
- Full implementation details
- Configuration steps
- API endpoints
- Security considerations
- Integration points

**Impact 6-7 (Important)**:
- Individual documentation recommended
- Key implementation details
- Configuration overview
- Main integration points

**Impact 4-5 (Supporting)**:
- Brief description in main overview
- Key capabilities listed
- No individual doc needed

**Impact 0-3 (Minor)**:
- Simple list entry
- One-line description
- No detailed documentation

### Orchestrator Responsibilities for Features

1. **Feature Discovery**
   - Scan project for all features
   - Identify routes, API endpoints, components
   - Review database schema
   - Check configuration files

2. **Impact Classification**
   - Score each feature on 5 criteria
   - Calculate weighted impact scores
   - Rank features by impact
   - Categorize by impact level

3. **Documentation Generation**
   - Create `features.md` overview with ranked list
   - Generate individual docs for features with impact ≥ 6
   - Include impact breakdown in each doc
   - Add configuration and integration details

4. **Validation**
   - Verify impact scores are justified with evidence
   - Check for sensitive information exposure
   - Validate cross-references
   - Ensure consistency with other documentation

5. **Security Validation**
   - Scan all feature docs for sensitive data
   - Ensure no API keys, tokens, or credentials
   - Verify environment variables referenced by name only
   - Check that security mechanisms not exposed
