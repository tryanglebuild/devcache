# Project Impact Template

## Metadata
- **Category**: general
- **Output File**: project-impact.md
- **Dependencies**: [project-overview.md]
- **Required**: true
- **Priority**: 2 (Execute after project overview)

## Description
This template analyzes the problem being solved, the solution approach, and the expected impact of the project. It provides justification for the project's existence and defines success metrics.

---

## Analysis Instructions

### What to Analyze
- `README.md` - Problem statement and solution description
- Project documentation - Business case and objectives
- User-facing features - Target audience and use cases
- Competitive landscape - How this differs from alternatives

### What to Extract
- Problem being solved
- Root causes of the problem
- Solution approach
- Expected outcomes and benefits
- Success metrics
- Target users and beneficiaries

### What to Ignore
- Implementation details
- Technical specifications
- Code-level information
- Deployment specifics

---

## Output Structure

### Required Sections

#### 1. Problem Statement
- **Prompt**: What problem does this project address? Be specific and clear.
- **Format**: 2-3 paragraphs describing the problem
- **Source**: README.md, project documentation, feature analysis
- **Example**:
  ```
  Developers struggle to create and manage AI agents due to the complexity of ML frameworks 
  and the lack of standardized tools. This results in duplicated effort, inconsistent 
  implementations, and high barriers to entry for teams without ML expertise.
  
  Current solutions require deep technical knowledge and significant time investment, 
  making AI agent development inaccessible to many development teams.
  ```

#### 2. Root Cause Analysis
- **Prompt**: Why does this problem exist? What are the underlying causes?
- **Format**: Bulleted list of root causes with explanations
- **Source**: Infer from problem statement and solution approach
- **Example**:
  ```
  - **Fragmented Ecosystem**: No unified platform for agent development
  - **High Complexity**: Steep learning curve for ML frameworks
  - **Lack of Standards**: No common patterns or best practices
  - **Limited Reusability**: Difficult to share and reuse agent implementations
  ```

#### 3. Solution Approach
- **Prompt**: How does this project solve the identified problem?
- **Format**: 2-3 paragraphs describing the solution
- **Source**: Project features, architecture, and objectives
- **Example**:
  ```
  This project provides a unified platform that abstracts away the complexity of AI agent 
  development. It offers a marketplace of pre-built agent templates, a visual editor for 
  customization, and a secure execution environment.
  
  By standardizing agent development patterns and providing reusable components, the platform 
  enables developers to focus on business logic rather than infrastructure.
  ```

#### 4. Expected Impact
- **Prompt**: What are the expected outcomes and benefits of this project?
- **Format**: Categorized list of impacts
- **Categories**:
  - Developer Experience
  - Business Value
  - Technical Benefits
  - Community Impact
- **Example**:
  ```
  **Developer Experience**:
  - Reduce agent development time by 70%
  - Lower barrier to entry for AI agent development
  - Enable rapid prototyping and iteration
  
  **Business Value**:
  - Accelerate time-to-market for AI features
  - Reduce development costs
  - Enable new revenue streams
  
  **Technical Benefits**:
  - Standardized agent architecture
  - Improved code reusability
  - Better security and compliance
  
  **Community Impact**:
  - Foster knowledge sharing
  - Build ecosystem of agent templates
  - Enable collaboration
  ```

#### 5. Target Users
- **Prompt**: Who will benefit from this solution? Be specific about user personas.
- **Format**: List of user personas with descriptions
- **Source**: Feature analysis, UI complexity, documentation
- **Example**:
  ```
  **Primary Users**:
  - **Full-stack Developers**: Building applications with AI capabilities
  - **Product Teams**: Prototyping AI features without ML expertise
  - **Startups**: Rapid development with limited resources
  
  **Secondary Users**:
  - **Enterprise Teams**: Standardizing AI agent development
  - **AI Researchers**: Sharing and testing agent implementations
  - **Educators**: Teaching AI agent concepts
  ```

### Optional Sections

#### 6. Success Metrics
- **Prompt**: How will success be measured? What are the key performance indicators?
- **Format**: Categorized list of metrics
- **Categories**:
  - Adoption Metrics
  - Performance Metrics
  - Quality Metrics
  - Business Metrics
