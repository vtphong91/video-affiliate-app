# Claude Code Agents - Video Affiliate App

This directory contains specialized AI agents for the Video Affiliate App project. Each agent is an expert in a specific domain and can be invoked to help with tasks in that area.

## 🎯 AI & Research Agents (Content Quality Focus)

These 6 agents work together to create authentic, high-quality Vietnamese product reviews:

### 1. 🎬 **video-content-analyst**
**Purpose**: Deep analysis of video transcripts to extract authentic product insights

**Use when**:
- Analyzing new video content for review generation
- Extracting specific product features from transcript
- Verifying claims and gathering evidence
- Identifying credibility signals in source material

**Key outputs**:
- Transcript analysis report with timestamps
- Review content blueprint (structured insights)
- Authenticity signals and quality notes

**Example usage**:
```bash
@video-content-analyst "Analyze this iPhone 15 Pro Max review transcript and extract all product insights with timestamps"
```

---

### 2. ✅ **content-authenticity-validator**
**Purpose**: Validates AI-generated reviews for authenticity and credibility

**Use when**:
- After generating review content (quality gate)
- Detecting AI-sounding or fake marketing language
- Ensuring balanced pros/cons ratio
- Fact-checking against source material

**Key outputs**:
- Authenticity validation report (score + issues)
- Fact-check results table
- Specific improvement recommendations
- Publish-ready verdict

**Example usage**:
```bash
@content-authenticity-validator "Check this iPhone review for authenticity - does it sound genuine or like AI marketing copy?"
```

---

### 3. 🇻🇳 **vietnamese-language-specialist**
**Purpose**: Ensures natural Vietnamese writing for social media

**Use when**:
- Reviewing Vietnamese language quality
- Fixing literal translations from English
- Adapting tone to Vietnamese culture
- Optimizing for Vietnam social media norms

**Key outputs**:
- Vietnamese naturalness score
- Unnatural phrase corrections
- Cultural fit assessment
- Fully revised version in natural Vietnamese

**Example usage**:
```bash
@vietnamese-language-specialist "Review this product description - does it sound natural in Vietnamese or like a translation?"
```

---

### 4. 📊 **market-research-analyst**
**Purpose**: Vietnam market research for accurate pricing and competitive intelligence

**Use when**:
- Researching product prices in Vietnam market
- Identifying real competitors for comparison
- Validating market data accuracy
- Understanding Vietnam consumer preferences

**Key outputs**:
- Current Vietnam pricing (multi-platform)
- Competitive analysis (top 3-5 competitors)
- Comparison table ready for review
- Vietnam market context and recommendations

**Example usage**:
```bash
@market-research-analyst "Research current Vietnam market prices and competitors for iPhone 15 Pro Max 256GB"
```

---

### 5. 📋 **comparison-table-architect**
**Purpose**: Creates detailed, accurate product comparison tables

**Use when**:
- Designing comparison tables for reviews
- Selecting appropriate comparison criteria
- Ensuring competitive data accuracy
- Creating mobile-friendly table layouts

**Key outputs**:
- Formatted comparison table (markdown)
- Competitor selection rationale
- Key insights from comparison
- Data source documentation

**Example usage**:
```bash
@comparison-table-architect "Create a comparison table for iPhone 15 Pro Max vs Samsung S24 Ultra, iPhone 15 Plus, Xiaomi 14 Pro"
```

---

### 6. 🎨 **advanced-prompt-engineer**
**Purpose**: Optimizes AI prompts for maximum quality Vietnamese review output

**Use when**:
- Creating new review generation prompts
- Optimizing existing prompts that produce poor output
- Debugging AI output quality issues
- Tuning prompts for different AI providers (Gemini, GPT, Claude)

**Key outputs**:
- Optimized prompt with 10-element framework
- Prompt A/B test results
- Provider-specific optimizations
- Version-controlled prompt templates

**Example usage**:
```bash
@advanced-prompt-engineer "Optimize the video analysis prompt to prevent generic marketing language in outputs"
```

---

## 🔄 Agent Collaboration Workflow

These agents work together in a pipeline:

```
1. video-content-analyst
   ↓ (Extracts insights from video)

2. market-research-analyst
   ↓ (Adds competitive data)

3. comparison-table-architect
   ↓ (Creates comparison section)

4. advanced-prompt-engineer
   ↓ (Generates review with optimized prompt)

5. vietnamese-language-specialist
   ↓ (Refines Vietnamese language)

6. content-authenticity-validator
   ↓ (Final quality check)

✅ PUBLISH-READY REVIEW
```

**Example multi-agent workflow**:
```bash
# Step 1: Analyze video
@video-content-analyst "Extract insights from iPhone 15 Pro Max review video"

# Step 2: Research market
@market-research-analyst "Get Vietnam market data for iPhone 15 Pro Max"

# Step 3: Create comparison
@comparison-table-architect "Build comparison table using extracted data"

# Step 4: Generate review
@advanced-prompt-engineer "Create optimized prompt for Facebook review generation"

# Step 5: Validate output
@content-authenticity-validator "Check final review for authenticity"

# Step 6: Polish Vietnamese
@vietnamese-language-specialist "Final Vietnamese language review"
```

---

## 📚 Other Specialized Agents

### Development & Code Quality
- **code-reviewer**: Code review, security, performance analysis
- **fullstack-developer**: End-to-end feature development
- **architect-reviewer**: Architecture design and patterns

