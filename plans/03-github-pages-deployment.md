# Plan 03: GitHub Pages Deployment

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
- `README.md` - Basic documentation

## Task Overview

Deploy the application publicly using GitHub Pages, making it accessible to anyone with an internet connection. GitHub Pages provides free hosting for static websites directly from a GitHub repository.

## Detailed Steps

### Step 1: Verify Repository Setup

**Prerequisite:** Git repository must be initialized and pushed to GitHub (see Plan 01).

**Actions:**

1. Check repository exists at `https://github.com/rickwassing/research-funding`
2. Verify all files are present in the repository
3. Ensure repository is public (required for GitHub Pages)

**Commands:**

```bash
git status
git remote -v
```

**Acceptance Criteria:**

- Repository exists and is accessible
- All project files are committed and pushed
- Repository is public

### Step 2: Configure GitHub Pages Settings

**Action:** Configure GitHub Pages through GitHub web interface.

**Steps:**

1. Navigate to `https://github.com/rickwassing/research-funding`
2. Click on "Settings" tab
3. Scroll down to "Pages" section in left sidebar
4. Under "Source", select "Deploy from a branch"
5. Under "Branch", select "main" branch and "/ (root)" folder
6. Click "Save"

**Alternative:** Use GitHub CLI if preferred:

```bash
gh repo view rickwassing/research-funding --web
# Then configure through web interface
```

**Acceptance Criteria:**

- GitHub Pages enabled for repository
- Source set to main branch, root folder
- Settings saved successfully

### Step 3: Test Local Build

**Action:** Verify the app works correctly as a static site.

**Steps:**

1. Run local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` in browser
3. Test all functionality:
   - Data loads correctly
   - Filters work
   - Charts render
   - Keyword management works
   - No console errors

**Acceptance Criteria:**

- App loads without errors locally
- All features functional
- No broken resource links

### Step 4: Fix Absolute Paths (If Needed)

**Action:** Ensure all resource paths work correctly on GitHub Pages.

**Check these paths in `index.html`:**

```html
<!-- Current CDN paths are fine -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>

<!-- Local file paths should be relative -->
<script src="app.js"></script>
<!-- This is already correct -->
```

**Check CSV file loading in `app.js`:**

```javascript
// Current implementation uses relative paths
fetch("dataset.csv");
fetch("keywords.csv");
// These should work on GitHub Pages
```

**Acceptance Criteria:**

- All local file references use relative paths
- CDN URLs are correct and accessible
- No absolute paths that would break on GitHub Pages

### Step 5: Add CNAME File (Optional)

**Action:** If using custom domain, add CNAME file.

**File:** `CNAME`
**Content:**

```
sleepfunding.asa.org.au
```

(Replace with actual domain if applicable)

**Note:** Only if custom domain is being used. Otherwise skip.

**Acceptance Criteria:**

- CNAME file created if needed
- Domain correctly specified

### Step 6: Create GitHub Actions Workflow (Optional but Recommended)

**Action:** Create CI/CD workflow to automate deployment and add build steps if needed.

**File:** `.github/workflows/deploy.yml`
**Content:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "."

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Acceptance Criteria:**

- Workflow file created
- Syntax valid
- Triggers on push to main branch

### Step 7: Trigger Initial Deployment

**Action:** Make a commit to trigger GitHub Pages build.

**Commands:**

```bash
# Make a small change to trigger deployment
echo "# Trigger GitHub Pages deployment" >> DEPLOYMENT.md
git add DEPLOYMENT.md
git commit -m "chore: Trigger GitHub Pages deployment"
git push origin main
```

**Alternative:** Wait for GitHub Pages to auto-detect and deploy.

**Acceptance Criteria:**

- New commit pushed to repository
- GitHub Pages build triggered

### Step 8: Monitor Deployment

**Action:** Check deployment status and verify site is live.

**Steps:**

1. Go to repository Settings > Pages
2. Check deployment status (should show "Your site is published at...")
3. Wait for build to complete (usually 1-2 minutes)
4. Visit the published URL (typically `https://rickwassing.github.io/research-funding`)