- **Example**:
  ```
  **Adoption Metrics**:
  - Number of active users
  - Agent templates created
  - Community contributions
  
  **Performance Metrics**:
  - Average development time reduction
  - Agent execution speed
  - Platform uptime
  
  **Quality Metrics**:
  - Code reusability rate
  - Bug reports and resolution time
  - User satisfaction score
  
  **Business Metrics**:
  - Revenue growth
  - Customer retention
  - Market share
  ```

#### 7. Competitive Advantage
- **Prompt**: What makes this solution unique compared to alternatives?
- **Format**: Bulleted list of differentiators
- **Example**:
  ```
  - First marketplace-style platform for AI agents
  - Built-in security and compliance features
  - Visual editor for non-technical users
  - Enterprise-grade scalability
  ```

---

## Validation Rules

### Content Validation
- [ ] Problem statement is clear and specific
- [ ] Root causes are logical and well-explained
- [ ] Solution approach directly addresses the problem
- [ ] Expected impacts are realistic and measurable
- [ ] Target users are clearly defined
- [ ] All required sections are present
- [ ] No placeholder text remains

### Quality Checks
- [ ] Language is clear and professional
- [ ] No jargon without explanation
- [ ] Consistent terminology throughout
- [ ] Proper markdown formatting
- [ ] No grammatical errors

### Security Checklist
- [ ] No sensitive business metrics exposed
- [ ] No proprietary strategies revealed
- [ ] No customer data referenced
- [ ] No internal financial information
- [ ] No competitive intelligence leaked

### Consistency Checks
- [ ] Aligns with project overview
- [ ] Target users match those in overview
- [ ] Solution approach matches features
- [ ] Success metrics are achievable

---

## Example Output

```markdown
# Project Impact

> **Generated**: 2024-01-15
> **Template**: project-impact
> **Version**: 1.0.0

## Problem Statement

Developers struggle to create and manage AI agents due to the complexity of ML frameworks and the lack of standardized tools. This results in duplicated effort, inconsistent implementations, and high barriers to entry for teams without ML expertise.

Current solutions require deep technical knowledge and significant time investment, making AI agent development inaccessible to many development teams.

## Root Cause Analysis

- **Fragmented Ecosystem**: No unified platform for agent development
- **High Complexity**: Steep learning curve for ML frameworks
- **Lack of Standards**: No common patterns or best practices
- **Limited Reusability**: Difficult to share and reuse agent implementations

## Solution Approach

This project provides a unified platform that abstracts away the complexity of AI agent development. It offers a marketplace of pre-built agent templates, a visual editor for customization, and a secure execution environment.

By standardizing agent development patterns and providing reusable components, the platform enables developers to focus on business logic rather than infrastructure.

## Expected Impact

### Developer Experience
- Reduce agent development time by 70%
- Lower barrier to entry for AI agent development
- Enable rapid prototyping and iteration

### Business Value
- Accelerate time-to-market for AI features
- Reduce development costs
- Enable new revenue streams

### Technical Benefits
- Standardized agent architecture
- Improved code reusability
- Better security and compliance

### Community Impact
- Foster knowledge sharing
- Build ecosystem of agent templates
- Enable collaboration

## Target Users

### Primary Users
- **Full-stack Developers**: Building applications with AI capabilities
- **Product Teams**: Prototyping AI features without ML expertise
- **Startups**: Rapid development with limited resources

### Secondary Users
- **Enterprise Teams**: Standardizing AI agent development
- **AI Researchers**: Sharing and testing agent implementations
- **Educators**: Teaching AI agent concepts

## Success Metrics

### Adoption Metrics
- Number of active users
- Agent templates created
- Community contributions

### Performance Metrics
- Average development time reduction
- Agent execution speed
- Platform uptime

---

**Note**: This document was automatically generated by DevCache. Last updated: 2024-01-15
```

---

## Notes for Orchestrator

1. **Execute after project overview** - Builds on foundational information
2. **Focus on business value** - Explain why this project matters
3. **Be realistic** - Expected impacts should be achievable
4. **Quantify when possible** - Use specific metrics and numbers
5. **Validate alignment** - Ensure consistency with project overview
6. **Avoid hype** - Be honest about challenges and limitations
