const fs = require("fs");
const NOT_FOUND = 0;
const SOMEWHERE = 1;
const RIGHT_THERE = 2;
const LETTERS = 5;
const wordList = fs.readFileSync("word.list", "utf-8").split(/\r?\n/);
const rawState = require("./state");
function processState(rawState) {
  let notFound = "";
  let known = "_____";
  let present = "";
  let knownNot = ["", "", "", "", ""];
  // return { notFound:"lettersnotfound", known:"__S__",present:"letters present",knownNot:["","letters not at this position","","",""]}
  for (let row of rawState) {
    let index = 0;
    for (let l of row) {
      const letter = l[0];
      const status = l[1];
      if (status === NOT_FOUND) {
        if (!notFound.includes(letter)) {
          notFound = notFound + letter;
        }
      } else if (status === SOMEWHERE) {
        if (!present.includes(letter)) {
          present = present + letter;
        }
        if (!knownNot[index].includes(letter)) {
          knownNot[index] = knownNot[index] + letter;
        }
      } else if (status === RIGHT_THERE) {
        if (known.charAt(index) !== "_" && known.charAt(index) !== letter) {
          console.error(
            `known:${known} already has char ${known.charAt(
              index
            )} at ${index}, but what about ${letter}?`
          );
        }
        known = known.slice(0, index) + letter + known.slice(index + 1);
      }
      index++;
    }
  }
  return { notFound, known, present, knownNot };
}

function matchesState(word, state) {
  // const verbose = (...args) => {
  //   if (word === "mourn") {
  //     console.log(...args);
  //   }
  // };
  const verbose = (...args) => {};

  // for each letter in word
  let index = 0;
  for (let c of word) {
    // if in not found, discard
    if (
      state.notFound.includes(c) &&
      !state.known.includes(c) &&
      !state.present.includes(c)
    ) {
      verbose("not found includes", index, c);
      return false;
    }
    // if not matching known, discard
    if (state.known.charAt(index) !== "_" && state.known.charAt(index) !== c) {
      verbose("known doesnt include", index, c);
      return false;
    }
    // if not present at that location, discard
    if (state.knownNot[index].includes(c)) {
      verbose("knownnot include", index, c);
      return false;
    }

    index++;
  }
  // for each letter in present
  for (let c of state.present) {
    // if not in word, discard
    if (!word.includes(c)) {
      verbose("word not includes", c);
      return false;
    }
  }
  // could work
  return true;
}
function freqMap(wordList) {
  const result = {};
  const resultPos = [{}, {}, {}, {}, {}];
  const result2 = {};
  const result2Pos = [{}, {}, {}, {}];
  for (let word of wordList) {
    let cx = 0;
    for (let c of word) {
      result[c] = (result[c] || 0) + 1;
      resultPos[cx][c] = (resultPos[cx][c] || 0) + 1;
      cx++;
    }
    for (let i = 0; i < word.length - 1; i++) {
      const substr = word.substring(i, i + 2);
      result2[substr] = (result2[substr] || 0) + 1;
      result2Pos[i][substr] = (result2Pos[i][substr] || 0) + 1;
    }
  }
  // for every pair, add freq
  return {
    l1: result,
    l2: result2,
    resultPos,
    // p0: resultPos[0],
    // p1: resultPos[1],
    // p2: resultPos[2],
    // p3: resultPos[3],
    // p4: resultPos[4],
    result2Pos,
    cl1: Object.values(result).reduce((a, c) => a + c, 0),
    cl2: Object.values(result2).reduce((a, c) => a + c, 0),
    cp: resultPos.map((r) => Object.values(r).reduce((a, c) => a + c, 0)),
    cp2: result2Pos.map((r) => Object.values(r).reduce((a, c) => a + c, 0)),
  };
}
function withScore(word, freqMap) {
  let score = 0;
  let index = 0;
  let l2score = 0;
  let pscore = 0;

  for (let c of word) {
    if (!word.substring(0, index).includes(c)) {
      score += freqMap.l1[c] || 0;
    }
    for (let i = 0; i < word.length - 1; i++) {
      const substr = word.substring(i, i + 2);
      // l2score += freqMap.l2[substr] || 0;
      l2score += freqMap.result2Pos[i][substr] || 0;
    }
    pscore += freqMap.resultPos[index][c] || 0;
    index++;
  }
  score /= freqMap.cl1;
  pscore /= freqMap.cp.reduce((a, c) => a + c, 0);
  // l2score /= freqMap.cl2;
  l2score /= freqMap.cp2.reduce((a, c) => a + c, 0);
  return {
    word,
    score: rnd(score),
    pscore: rnd(pscore),
    l2score: rnd(l2score),
    // cscor: rnd(score + l2score),
  };
}

function rnd(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// run through list of words. filter out the words that don't match
// the criteria, build a frequency map of letters.
//

// next pass, assign a point value to each possible word based on its
// sum of letter frequencies (minus the matching letters)
//
// sort by value, output top 5
//
const state = processState(rawState);
console.log({ state });

// const words = ["toils", "aired", "yiper", "pkjgh", "pkjgi"];
const filteredWordList = wordList.filter((w) => matchesState(w, state));
const map = freqMap(filteredWordList);
console.log({ state });
const withScores = filteredWordList
  .map((w) => withScore(w, map))
  .sort((a, b) => b.score - a.score);
const withPScores = filteredWordList
  .map((w) => withScore(w, map))
  .sort((a, b) => b.pscore - a.pscore);
const withScoresl2 = filteredWordList
  .map((w) => withScore(w, map))
  .sort((a, b) => b.l2score - a.l2score);
// const withCombScores = filteredWordList
//   .map((w) => withScore(w, map))
//   .sort((a, b) => b.cscor - a.cscor);
console.log({
  wordListCount: wordList.length,
  filteredWordListCount: filteredWordList.length,
  //   filteredWordList,
  // map,
  withScoresl2: withScoresl2.slice(0, 20),
  withPScores: withPScores.slice(0, 20),
  withScores: withScores.slice(0, 20),
  // withCombScores: withCombScores.slice(0, 20),
});

// console.log({
//   index: withScores.findIndex((w) => w.word === "trick"),
//   value: withScores[withScores.findIndex((w) => w.word === "trick")],
// });
// const fm = freqMap(filteredWordList);
// console.log(
//   Object.entries(fm.l1)
//     .sort((a, b) => b[1] - a[1])
//     .map(([k, v]) => `${k}: ${rnd(v / filteredWordList.length)}`)
// );
// console.log(freqMap(filteredWordList));