**Commands to check:**

```bash
# Check GitHub Pages status via API (if GitHub CLI installed)
gh api repos/rickwassing/research-funding/pages
```

**Acceptance Criteria:**

- GitHub Pages shows "Published" status
- Site accessible at public URL
- No build errors reported

### Step 9: Test Deployed Application

**Action:** Thoroughly test the deployed application.

**Test Checklist:**

- [ ] Load application at public URL
- [ ] Verify data loads (check console for errors)
- [ ] Test all filters:
  - Funding body filter
  - Organization filter
  - Scheme filter
  - Investigator search
  - Sleep/other/all toggle
- [ ] Test keyword management:
  - Add new keyword
  - Remove keyword
  - Restore defaults
- [ ] Verify charts render correctly
- [ ] Test data table:
  - Sorting
  - Pagination
  - View details modal
- [ ] Check responsive design (if needed)
- [ ] Verify no mixed content warnings (HTTP/HTTPS)

**Acceptance Criteria:**

- All functionality works on deployed site
- No JavaScript errors in console
- Performance acceptable (data loads within reasonable time)

### Step 10: Update README with Live URL

**Action:** Update README.md with the actual deployed URL.

**Edit README.md:**

```markdown
## 🚀 Quick Start

1. **Open the dashboard:** Visit https://rickwassing.github.io/research-funding
2. **Wait for data to load:** The dashboard will automatically load 6,437 grant records
3. **Start exploring:** Use filters and view statistics
```

**Acceptance Criteria:**

- README updated with correct URL
- All references to localhost replaced with production URL

### Step 11: Set Up Custom Domain (Optional)

**Action:** If using custom domain, configure DNS settings.

**Steps:**

1. Add A records in DNS pointing to GitHub Pages IPs:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
2. Or add CNAME record pointing to `rickwassing.github.io`
3. Wait for DNS propagation (up to 48 hours)
4. Verify in GitHub Pages settings

**Acceptance Criteria:**

- Custom domain configured if desired
- SSL certificate automatically provisioned

## Verification Checklist

- [ ] Git repository properly set up and public
- [ ] GitHub Pages enabled in repository settings
- [ ] All resource paths work correctly for static hosting
- [ ] Local build tested and functional
- [ ] GitHub Actions workflow created (optional)
- [ ] Initial deployment triggered
- [ ] Deployment status shows "Published"
- [ ] Site accessible at public URL
- [ ] All functionality tested on deployed site
- [ ] README updated with live URL
- [ ] Custom domain configured (if applicable)

## Troubleshooting Guide

### Common Issues and Solutions:

1. **"404 Not Found" on GitHub Pages**
   - Ensure `index.html` is in root directory
   - Check repository is public
   - Verify GitHub Pages is enabled for main branch

2. **Mixed Content Warnings**
   - Ensure all CDN URLs use HTTPS
   - Check for hardcoded HTTP URLs

3. **CSV Files Not Loading**
   - Verify CSV files are in repository
   - Check browser console for CORS errors
   - Ensure fetch URLs are relative (not absolute)

4. **Slow Loading Times**
   - 4.6MB CSV may take time to download
   - Consider gzip compression (GitHub Pages does this automatically)
   - Add loading indicator (already present)

5. **Charts Not Rendering**
   - Check Chart.js CDN URL
   - Verify no JavaScript errors
   - Check browser console for errors

6. **GitHub Pages Build Failing**
   - Check repository size limits (soft limit 1GB)
   - Verify no unsupported file types
   - Check GitHub Pages build logs

## Notes

- GitHub Pages has a 1GB repository size limit (soft)
- Builds are automatically triggered on push to main branch
- Custom domains get free SSL certificates
- The 4.6MB dataset.csv is large but within acceptable limits
- Consider adding a `robots.txt` file if needed for search engines
- GitHub Pages cache can be cleared by pushing a new commit
- For better performance, consider compressing CSV or implementing lazy loading (future optimization)
