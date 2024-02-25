export function normalise(value) {
  /* Given a name, return a version with:
   * - spaces trimmed & combined
   * - `.` removed
   * - all lower case
   * (and further 'simplifications' done)
   * */
  return value
    .trim()
    .replace(/[\.'\-ʼ]/g, "")
    .replace(/\s+/, " ")
    .toLowerCase();
}

/*
 * Various 'variations' functions:
 * */

function makeInitials(value) {
  //"Hello World" -> "H W"
  return value
    .replace(/(\w)([^\s]*)/g, "$1")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function makeFirstInitials(value) {
  return value.replace(/(\w)\w+\s+/g, "$1 ").replace(/\s+/g, " ");
}

/* And combine them all: */

export function makeVariations(value) {
  /* Given an original (complex) name, normalise it and return all the variations
   * of it we could expect, with a score for how likely a match is to be a real match
   * Eg "Hello World" -> [["hello world", 100], ['h world", 20], ["h w", 5]...]
   * */
  const nameOutsideBrackets = normalise(value.replace(/\(.*\)/, "").trim());
  const bracketedName = normalise(value.replace(/.*\((.*)\).*/, "$1").trim());
  let variations = [
    [nameOutsideBrackets, 100],
    [makeFirstInitials(nameOutsideBrackets), 20],
    [makeInitials(nameOutsideBrackets), 5],
  ];
  if (nameOutsideBrackets !== bracketedName) {
    variations = [
      ...variations,
      [bracketedName, 100],
      [makeFirstInitials(bracketedName), 20],
      [makeInitials(bracketedName), 5],
    ];
    console.log(variations);
  }

  return variations;
}

export function makeMatchesMap(phrasesList) {
  const matchesMap = new Map();
  phrasesList.forEach((originalPhrase) => {
    makeVariations(originalPhrase).forEach(([phrase, score]) => {
      const otherMatch = matchesMap.get(phrase);
      let originalPhrases = [originalPhrase];

      if (otherMatch) {
        const [otherOriginalPhrases, otherScore] = otherMatch;
        if (otherScore > score) {
          if (!otherOriginalPhrases.includes(originalPhrase)) {
            otherOriginalPhrases.push(originalPhrase);
          }
          score = otherScore;
        } else {
          otherOriginalPhrases.unshift(originalPhrase);
        }
        originalPhrases = otherOriginalPhrases;
      }
      matchesMap.set(phrase, [originalPhrases, score]);
    });
  });
  return matchesMap;
}

export function getScore(one, matchesMap) {
  /* Given a name, and a second massive map of scored phrases
   * return the combined scores for this word found in that map.
   * */
  const variations = makeVariations(one);
  const foundNames = new Set();
  let scores = [0];

  variations.forEach(([phrase, score]) => {
    const match = matchesMap.get(phrase);
    if (match) {
      foundNames.add(match[0]);
      scores.push(match[1]);
    }
  });

  return Math.min(scores.reduce((a,b) => a + b), 100);
}

export function findMatches(listOne, listTwo) {
  const matchesMap = makeMatchesMap(listTwo);
  return listOne.map((one) => [one, getScore(one, matchesMap)]);
}
