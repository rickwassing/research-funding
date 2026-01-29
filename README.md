# ASA Sleep Research Funding Dashboard

An interactive dashboard for analysing Australian government research funding for sleep research compared to all other fields of research.

## Running Locally

```bash
# Navigate to this folder
cd /path/to/funding-analysis

# Start the server (runs in background)
python3 -m http.server 8080 & open http://localhost:8080

# When done, kill the server
lsof -ti:8080 | xargs kill -9
```

**Note:** The `&` runs the server in the background so you can immediately open the browser.

## Files

| File           | Description                                   |
| -------------- | --------------------------------------------- |
| `index.html`   | Dashboard webpage                             |
| `app.js`       | Application logic                             |
| `dataset.csv`  | Complete grant data from ARC, NHMRC, and MRFF |
| `keywords.csv` | Sleep-related keywords for classification     |

---

_Australasian Sleep Association Research Committee_
