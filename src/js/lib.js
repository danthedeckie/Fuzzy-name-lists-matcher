export const MATCHVAL = {
  TOTAL: 1000,
  INITIALS_AND_FINAL: 8,
  INITIALS: 2,
  ONE_NAME: 4,
  ONE_STEM: 3,
};

export function normalise(value) {
  /* Given a name, return a version with:
   * - spaces trimmed & combined
   * - `.` removed
   * - all lower case
   * (and further 'simplifications' done)
   * */
  return value
    .trim()
    .replace(/[\.'\ʼ]/g, "")
    .replace(/[\s\-]+/, " ")
    .toLowerCase()
    .replace("^dr ", "")
    .replace("^mr ", "")
    .replace("^mrs ", "")
    .replace("^ms ", "")
    .replace("^m ", "");
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

function makeAlmostSoundex(value) {
  let cleaned = value
    .replace("ll", "l") // allison/alison
    .replace("ff", "f") // jeff/jef
    .replace("bb", "b") // Bobby / bob
    .replace("nn", "n") // Bobby / bob
    .replace("ph", "f") // philipe/filipe
    .replace("ge", "je") // jeff/geoff
    .replace("g", "j") // Gill/jill
    .replace("z", "s") // Elizabeth/Elisabeth
    .replace("tch", "ch") // watch / wach
    .replace("th", "t") // wath / watt
    .replace(/[rw]/, "b") // bill/will, rob/bob
    // common suffixes:
    .replace("tofer", "") // Christopher/chris
    .replace("ian", "") // Gillian / Gill
    .replace(/(\w)ian/, "$1") // Gillian / Gill
    .replace(/(\w)iel/, "$1") // Daniel / Dan
    .replace(/[eiy]+$/, "") // Bobby / bob, Danny/dan
    // And finally replace all vowels w generic _
    .replace(/[aeiouy]+/g, "_");
  // if starts with vowel respect that...
  if (cleaned[0] === "_") {
    return `${value[0]}${cleaned.slice(1)}`;
  }

  return cleaned;
}

/* And combine them all: */

export function makeVariations(value) {
  /* Given an original (complex) name, normalise it and return all the variations
   * of it we could expect, with a score for how likely a match is to be a real match
   * Eg "Hello World" -> [["hello world", 100], ['h world", 20], ["h w", 5]...]
   * */
  const nameOutsideBrackets = normalise(
    value.replace(/\([^\)]*\)/g, "").trim()
  );
  const splitNames = nameOutsideBrackets.split(" ").filter((i) => i.length);

  let variations = [
    [nameOutsideBrackets, MATCHVAL.TOTAL],
    ...splitNames.map((w) => [makeAlmostSoundex(w), MATCHVAL.ONE_STEM]),
  ];

  if (splitNames.length > 1) {
    variations = [
      ...variations,

    ...splitNames.map((w) => [w, MATCHVAL.ONE_NAME]),
      [makeFirstInitials(nameOutsideBrackets), MATCHVAL.INITIALS_AND_FINAL],
      [makeInitials(nameOutsideBrackets), MATCHVAL.INITIALS],
    ];
  }

  const bracketedNames = normalise(value).matchAll(/\(([^\)]*)\)/g);

  for (const [_, bracketedName] of bracketedNames) {
    if (nameOutsideBrackets !== bracketedName) {
      variations = [
        ...variations,
        [bracketedName, MATCHVAL.TOTAL],
        [makeFirstInitials(bracketedName), MATCHVAL.INITIALS_AND_FINAL],
        [makeInitials(bracketedName), MATCHVAL.INITIALS],
        ...bracketedName
          .split(" ")
          .map((i) => i.trim())
          .filter((i) => i.length)
          .map((w) => [w, MATCHVAL.ONE_NAME]),
        ...bracketedName
          .split(" ")
          .map((i) => i.trim())
          .filter((i) => i.length)
          .map((w) => [makeAlmostSoundex(w), MATCHVAL.ONE_STEM]),
      ];
    }
  }

  return variations.filter(([word, score]) => word.length);
}

export function makeMatchesMap(phrasesList) {
  const matchesMap = new Map();

  for (const originalPhrase of phrasesList) {
    for (const [variant, score] of makeVariations(originalPhrase)) {
      const phraseScores = matchesMap.get(variant) || new Map();
      const thisPhraseScore = phraseScores.get(originalPhrase) || 0;

      phraseScores.set(originalPhrase, Math.min(thisPhraseScore + score, 1000));

      matchesMap.set(variant, phraseScores);
    }
  }

  return matchesMap;
}

export function getScore(one, matchesMap) {
  /* Given a name, and a second massive map of scored phrases
   * return the combined scores for this word found in that map.
   * */
  const variations = makeVariations(one);
  const foundNames = new Map();

  for (const [variation, variationScore] of variations) {
    const match = matchesMap.get(variation);
    if (match) {
      for (const [phrase, score] of match) {
        foundNames.set(
          phrase,
          ((foundNames.get(phrase) || 0) + score) * variationScore
        );
      }
    }
  }

  const totalScore = Math.min(Math.max(...foundNames.values(), 0) / 100, 100);
  const highestScore = Math.max(...foundNames.values());

  const cutoff = Math.max(highestScore / 10, 0.1);
  const sortedNames = [
    ...[...foundNames.entries()]
      .filter((a) => a[1] > cutoff)
      .sort((a, b) => b[1] - a[1])
      .map((i) => i[0]),
  ];

  return [totalScore, sortedNames];
}

export function findMatches(listOne, listTwo) {
  const matchesMap = makeMatchesMap(listTwo);
  return listOne.map((one) => [one, getScore(one, matchesMap)]);
}
