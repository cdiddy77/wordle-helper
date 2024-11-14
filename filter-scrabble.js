const fs = require("fs");
const words = fs
  .readFileSync("scrabble-dictionary.txt", "utf-8")
  .split("\n")
  .map((word) => word.trim())
  .filter((w) => w.length == 5);

// write out words to a file
fs.writeFileSync("five-letter-words.txt", words.join("\n"));
