# Feature Impact Classification Guide

## Purpose
This guide provides a systematic approach to classify and rank features based on their impact on the project. It helps prioritize documentation efforts and understand which features are most critical to the application's success.

---

## Impact Scale (0-10)

### 10 - Critical Core Feature
**Definition**: Essential feature without which the application cannot function or fulfill its primary purpose.

**Characteristics**:
- Directly implements the main value proposition
- Used by 90%+ of users
- Failure would make the application unusable
- Cannot be removed without fundamentally changing the product

**Examples**:
- User authentication in a SaaS platform
- Payment processing in an e-commerce app
- Document editing in a document management system
- Agent execution in an AI agent platform

**Documentation Priority**: HIGHEST - Must be documented in detail

---

### 8-9 - Major Feature
**Definition**: Highly important feature that significantly contributes to the application's value but isn't absolutely essential.

**Characteristics**:
- Used by 60-90% of users
- Provides significant competitive advantage
- Failure would severely impact user experience
- Removal would significantly reduce product value

**Examples**:
- Real-time collaboration features
- Advanced search and filtering
- Dashboard and analytics
- Template marketplace

**Documentation Priority**: HIGH - Should be documented thoroughly

---

### 6-7 - Important Feature
**Definition**: Valuable feature that enhances the application but isn't critical to core functionality.

**Characteristics**:
- Used by 30-60% of users
- Improves user experience significantly
- Failure would be noticed but not critical
- Removal would reduce but not eliminate product value

**Examples**:
- User profile customization
- Notification system
- Export/import functionality
- Theme customization

**Documentation Priority**: MEDIUM-HIGH - Should be documented

---

### 4-5 - Supporting Feature
**Definition**: Useful feature that supports the main functionality but isn't essential.

**Characteristics**:
- Used by 10-30% of users
- Provides convenience or efficiency
- Failure would be minor inconvenience
- Removal would be noticed by some users

**Examples**:
- Keyboard shortcuts
- Bulk operations
- Activity logs
- Quick actions menu

**Documentation Priority**: MEDIUM - Can be documented briefly

---

### 2-3 - Minor Feature
**Definition**: Nice-to-have feature that adds small value.

**Characteristics**:
- Used by <10% of users
- Provides marginal benefit
- Failure would rarely be noticed
- Removal would have minimal impact

**Examples**:
- Easter eggs
- Tooltips and hints
- Welcome tours
- Minor UI animations

**Documentation Priority**: LOW - Brief mention sufficient

---

### 0-1 - Experimental/Deprecated
**Definition**: Feature that is experimental, rarely used, or being phased out.

**Characteristics**:
- Used by <1% of users
- May be in testing phase
- May be deprecated
- Minimal to no impact on user experience

**Examples**:
- Beta features
- Deprecated APIs
- Hidden experimental options
- Legacy compatibility features

**Documentation Priority**: MINIMAL - May not need documentation

---

## Classification Criteria

### 1. User Adoption (Weight: 30%)
**Question**: What percentage of users actively use this feature?

**Scoring**:
- 90-100% usage → 10 points
- 70-89% usage → 8 points
- 50-69% usage → 6 points
- 30-49% usage → 4 points
- 10-29% usage → 2 points
- <10% usage → 0 points

**How to Measure**:
- Analyze usage analytics
- Check feature engagement metrics
- Review user feedback and support tickets
- Examine database queries for feature-related tables

---

### 2. Business Value (Weight: 25%)
**Question**: How much does this feature contribute to business goals?

**Scoring**:
- Critical to revenue/core mission → 10 points
- Significant revenue impact → 8 points
- Moderate business value → 6 points
- Some business value → 4 points
- Minimal business value → 2 points
- No direct business value → 0 points

**How to Measure**:
- Revenue attribution
- Conversion rate impact
- Customer retention correlation
- Competitive differentiation

---

### 3. Technical Complexity (Weight: 20%)
**Question**: How complex is this feature technically?

**Scoring**:
- Extremely complex (multiple services, critical infrastructure) → 10 points
- Very complex (multiple components, integrations) → 8 points
- Moderately complex (several files, some integrations) → 6 points
- Somewhat complex (few files, simple logic) → 4 points
- Simple (single component, basic logic) → 2 points
- Trivial (minimal code) → 0 points

**How to Measure**:
- Number of files involved
- Number of external dependencies
- Integration complexity
- Code complexity metrics

---

### 4. Failure Impact (Weight: 15%)
**Question**: What happens if this feature fails?

**Scoring**:
- Application unusable → 10 points
- Major functionality broken → 8 points
- Significant user impact → 6 points
- Moderate inconvenience → 4 points
- Minor inconvenience → 2 points
- Barely noticeable → 0 points

