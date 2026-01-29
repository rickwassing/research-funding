# ASA Sleep Research Funding Dashboard

An interactive web application for analyzing Australian government research funding, specifically focused on understanding sleep research funding compared to other research areas.

**Purpose:** To help the Australasian Sleep Association Research Committee analyze funding patterns, identify trends, and advocate for sleep research funding.

**Target Audience:** Academics, clinicians, and committee members interested in sleep research funding analysis.

## 🚀 Quick Start

1. **Open the dashboard locally:** Follow the local development instructions below
2. **Wait for data to load:** The dashboard will automatically load 6,437 grant records (takes ~5-10 seconds)
3. **Start exploring:** Use filters and view statistics

**Note:** GitHub Pages deployment is planned (see Plan 03). Once deployed, the dashboard will be available at `https://rickwassing.github.io/research-funding/`.

**For local development:**

```bash
# Navigate to the project folder
cd /path/to/funding-analysis

# Start a local server (runs in background)
python -m http.server 8080

# Navigate to http://localhost:8080 in your favorite browser

# When done, kill the server
lsof -ti:8080 | xargs kill -9
```

## 📊 What This Dashboard Does

This dashboard analyzes funding data from three Australian government agencies:

- **ARC** (Australian Research Council)
- **NHMRC** (National Health and Medical Research Council)
- **MRFF** (Medical Research Future Fund)

It answers key questions:

- How much funding goes to sleep research compared to the total amount of funding?
- Which organizations receive the most sleep research funding?
- What are the most common funding schemes for sleep research?
- How does sleep research funding compare across agencies?

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

## 🖥️ How to Use

### 1. Loading the Dashboard

When you first open the dashboard, you'll see a loading screen while the 6,437 grant records are loaded. This typically takes a few seconds. Once loaded, the dashboard will display key statistics and charts.

### 2. Understanding the Dashboard Layout

The dashboard has three main sections:

**Left Sidebar (Filters)**

- Funding body selector (ARC, NHMRC, MRFF)
- Organization selector
- Scheme selector
- Investigator search
- Grant type filter (sleep/other/all)
- Reset filters button

**Main Content Area**

- **Top:** Keyword management section
- **Middle:** KPI cards showing funding statistics
- **Below:** Interactive charts
- **Bottom:** Detailed grant table

**Keyword Management**

- View current sleep research keywords
- Add new keywords with the input field
- Remove keywords by clicking the × button
- Restore default keywords or remove all

### 3. Using Filters

1. **Select a funding body** to focus on ARC, NHMRC, or MRFF grants
2. **Choose an organization** to see grants from specific universities/institutions
3. **Pick a scheme** to analyze specific funding programs
4. **Search investigators** by name to find specific researchers
5. **Toggle grant type** to show only sleep research, non-sleep, or all grants
6. **Click "Reset Filters"** to return to the full dataset

### 4. Managing Sleep Research Keywords

Grants are classified as "sleep research" based on keyword matching in their summaries.

**To add a keyword:**

1. Type the keyword in the "Add new keyword..." field
2. Click "Add" or press Enter
3. The dashboard will immediately reclassify all grants

**To remove a keyword:**

1. Click the × button on any keyword chip
2. The classification will update automatically

**To restore defaults:**

1. Click "Restore Defaults" to return to the original keyword list
2. Click "Remove All" to clear all keywords (grants will show as non-sleep)

### 5. Interpreting Charts and Statistics

**KPI Cards (Top Section)**

- **Sleep Research Funding:** Total funding for sleep-related grants
- **% of Total Funding:** Percentage of total funding allocated to sleep research
- **Sleep Research Grants:** Number of sleep-related grants
- **Avg Grant (Sleep):** Average funding amount for sleep research grants
- **Total Funding:** Overall funding across all grants
- **Total Grants:** Total number of grants
- **Avg Grant (All):** Average funding across all grants
- **Filtered Grants:** Number of grants matching current filters

**Charts (Middle Section)**

- **Funding by Agency:** Shows distribution across ARC, NHMRC, MRFF
- **Sleep vs Other Funding:** Compares sleep research to other research areas
- Use the toggle buttons to switch between chart types (bar/pie/donut)

