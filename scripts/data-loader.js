// Data loading and processing module for Research Funding Analysis Dashboard

import {
  parseFunding,
  isKeywordRelated,
  showLoading,
  showError,
  parseYear,
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
let classificationKeywords = [];
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
              classificationKeywords = results.data
                .map((row) => row.Keywords)
                .filter((keyword) => keyword && keyword.trim() !== "");

              console.log(
                `Loaded ${classificationKeywords.length} keywords from keywords.csv`,
              );
              console.log("Keywords:", classificationKeywords);
              resolve(classificationKeywords);
            },
            error: function (error) {
              console.error("Error loading keywords CSV:", error);
              showError("Error loading keywords file. Using default keywords.");
              // Fallback to default keywords
              classificationKeywords = defaultKeywords;
              console.log(
                "Using default keywords:",
                classificationKeywords.length,
                "keywords",
              );
              resolve(classificationKeywords);
            },
          });
        })
        .catch((error) => {
          console.error("Error fetching keywords CSV:", error);
          showError("Error loading keywords file. Using default keywords.");
          // Fallback to default keywords
          classificationKeywords = defaultKeywords;
          console.log(
            "Using default keywords due to error:",
            classificationKeywords.length,
            "keywords",
          );
          resolve(classificationKeywords);
        });
    } catch (error) {
      console.error("Error in loadKeywords:", error);
      // Fallback to default keywords
      classificationKeywords = defaultKeywords;
      console.log(
        "Using default keywords due to catch error:",
        classificationKeywords.length,
        "keywords",
      );
      resolve(classificationKeywords);
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
      year: parseYear(row.Date), // Extract year from date
      funding: parseFunding(row.Funding),
      summary: row.Summary || "",
      // Tokenize summary once for efficient keyword matching
      tokenizedSummary: new Set(
        (row.Summary || "").toLowerCase().match(/\b[\w-]+\b/g) || [],
      ),
      isInSubset: false, // Will be set by classifyGrantsByKeywords
    }));

  console.log(`Processed ${allGrants.length} grants with tokenized summaries`);
  return allGrants;
}

// Classify grants based on current keywords
export function classifyGrantsByKeywords(grants) {
  return grants.map((grant) => ({
    ...grant,
    isInSubset: isKeywordRelated(grant.summary, classificationKeywords),
  }));
}

// Get all grants
export function getAllGrants() {
  return allGrants;
}

// Get classification keywords
export function getClassificationKeywords() {
  return classificationKeywords;
}

// Update classification keywords and reclassify grants
export function updateClassificationKeywords(newKeywords) {
  classificationKeywords = [...newKeywords];

  // Reclassify all grants with new keywords
  allGrants = allGrants.map((grant) => ({
    ...grant,
    isInSubset: isKeywordRelated(grant.summary, classificationKeywords),
  }));

  console.log(`Updated keywords to ${classificationKeywords.length} keywords`);
  return allGrants; // Return the updated grants array
}

// Get default keywords
export function getDefaultKeywords() {
  return defaultKeywords;
}