**How to Measure**:
- Historical incident impact
- User complaints when feature is down
- Dependency analysis
- Critical path analysis

---

### 5. Development Effort (Weight: 10%)
**Question**: How much effort was required to build this feature?

**Scoring**:
- Months of development → 10 points
- Weeks of development → 8 points
- Days of development → 6 points
- Hours of development → 4 points
- Minutes of development → 2 points
- Trivial implementation → 0 points

**How to Measure**:
- Git history analysis
- Number of commits
- Lines of code
- Team size involved

---

## Calculation Formula

```
Impact Score = (
  (User Adoption × 0.30) +
  (Business Value × 0.25) +
  (Technical Complexity × 0.20) +
  (Failure Impact × 0.15) +
  (Development Effort × 0.10)
) / 10
```

**Result**: Final score from 0-10

---

## Classification Process

### Step 1: Identify All Features
- Scan application routes and pages
- Review API endpoints
- Examine database schema
- Check component library
- Review README and documentation

### Step 2: Gather Data
For each feature, collect:
- Usage statistics (if available)
- User feedback
- Technical metrics
- Business metrics
- Development history

### Step 3: Score Each Criterion
Use the scoring guides above to rate each feature on all 5 criteria.

### Step 4: Calculate Impact Score
Apply the formula to get the final impact score (0-10).

### Step 5: Classify and Prioritize
Group features by impact level and prioritize documentation accordingly.

---

## Detection Heuristics

### High Impact Indicators
- Feature has dedicated database tables
- Feature has multiple API endpoints
- Feature appears in main navigation
- Feature mentioned in marketing materials
- Feature has extensive test coverage
- Feature has dedicated documentation

### Low Impact Indicators
- Feature hidden in settings
- Feature has no analytics tracking
- Feature rarely mentioned in support tickets
- Feature has minimal code
- Feature has no tests
- Feature not in user onboarding

---

## Example Classification

### Feature: User Authentication

**User Adoption**: 100% (all users must authenticate) → 10 points
**Business Value**: Critical (no app without auth) → 10 points
**Technical Complexity**: High (OAuth, JWT, sessions, RLS) → 8 points
**Failure Impact**: Application unusable → 10 points
**Development Effort**: Significant (weeks of work) → 8 points

**Calculation**:
```
Impact Score = (
  (10 × 0.30) +  // 3.0
  (10 × 0.25) +  // 2.5
  (8 × 0.20) +   // 1.6
  (10 × 0.15) +  // 1.5
  (8 × 0.10)     // 0.8
) / 10 = 9.4 / 10 = 9.4
```

**Classification**: Critical Core Feature (10)
**Documentation Priority**: HIGHEST

---

### Feature: Dark Mode Toggle

**User Adoption**: 40% (some users prefer dark mode) → 4 points
**Business Value**: Minimal (nice-to-have) → 2 points
**Technical Complexity**: Low (CSS variables, state) → 2 points
**Failure Impact**: Minor inconvenience → 2 points
**Development Effort**: Hours of work → 4 points

**Calculation**:
```
Impact Score = (
  (4 × 0.30) +   // 1.2
  (2 × 0.25) +   // 0.5
  (2 × 0.20) +   // 0.4
  (2 × 0.15) +   // 0.3
  (4 × 0.10)     // 0.4
) / 10 = 2.8 / 10 = 2.8
```

**Classification**: Minor Feature (3)
**Documentation Priority**: LOW

---

## Security Considerations

### What to Document
✅ Feature name and purpose
✅ User-facing functionality
✅ General architecture approach
✅ Integration points (service names only)
✅ User workflows

### What NOT to Document
❌ API keys or tokens
❌ Authentication secrets
❌ Database credentials
❌ Internal security mechanisms
❌ Vulnerability details
❌ Rate limiting specifics
❌ Encryption keys

---

## Validation Checklist

Before finalizing feature classification:

- [ ] All major features identified
- [ ] Usage data collected (if available)
- [ ] Business value assessed
- [ ] Technical complexity evaluated
- [ ] Failure impact considered
- [ ] Development effort estimated
- [ ] Impact scores calculated
- [ ] Features ranked by priority
- [ ] No sensitive information included
- [ ] Documentation priorities assigned

---

## Notes for Orchestrator

1. **Use this guide** to classify all features systematically
2. **Prioritize documentation** based on impact scores
3. **Focus on high-impact features** (8-10) for detailed docs
4. **Brief documentation** for medium-impact features (4-7)
5. **Minimal documentation** for low-impact features (0-3)
6. **Always validate** that no sensitive information is exposed
7. **Cross-reference** with architecture and stack documentation
8. **Update classifications** as features evolve

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
