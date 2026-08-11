exports.analyzeReportTrust = (title, description, category, hasImage) => {
  let score = 100;
  const flags = [];

  if (!title || !description) return { trustScore: 0, fraudFlags: ["Missing core details."] };

  // 1. High value category with no image
  if (['Electronics', 'Jewellery', 'Wallets'].includes(category) && !hasImage) {
    score -= 20;
    flags.push("High-value item reported without a photo.");
  }

  // 2. Vague description
  if (description.length < 25) {
    score -= 30;
    flags.push("Extremely short/vague description.");
  }

  // 3. Generic titles without specifics
  const genericWords = ['phone', 'laptop', 'wallet', 'keys', 'bag', 'watch', 'airpods'];
  const titleLower = title.toLowerCase().trim();
  
  if (genericWords.some(word => titleLower === word)) {
    score -= 20;
    flags.push("Generic one-word title lacks identifying details.");
  }

  // 4. CAPS LOCK SHOUTING
  if (title === title.toUpperCase() && title.length > 5) {
    score -= 10;
    flags.push("Suspicious formatting (ALL CAPS title).");
  }

  return {
    trustScore: Math.max(score, 0),
    fraudFlags: flags
  };
};
