# Plan 02: Comprehensive README Documentation

## App Context

The ASA Sleep Research Funding Dashboard is a web application that analyzes Australian government research funding data from three main agencies (ARC, NHMRC, MRFF). It allows users to:

- Load and analyze 6,437 grant records from a CSV file
- Classify grants as "sleep research" based on keyword matching in summaries
- View funding statistics, charts, and detailed grant information
- Filter data by funding body, organization, scheme, and investigators
- Dynamically manage sleep research keywords

The app is currently a static web application with:

- `index.html` - Main dashboard page
- `app.js` - Application logic (1,000+ lines)
- `dataset.csv` - 6,437 grant records (4.6MB)
- `keywords.csv` - Sleep-related keywords for classification
- `README.md` - Basic documentation (needs expansion)

## Task Overview

Create a comprehensive, user-friendly README.md file that explains the app to general users, particularly members of the Australasian Sleep Association Research Committee (academics and clinicians). The README should be clear, concise, and provide all necessary information for using the dashboard effectively.

## Detailed Steps

### Step 1: Analyze Current README and User Needs

**Action:** Review current README.md and identify gaps for target audience (academics/clinicians).

**Acceptance Criteria:**

- List of missing sections identified
- Understanding of user needs documented

### Step 2: Create README Structure Outline

**File:** `README.md` (new structure)
**Content Outline:**

```markdown
# ASA Sleep Research Funding Dashboard

[Brief overview with purpose and target audience]

## 🚀 Quick Start

[Simplest way to get running]

## 📊 What This Dashboard Does

[Clear explanation of functionality]

## 🎯 Key Features

[Bulleted list of main features]

## 🖥️ How to Use

[Step-by-step guide with screenshots]

### 1. Loading the Dashboard

### 2. Understanding the Dashboard Layout

### 3. Using Filters

### 4. Managing Sleep Research Keywords

### 5. Interpreting Charts and Statistics

### 6. Viewing Grant Details

## 📈 Understanding the Data

[Explanation of data sources and limitations]

## 🔧 Technical Details

[For technically inclined users]

## ❓ Frequently Asked Questions

[Common questions and answers]

## 📝 Data Sources and Methodology

[Detailed data information]

## 🤝 Contributing & Feedback

[How to report issues or suggest improvements]

## 📄 License & Attribution

[License information]
```

**Acceptance Criteria:**

- Clear structure defined
- All necessary sections included

### Step 3: Write Comprehensive Content

**Action:** Write detailed content for each section with appropriate formatting.

**Key Sections to Include:**

#### 1. Title and Overview

```markdown
# ASA Sleep Research Funding Dashboard

An interactive web application for analyzing Australian government research funding, specifically focused on understanding sleep research funding compared to other research areas.

**Purpose:** To help the Australasian Sleep Association Research Committee analyze funding patterns, identify trends, and advocate for sleep research funding.

**Target Audience:** Academics, clinicians, and committee members interested in sleep research funding analysis.
```

#### 2. Quick Start

````markdown
## 🚀 Quick Start

1. **Open the dashboard:** Visit [GitHub Pages URL] (once deployed)
2. **Wait for data to load:** The dashboard will automatically load 6,437 grant records
3. **Start exploring:** Use filters and view statistics

**For local development:**

```bash
# Run a local server
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```
````

````

#### 3. What This Dashboard Does
```markdown
## 📊 What This Dashboard Does

This dashboard analyzes funding data from three Australian government agencies:
- **ARC** (Australian Research Council)
- **NHMRC** (National Health and Medical Research Council)
- **MRFF** (Medical Research Future Fund)

It answers key questions:
- How much funding goes to sleep research compared to other areas?
- Which organizations receive the most sleep research funding?
- What are the most common funding schemes for sleep research?
- How does sleep research funding compare across agencies?
````

#### 4. Key Features (with screenshots)

```markdown
## 🎯 Key Features

### 🔍 Interactive Filtering

- Filter by funding body (ARC, NHMRC, MRFF)
- Filter by organization/university
- Filter by funding scheme
- Search by investigator names
- Toggle between sleep/non-sleep/all grants

### 📈 Real-time Statistics

- Total funding amounts
- Percentage of funding for sleep research
- Number of grants
- Average grant sizes

### 📊 Visualizations

- Funding by agency (bar/pie charts)
- Sleep vs. other funding (donut/bar charts)
- Top 10 organizations for sleep research
- Top 10 schemes for sleep research

### 🔑 Dynamic Keyword Management

- Add/remove sleep-related keywords
- Restore default keyword set
- Real-time reclassification of grants

### 📋 Detailed Grant Table

- Sortable table of all grants
- View detailed grant information
- Export-ready data display
```

#### 5. Step-by-Step Usage Guide

**Include screenshots for each step (describe where to take screenshots)**

#### 6. Data Understanding

```markdown
## 📈 Understanding the Data

### Data Sources

- **ARC:** Discovery Projects, Linkage Projects, etc.
- **NHMRC:** Project Grants, Investigator Grants, etc.
- **MRFF:** Various medical research initiatives

### Time Period

- Data covers grants from 2020-2026
- 6,437 successfully funded grants

### Data Fields

