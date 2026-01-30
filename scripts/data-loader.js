// Data loading and processing module for Sleep Research Funding Dashboard

import {
  parseFunding,
  isSleepRelated,
  showLoading,
  showError,
} from "./utils.js";

// Default keywords fallback
const defaultKeywords = [
  "sleep",
  "fatigue",
  "overnight",
  "circadian",
  "shiftwork",
  "drowsy",
  "clock",
  "nighttime",
  "napping",
  "dream",
  "unconscious",
  "bodyclock",
  "sleepwake",
  "24hour",
  "sleepy",
  "alert",
  "shiftworker",
  "clocks",
  "insomnia",
  "cbti",
  "cbt-i",
  "apnoea",
  "osa",
  "chronotype",
  "apnea",
  "sleepiness",
  "undermattress",
  "apnoeahypopnoea",
  "vigilance",
  "asleep",
  "narcolepsy",
  "cataplexy",
];

// Application state
let sleepKeywords = [];
let allGrants = [];

// Load keywords from CSV file
export async function loadKeywords() {
  return new Promise((resolve, reject) => {
    try {
      console.log("Loading keywords from keywords.csv...");
      fetch("data/keywords.csv")
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
              // Extract keywords from the parsed data
              sleepKeywords = results.data
                .map((row) => row.Keywords)
                .filter((keyword) => keyword && keyword.trim() !== "");

              console.log(
                `Loaded ${sleepKeywords.length} keywords from keywords.csv`,
              );
              console.log("Keywords:", sleepKeywords);
              resolve(sleepKeywords);
            },
            error: function (error) {
              console.error("Error loading keywords CSV:", error);
              showError("Error loading keywords file. Using default keywords.");
              // Fallback to default keywords
              sleepKeywords = defaultKeywords;
              console.log(
                "Using default keywords:",
                sleepKeywords.length,
                "keywords",
              );
              resolve(sleepKeywords);
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching keywords CSV:", error);
          showError("Error loading keywords file. Using default keywords.");
          // Fallback to default keywords
          sleepKeywords = defaultKeywords;
          console.log(
            "Using default keywords due to error:",
            sleepKeywords.length,
            "keywords",
          );
          resolve(sleepKeywords);
        });
    } catch (error) {
      console.error("Error in loadKeywords:", error);
      // Fallback to default keywords
      sleepKeywords = defaultKeywords;
      console.log(
        "Using default keywords due to catch error:",
        sleepKeywords.length,
        "keywords",
      );
      resolve(sleepKeywords);
    }
  });
}

// Load main dataset from CSV
export async function loadGrants() {
  return new Promise((resolve, reject) => {
    try {
      console.log("Loading main dataset from dataset.csv...");
      fetch("data/dataset.csv")
        .then((response) => response.text())
        .then((csvText) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
              console.log(`Loaded ${results.data.length} grant records`);
              resolve(results.data);
            },
            error: function (error) {
              console.error("CSV parsing error:", error);
              showError("Error loading data. Please check the console.");
              reject(error);
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching dataset CSV:", error);
          showError(
            "Error loading data file. Make sure dataset.csv is in the same folder.",
          );
          reject(error);
        });
    } catch (error) {
      console.error("Error in loadGrants:", error);
      showError("Unexpected error loading data.");
      reject(error);
    }
  });
}

// Process raw data and classify grants
export function processGrantsData(rawData) {
  // Process and enhance data
  allGrants = rawData
    .filter((row) => row.ID && row.Funding_body) // Filter out empty rows
    .map((row) => ({
      id: row.ID || "",
      fundingBody: row.Funding_body || "",
      scheme: row.Scheme || "",
      organisation: row.Organisation || "",
      investigators: row.Investigators || "",
      date: row.Date || "",
      funding: parseFunding(row.Funding),
      summary: row.Summary || "",
      isSleep: false, // Will be set by classifyGrantsAsSleep
    }));

  console.log(`Processed ${allGrants.length} grants`);
  return allGrants;
}

// Classify grants as sleep research based on current keywords
export function classifyGrantsAsSleep(grants) {
  return grants.map((grant) => ({
    ...grant,
    isSleep: isSleepRelated(grant.summary, sleepKeywords),
  }));
}

// Get all grants
export function getAllGrants() {
  return allGrants;
}

// Get sleep keywords
export function getSleepKeywords() {
  return sleepKeywords;
}

// Update sleep keywords and reclassify grants
export function updateSleepKeywords(newKeywords) {
  sleepKeywords = [...newKeywords];

  // Reclassify all grants with new keywords
  allGrants = allGrants.map((grant) => ({
    ...grant,
    isSleep: isSleepRelated(grant.summary, sleepKeywords),
  }));

  console.log(`Updated keywords to ${sleepKeywords.length} keywords`);
  return sleepKeywords;
}

// Get default keywords
export function getDefaultKeywords() {
  return defaultKeywords;
}