**Top Tables (Below Charts)**

- **Top 10 Organizations:** Shows which institutions receive the most sleep research funding
- **Top 10 Schemes:** Shows which funding programs support the most sleep research

### 6. Viewing Grant Details

1. Scroll to the bottom of the dashboard to see the detailed grant table
2. Click the "View Details" button on any grant row
3. A modal will open showing:
   - Complete grant summary (150-250 words)
   - Full investigator list
   - All grant metadata
   - Classification (sleep/other)

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
- Data is static (not live/updated)

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

### File Structure

```
funding-analysis/
├── index.html          # Main dashboard page
├── app.js             # Application logic (1,000+ lines)
├── dataset.csv        # 6,437 grant records (4.6MB)
├── keywords.csv       # Sleep-related keywords for classification
├── README.md          # This documentation
└── archive/           # Historical files and backups
```

## ❓ Frequently Asked Questions

**Q: How are grants classified as "sleep research"?**
A: Grants are classified based on keyword matching in their summaries. The default keyword list includes terms like "sleep", "circadian", "insomnia", "apnoea", "narcolepsy", "restless legs", etc. The matching is case-insensitive and uses word boundaries.

**Q: Can I add my own keywords?**
A: Yes! Use the keyword management section to add, remove, or restore keywords. Keywords are saved in your browser's local storage.

**Q: Why doesn't a grant show up as sleep research when it should?**
A: The classification depends on exact keyword matching in the summary. Some grants may discuss sleep-related topics without using specific keywords. You can add relevant keywords to capture these grants.

**Q: Is the data up to date?**
A: The dataset includes grants from 2020-2026 and is static for this analysis. It represents a snapshot of funding data at the time of collection.

**Q: Can I export the data?**
A: While not built-in, you can copy data from the table or view the source CSV files. The dataset.csv file contains all raw data.

**Q: Why is the loading time so long?**
A: The dashboard loads 6,437 grant records (4.6MB CSV file) and processes them in your browser. This ensures all filtering and analysis happens locally without server calls.

**Q: Can I use this on mobile/tablet?**
A: The dashboard is optimized for desktop use. While it may work on tablets, the experience is best on larger screens.

## 📝 Data Sources and Methodology

### Data Collection

- Publicly available grant data from ARC, NHMRC, and MRFF websites
- Data cleaned and standardized for consistency

### Keyword Development

- Initial keywords developed by sleep research experts
- Refined through iterative testing with sample data
- Focus on specificity to minimize false positives
- Regular expressions ensure word boundary matching

### Analysis Methodology

- Percentages calculated relative to filtered dataset
- Averages computed on grant-level data
- Charts update in real-time as filters change
- Statistics recalculate dynamically

### Default Keywords

The default keyword list (from `keywords.csv`) includes:

**sleep, fatigue, overnight, circadian, shiftwork, drowsy, clock, nighttime, napping, dream, unconscious, bodyclock, sleepwake, 24hour, sleepy, alert, shiftworker, clocks, insomnia, cbti, cbt-i, apnoea, osa, chronotype, apnea, sleepiness, undermattress, apnoeahypopnoea, vigilance, asleep, narcolepsy, cataplexy**

These keywords are case-insensitive and match word boundaries in grant summaries.

## 🤝 Contributing & Feedback

### Reporting Issues

- **Technical issues:** Create an issue on [GitHub Issues](https://github.com/rickwassing/research-funding/issues)
- **Data concerns:** Contact the Australasian Sleep Association Research Committee
- **Feature requests:** Start a discussion on [GitHub Discussions](https://github.com/rickwassing/research-funding/discussions)

### Feedback

We welcome feedback from users, especially:

- Additional keywords for sleep research classification
- Suggestions for improved visualizations
- Ideas for additional analyses
- Usability improvements for academic/clinician users

## 📄 License & Attribution

### Data

- **Government grant data:** Public domain (ARC, NHMRC, MRFF)
- **Derived analyses:** CC BY 4.0

---

_Australasian Sleep Association Research Committee_