- **ID:** Unique grant identifier
- **Funding Body:** ARC, NHMRC, or MRFF
- **Scheme:** Specific funding program
- **Organisation:** Awarded institution
- **Investigators:** Principal and co-investigators
- **Date:** Award date
- **Funding:** Amount in AUD
- **Summary:** ~150-250 word grant summary

### Limitations

- Only includes successfully funded grants
- Summaries may not capture all research aspects
- Keyword matching has inherent limitations
```

#### 7. Technical Details

```markdown
## 🔧 Technical Details

### Architecture

- Static web application (HTML/CSS/JavaScript)
- No server-side processing required
- All data processed client-side

### Technologies Used

- **Chart.js** for data visualization
- **Bootstrap 5** for responsive design
- **DataTables** for interactive tables
- **PapaParse** for CSV parsing
- **jQuery** for DOM manipulation

### Performance Considerations

- 6,437 records loaded in browser memory
- Optimized for modern desktop browsers
- No mobile/tablet support required

### Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
```

#### 8. FAQ

```markdown
## ❓ Frequently Asked Questions

**Q: How are grants classified as "sleep research"?**
A: Grants are classified based on keyword matching in their summaries. The default keyword list includes terms like "sleep", "circadian", "insomnia", "apnoea", etc.

**Q: Can I add my own keywords?**
A: Yes! Use the keyword management section to add, remove, or restore keywords.

**Q: Why doesn't a grant show up as sleep research when it should?**
A: The classification depends on exact keyword matching in the summary. Some grants may discuss sleep-related topics without using specific keywords.

**Q: Is the data up to date?**
A: The dataset includes grants from 2020-2026 and is static for this analysis.

**Q: Can I export the data?**
A: While not built-in, you can copy data from the table or view the source CSV files.
```

#### 9. Data Methodology

```markdown
## 📝 Data Sources and Methodology

### Data Collection

- Publicly available grant data from ARC, NHMRC, and MRFF
- Data cleaned and standardized for consistency
- Personal identifiers removed where possible

### Keyword Development

- Initial keywords developed by sleep research experts
- Refined through iterative testing
- Focus on specificity to minimize false positives

### Analysis Methodology

- Funding amounts converted to consistent AUD format
- Percentages calculated relative to filtered dataset
- Averages computed on grant-level data
```

#### 10. Contributing

```markdown
## 🤝 Contributing & Feedback

### Reporting Issues

- Technical issues: GitHub Issues
- Data concerns: Contact research committee
- Feature requests: GitHub Discussions

### Feedback

We welcome feedback from users, especially:

- Additional keywords for sleep research classification
- Suggestions for improved visualizations
- Ideas for additional analyses
```

#### 11. License

```markdown
## 📄 License & Attribution

### Data

- Government grant data: Public domain
- Derived analyses: CC BY 4.0

### Code

- MIT License

### Attribution

Please cite:

- Australasian Sleep Association Research Committee
- Original data sources (ARC, NHMRC, MRFF)
```

**Acceptance Criteria:**

- All sections written with clear, concise language
- Technical accuracy maintained
- Appropriate formatting used
- Target audience needs addressed

### Step 4: Add Screenshot Instructions

**Action:** Create instructions for capturing and including screenshots.

**Content:**

```markdown
## Screenshots Needed

1. **Dashboard Overview** - Full dashboard view
2. **Keyword Management** - Keyword chips section
3. **Filter Panel** - Sidebar with filters
4. **Charts** - Agency and sleep vs. other charts
5. **Top Tables** - Organizations and schemes tables
6. **Grant Details Modal** - Detailed view popup

**Instructions for taking screenshots:**

1. Open the dashboard in a browser
2. Set browser to 1920x1080 resolution
3. Capture full sections without browser UI
4. Save as PNG with descriptive names
5. Add to `screenshots/` folder
6. Reference in README with `![Alt text](screenshots/filename.png)`
```

**Acceptance Criteria:**

- Clear screenshot requirements defined
- Folder structure specified

### Step 5: Format and Polish

**Action:** Apply final formatting, check links, ensure consistency.

**Acceptance Criteria:**

- Markdown formatting correct
- No broken links or references
- Consistent tone and style
- Proper heading hierarchy

### Step 6: Test README Rendering

**Action:** Preview README in GitHub/Markdown viewer.

**Acceptance Criteria:**

- Renders correctly on GitHub
- Images display properly
- Links work correctly
- Readable on both desktop and mobile

## Verification Checklist

- [ ] Current README analyzed and gaps identified
- [ ] Comprehensive structure outline created
- [ ] All sections written with appropriate content
- [ ] Screenshot requirements documented
- [ ] Formatting polished and consistent
- [ ] README renders correctly on GitHub
- [ ] Language appropriate for target audience (academics/clinicians)
- [ ] Technical details accurate and complete
- [ ] Usage instructions clear and actionable

## Notes

- The README should balance technical details with user-friendly explanations
- Screenshots are essential for user guidance but can be added later if needed
- Keep academic audience in mind - precise but not overly technical
- Include both "quick start" for impatient users and detailed sections for thorough understanding
- Reference the deployed URL once GitHub Pages is set up (update after deployment)
