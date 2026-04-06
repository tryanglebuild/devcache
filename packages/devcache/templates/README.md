# DevCache Template System

## Overview

The DevCache template system provides a structured approach to automatically generating comprehensive project documentation. Templates are markdown files that define what to analyze, how to extract information, and how to format the output.

---

## Template Structure

All templates follow this standardized markdown format:

```markdown
# Template Name

## Metadata
- Category: general | tech | specialized
- Output File: filename.md
- Dependencies: [list of required templates]
- Required: true | false
- Priority: 1-10 (lower = execute first)

## Description
[What this template analyzes and documents]

## Analysis Instructions
### What to Analyze
### What to Extract
### What to Ignore

## Output Structure
### Required Sections
### Optional Sections

## Validation Rules
### Content Validation
### Security Checklist
### Consistency Checks

## Example Output
[Complete example of generated documentation]
```

---

## Template Categories

### General Templates (`general/`)
Foundational documentation that applies to all projects:
- `project-overview-template.md` - High-level project description
- `project-impact-template.md` - Business impact and value proposition

### Tech Templates (`tech/`)
Technology-specific documentation:
- `stack-project-template.md` - Complete technology stack
- `architecture-project-template.md` - System architecture
- `features-template.md` - Feature documentation

---

## Security Rules (CRITICAL)

### Prohibited Content

Templates MUST NEVER include:

❌ API keys or tokens
❌ Passwords or credentials
❌ Database connection strings with credentials
❌ OAuth client secrets
❌ JWT secrets
❌ Internal URLs with authentication
❌ SSH keys or certificates
❌ Proprietary algorithms
❌ Sensitive business logic
❌ Personal information (emails, phones, addresses)

### Allowed References

✅ Environment variable names (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
✅ Generic examples (e.g., `your-api-key-here`)
✅ Public documentation URLs
✅ Technology names and versions
✅ Public repository URLs

---

## Template Execution Flow

```
1. Project Analysis
   ↓
2. Template Selection (based on project type)
   ↓
3. Dependency Resolution (determine execution order)
   ↓
4. Template Execution (generate documentation)
   ↓
5. Security Validation (scan for sensitive data)
   ↓
6. Quality Validation (check completeness and accuracy)
   ↓
7. Cross-Document Validation (ensure consistency)
   ↓
8. Report Generation (summary of process)
```

---

## Creating New Templates

### Step 1: Choose Category
Determine if your template is:
- **General**: Applies to all projects
- **Tech**: Specific to certain technologies
- **Specialized**: Domain-specific (API, database, etc.)

### Step 2: Define Metadata
```markdown
## Metadata
- **Category**: [general|tech|specialized]
- **Output File**: [filename.md]
- **Dependencies**: [list of templates that must run first]
- **Required**: [true|false]
- **Priority**: [1-10, lower = execute first]
```

### Step 3: Write Analysis Instructions
Be specific about:
- Which files to analyze
- What information to extract
- What to ignore

### Step 4: Define Output Structure
For each section:
- Write a clear prompt
- Specify the format
- Provide an example
- Mark as required or optional

### Step 5: Add Validation Rules
Include:
- Content validation checks
- Security validation checks
- Consistency checks with other documents

### Step 6: Provide Example Output
Show a complete example of what the generated documentation should look like.

---

## Template Best Practices

### DO:
✅ Be specific in analysis instructions
✅ Provide clear examples for each section
✅ Include comprehensive validation rules
✅ Cross-reference with related templates
✅ Explain the purpose of each section
✅ Use consistent formatting
✅ Include security checks
✅ Provide orchestrator notes

### DON'T:
❌ Include sensitive information in examples
❌ Make assumptions about project structure
❌ Use vague or ambiguous prompts
❌ Skip validation rules
❌ Forget to specify dependencies
❌ Use inconsistent terminology
❌ Overcomplicate the structure

---

## Validation Checklist

Before finalizing a template, verify:

- [ ] Metadata is complete and accurate
- [ ] Analysis instructions are specific
- [ ] All sections have clear prompts
- [ ] Examples are provided for each section
- [ ] Security rules are comprehensive
- [ ] Validation rules are thorough
- [ ] Dependencies are correctly specified
- [ ] Example output is complete
- [ ] Orchestrator notes are helpful
- [ ] No sensitive information in examples

---

## Support

For questions or issues with templates:
1. Review this README
2. Check the orchestrator documentation
3. Examine existing template examples
4. Consult the validation rules

---

**Last Updated**: 2024-01-15
**Template System Version**: 2.0.0
