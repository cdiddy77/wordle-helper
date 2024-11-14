const fs = require("fs");
const readline = require("readline");

function binarySearchScrabble() {
  // Read the dictionary words into an array
  const words = fs
    .readFileSync("scrabble-dictionary.txt", "utf-8")
    .split("\n")
    .map((word) => word.trim())
    .filter((w) => w.length < 7 && !w.endsWith("s"));

  let low = 0;
  let high = words.length - 1;

  // Set up a readline interface to capture user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function askUser() {
    if (low > high) {
      console.log("No more words to search.");
      rl.close();
      return;
    }

    const mid = Math.floor((low + high) / 2);
    const word = words[mid];
    console.log(`Range = ${high - low}, Current word: ${word}`);

    rl.question(
      "Type 'lo' to go lower, 'hi' to go higher, or 'exit' to stop: ",
      (answer) => {
        answer = answer.trim().toLowerCase();

        if (answer === "lo") {
          high = mid - 1;
          askUser();
        } else if (answer === "hi") {
          low = mid + 1;
          askUser();
        } else if (answer === "exit") {
          console.log("Exiting search.");
          rl.close();
        } else {
          console.log("Invalid input, please type 'lo', 'hi', or 'exit'.");
          askUser();
        }
      }
    );
  }

  askUser();
}

binarySearchScrabble();
