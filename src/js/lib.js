function normalise(value) {
  /* Given a name, return a version with:
   * - spaces trimmed & combined
   * - `.` removed
   * - all lower case
   * (and further 'simplifications' done)
   * */
  return value.trim().replace(/\./, "").replace(/\s+/, " ").toLowerCase();
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
  value = normalise(value);
  return [
    [value, 100],
    [makeFirstInitials(value), 20],
    [makeInitials(value), 5],
  ];
}

export function getScore(one, matchesMap) {
  /* Given a name, and a second massive map of scored phrases
   * return the combined scores for this word found in that map.
   * */
  const variations = makeVariations(one);
  const scores = variations.map(([phrase, score]) => {
    const foundScore = matchesMap.get(phrase) || 0;
    return score * foundScore;
  });
  return Math.min(
    1000,
    scores.reduce((a, b) => a + b)
  );
}

export function findMatches(listOne, listTwo) {
  const matchesMap = new Map();
  listTwo.forEach((two) => {
    makeVariations(two).forEach(([phrase, score]) =>
      matchesMap.set(phrase, score)
    );
  });

  return listOne.map((one) => [one, getScore(one, matchesMap)]);
}