### Frontend Specialists
- **css-pro**: CSS master (layouts, responsive, animations)
- **html-pro**: HTML semantic structure
- **jquery-pro**: jQuery legacy support
- **ui-designer**: Visual design & UX

### Backend & Infrastructure
- **database-optimizer**: Elasticsearch expert (cluster, queries, indexing)
- **api-designer**: GraphQL API design and optimization

### Research & Analysis
- **research-analyst**: Data analysis, requirements, reporting
- **ux-researcher**: User research and usability testing

### Framework Specialists
- **actix-pro**: Rust Actix web framework
- **ai-engineer**: Go Gin web framework

---

## 🎯 Usage Guidelines

### When to Use AI & Research Agents

**DO use these agents for**:
✅ Improving review content quality
✅ Ensuring authentic Vietnamese language
✅ Validating market data accuracy
✅ Creating detailed comparison tables
✅ Optimizing AI prompts for better output
✅ Fact-checking review claims

**DON'T use these agents for**:
❌ Code debugging (use code-reviewer instead)
❌ Database queries (use database-optimizer)
❌ UI/CSS issues (use css-pro/ui-designer)
❌ Quick translations (they do deep analysis, not just translation)

### Best Practices

1. **Start with video-content-analyst** - Get clean insights first
2. **Use market-research-analyst early** - Accurate data prevents rework
3. **Always validate with content-authenticity-validator** - Quality gate
4. **Polish with vietnamese-language-specialist** - Final touch
5. **Iterate prompts with advanced-prompt-engineer** - Continuous improvement

### Agent Model Configuration

Most AI & Research agents use **claude-sonnet-4-20250514** for:
- Superior Vietnamese language understanding
- Better context retention for long transcripts
- More authentic content generation
- Consistent quality across outputs

---

## 📝 Agent Documentation Structure

Each agent markdown file contains:

1. **Metadata** (YAML frontmatter)
   - `name`: Agent identifier
   - `description`: One-line purpose
   - `model`: Preferred AI model (optional)

2. **Focus Areas** - Core expertise and responsibilities

3. **Approach** - Step-by-step methodology (Phase 1, 2, 3...)

4. **Quality Checklist** - Validation criteria for outputs

5. **Output Format** - Templates and examples

6. **Techniques/Best Practices** - Specific methods and tips

7. **Examples** - Real-world usage scenarios

8. **Collaboration** - Which agents to use together

---

## 🔧 Contributing New Agents

To add a new agent:

1. Create `agent-name.md` in this directory
2. Follow the template structure (see existing agents)
3. Define clear **Focus Areas** and **Approach**
4. Provide concrete **Examples** (good vs bad)
5. Document **Collaboration** with other agents
6. Update this README with new agent details

**Template**:
```markdown
---
name: agent-name
description: Brief one-line description
model: claude-sonnet-4-20250514
---

## Focus Areas
- Area 1
- Area 2

## Approach
**Phase 1**: ...
**Phase 2**: ...

## Quality Checklist
- [ ] Check 1
- [ ] Check 2

## Output
[Template or examples]

## Best Practices
1. Practice 1
2. Practice 2

## Collaboration
Works best with: agent-a, agent-b
```

---

## 📊 Agent Performance Metrics

Track these metrics to improve agents over time:

**Content Quality Metrics**:
- Authenticity score (1-10)
- Vietnamese naturalness (1-10)
- Fact accuracy rate (%)
- User engagement (likes, comments, shares)
- Conversion rate (affiliate clicks → sales)

**Process Metrics**:
- Time to generate review (minutes)
- Revision rounds needed (count)
- Agent invocations per review (count)
- User satisfaction rating (1-5 stars)

---

## 🚀 Quick Start Examples

### Generate a Complete Review
```bash
# All-in-one command (sequential agents)
@video-content-analyst "Analyze iPhone 15 Pro Max review video" && \
@market-research-analyst "Get Vietnam prices" && \
@comparison-table-architect "Create table" && \
@content-authenticity-validator "Validate final output"
```

### Improve Existing Content
```bash
# Fix unnatural Vietnamese
@vietnamese-language-specialist "Review and fix this product description"

# Validate authenticity
@content-authenticity-validator "Check if this review sounds genuine"
```

### Research Only
```bash
# Just get market data
@market-research-analyst "iPhone 15 Pro Max Vietnam market analysis"

# Just create comparison
@comparison-table-architect "Compare iPhone 15 Pro Max vs competitors"
```

---

## 🆘 Troubleshooting

**Problem**: Agent outputs are generic/low quality
**Solution**: Use `advanced-prompt-engineer` to optimize the generation prompt

**Problem**: Vietnamese sounds unnatural (like translation)
**Solution**: Run through `vietnamese-language-specialist` for refinement

**Problem**: Can't verify facts/prices
**Solution**: Use `market-research-analyst` for accurate Vietnam market data

**Problem**: Comparison table has fake competitors
**Solution**: Use `comparison-table-architect` with real market research data

**Problem**: Review sounds like marketing copy
**Solution**: Validate with `content-authenticity-validator` and regenerate

---

## 📞 Support

For questions or issues:
1. Check agent-specific documentation in individual `.md` files
2. Review examples in each agent file
3. Test with smaller tasks first before complex workflows
4. Iterate: agents work best when used together in sequence

---

**Last Updated**: 2024-12-28
**Agent Count**: 21 total (6 AI & Research focus)
**Primary Use Case**: Authentic Vietnamese product review generation
