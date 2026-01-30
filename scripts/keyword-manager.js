// Keyword management module for Sleep Research Funding Dashboard

export function renderKeywordChips(keywords, onRemoveKeyword) {
  const container = document.getElementById("keyword-chips-container");
  container.innerHTML = "";

  keywords.forEach((keyword) => {
    const chip = document.createElement("div");
    chip.className = "keyword-chip";
    chip.innerHTML = `
      ${keyword}
      <button class="keyword-chip-remove" data-keyword="${keyword}">×</button>
    `;
    container.appendChild(chip);
  });

  // Add event listeners to remove buttons
  container.querySelectorAll(".keyword-chip-remove").forEach((button) => {
    button.addEventListener("click", function () {
      const keywordToRemove = this.getAttribute("data-keyword");
      onRemoveKeyword(keywordToRemove);
    });
  });
}

export function addKeyword(newKeyword, keywords) {
  const trimmedKeyword = newKeyword.trim().toLowerCase();

  if (!trimmedKeyword) {
    alert("Please enter a keyword");
    return false;
  }

  // Check for duplicates
  if (keywords.some((k) => k.toLowerCase() === trimmedKeyword)) {
    alert(`"${trimmedKeyword}" is already in the keyword list`);
    return false;
  }

  // Limit to 100 keywords
  if (keywords.length >= 100) {
    alert(
      "Maximum of 100 keywords reached. Please remove some keywords before adding more.",
    );
    return false;
  }

  // Add the keyword
  const updatedKeywords = [...keywords, trimmedKeyword];
  return updatedKeywords;
}

export function removeKeyword(keywordToRemove, keywords) {
  const updatedKeywords = keywords.filter((k) => k !== keywordToRemove);
  return updatedKeywords;
}

export function removeAllKeywords() {
  return [];
}

export function restoreDefaultKeywords(defaultKeywords) {
  return [...defaultKeywords];
}
