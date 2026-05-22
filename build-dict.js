import fs from 'fs';

const DAILY_WORDS = ["WET", "RAIN", "FLUID", "STREAM", "CURRENT"];
const URL = 'https://norvig.com/ngrams/enable1.txt';

// This targets your exact project folder explicitly
const OUT_PATH = './src/dictionary.js';

async function buildDictionary() {
  try {
    console.log("⏳ Fetching dictionary from Norvig...");
    const response = await fetch(URL);
    const text = await response.text();

    console.log("⚙️ Processing and filtering words...");
    const allWords = text.split('\n').map(w => w.trim().toUpperCase());
    const filtered = allWords.filter(w => w.length >= 3 && w.length <= 7);

    const finalSet = new Set([...filtered, ...DAILY_WORDS]);
    const finalArray = Array.from(finalSet);

    console.log(`✅ Found ${finalArray.length} valid words!`);

    const fileContent = `// Auto-generated Master Dictionary (${finalArray.length} words)
export const VALID_WORDS = ${JSON.stringify(finalArray, null, 2)};
`;

    fs.writeFileSync(OUT_PATH, fileContent);
    console.log("🎉 Success! Wrote massive dictionary directly to ./src/dictionary.js");
    
  } catch (error) {
    console.error("❌ Error building dictionary:", error);
  }
}

buildDictionary();