# Plan 01: Git Repository Setup

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

Initialize a Git repository for the project and push it to the remote GitHub repository at `https://github.com/rickwassing/research-funding.git`. This establishes version control and enables future deployment via GitHub Pages.

## Detailed Steps

### Step 1: Initialize Local Git Repository

**Command:**

```bash
git init
```

**Acceptance Criteria:**

- `.git` directory created in project root
- Git recognizes the project as a repository

### Step 2: Create .gitignore File

**File:** `.gitignore`
**Content:**

```gitignore
# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
.Python
env/
venv/
.venv/

# Build artifacts
dist/
build/
*.min.js
*.min.css

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
```

**Acceptance Criteria:**

- `.gitignore` file created with appropriate exclusions
- No unnecessary files will be committed

### Step 3: Stage All Current Files

**Command:**

```bash
git add .
```

**Acceptance Criteria:**

- All relevant files are staged for commit
- Files listed in `.gitignore` are not staged

### Step 4: Create Initial Commit

**Command:**

```bash
git commit -m "Initial commit: ASA Sleep Research Funding Dashboard

- Complete dashboard with interactive filtering
- Data visualization using Chart.js
- Keyword-based classification system
- Responsive Bootstrap design
- 6,437 grant records from ARC, NHMRC, MRFF
- Dynamic keyword management"
```

**Acceptance Criteria:**

- Commit created with descriptive message
- All files committed to local repository

### Step 5: Configure Remote Repository

**Command:**

```bash
git remote add origin https://github.com/rickwassing/research-funding.git
```

**Acceptance Criteria:**

- Remote repository configured
- `git remote -v` shows the origin URL

### Step 6: Rename Default Branch to Main

**Command:**

```bash
git branch -M main
```

**Acceptance Criteria:**

- Default branch renamed from `master` to `main`
- `git branch` shows `main` as current branch

### Step 7: Push to Remote Repository

**Command:**

```bash
git push -u origin main
```

**Acceptance Criteria:**

- Code successfully pushed to GitHub
- Repository visible at `https://github.com/rickwassing/research-funding`
- All files present in remote repository

### Step 8: Verify Push

**Command:**

```bash
git status
git log --oneline -5
```

**Acceptance Criteria:**

- `git status` shows "Your branch is up to date with 'origin/main'"
- Commit history shows the initial commit

## Verification Checklist

- [ ] Git repository initialized locally
- [ ] `.gitignore` file created and working
- [ ] All project files committed
- [ ] Remote repository configured correctly
- [ ] Code pushed to GitHub successfully
- [ ] Repository accessible via web browser

## Notes

- The `dataset.csv` file (4.6MB) will be included in the repository since it's essential data
- No sensitive data is present in the repository
- The repository is public as required for GitHub Pages deployment
- Future commits should follow conventional commit messages for clarity
