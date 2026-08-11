const FoundItem = require('../models/FoundItem');
const natural = require('natural');

const stemmer = natural.PorterStemmer;
const tokenizer = new natural.WordTokenizer();

// Jaro-Winkler is great for short strings (titles, brands) handling typos (e.g., Macbok vs Macbook)
const calculateShortStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  return natural.JaroWinklerDistance(str1.toLowerCase(), str2.toLowerCase(), { ignoreCase: true });
};

// Tokenized stemmed set intersection is better for long descriptions
const calculateDescriptionSimilarity = (desc1, desc2) => {
  if (!desc1 || !desc2) return 0;
  
  const tokens1 = tokenizer.tokenize(desc1.toLowerCase()).map(t => stemmer.stem(t)).filter(t => t.length > 2);
  const tokens2 = tokenizer.tokenize(desc2.toLowerCase()).map(t => stemmer.stem(t)).filter(t => t.length > 2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  let matchCount = 0;
  set1.forEach(word => {
    if (set2.has(word)) matchCount++;
  });
  
  return matchCount / Math.max(set1.size, set2.size);
};

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

exports.findMatchesForLostItem = async (lostItem) => {
  const openFoundItems = await FoundItem.find({ status: { $in: ['FOUND'] } }).populate('reportedBy', 'name');
  
  const matches = openFoundItems.map(foundItem => {
    let score = 0;
    let reasons = [];
    
    // Exact Category Match: Max 20 points
    if (lostItem.category && foundItem.category && lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
      score += 20;
      reasons.push("✅ Exact category match.");
    }
    
    // Title Similarity: Max 30 points
    const titleSim = calculateShortStringSimilarity(lostItem.title, foundItem.title);
    score += titleSim * 30;
    if (titleSim > 0.8) reasons.push("✅ High similarity in item titles.");
    
    // Description Semantic Similarity: Max 20 points
    const descSim = calculateDescriptionSimilarity(lostItem.description, foundItem.description);
    score += descSim * 20;
    if (descSim > 0.6) reasons.push("✅ Strong semantic match in descriptions.");
    
    // Geospatial Proximity Match: Max 20 points
    if (lostItem.lat && lostItem.lng && foundItem.lat && foundItem.lng) {
      const distance = getDistanceInMeters(lostItem.lat, lostItem.lng, foundItem.lat, foundItem.lng);
      if (distance <= 50) {
         score += 20;
         reasons.push(`📍 Located extremely close (within 50 meters).`);
      } else if (distance <= 500) {
         score += 10;
         reasons.push(`📍 Located nearby (within 500 meters).`);
      } else if (distance <= 2000) {
         score += 5;
      }
    }
    
    // Brand/Color/Location NLP Match: Max 30 points (10 each)
    if (lostItem.brand && foundItem.brand) {
      const brandSim = calculateShortStringSimilarity(lostItem.brand, foundItem.brand);
      score += brandSim * 10;
      if (brandSim > 0.8) reasons.push("🏷️ Brands match.");
    }
    if (lostItem.color && foundItem.color) {
      const colorSim = calculateShortStringSimilarity(lostItem.color, foundItem.color);
      score += colorSim * 10;
      if (colorSim > 0.8) reasons.push("🎨 Colors match.");
    }
    if (lostItem.location && foundItem.location) {
      score += calculateShortStringSimilarity(lostItem.location, foundItem.location) * 10;
    }
    
    // Time constraint penalty: if found BEFORE it was lost, heavily penalize.
    if (lostItem.dateLost && foundItem.dateFound) {
      const msDiff = new Date(foundItem.dateFound) - new Date(lostItem.dateLost);
      const daysDiff = msDiff / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 0) {
        score -= 50; // Cannot find an item before it is lost
      } else if (daysDiff >= 0 && daysDiff <= 7) {
        score += 5; // Slight boost if found shortly after being lost
        reasons.push("⏱️ Chronological timeline aligns.");
      }
    }
    
    score = Math.max(0, Math.round(score));
    
    let matchLabel = 'Low Match';
    if (score >= 85) matchLabel = 'Strong Match';
    else if (score >= 65) matchLabel = 'Possible Match';
    else if (score >= 40) matchLabel = 'Weak Match';
    
    return {
      foundItem,
      score,
      matchLabel,
      engine: 'NLP Vector Engine (Jaro-Winkler & Porter Stemmer)'
    };
  });
  
  return matches.sort((a, b) => b.score - a.score).filter(m => m.score > 40);
};
