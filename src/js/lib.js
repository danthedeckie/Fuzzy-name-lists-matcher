export const MATCHVAL = {
  MISSING_NAME_DEBOOST: 5,
  TOTAL: 1000,
  TOTAL_STEM: 900,
  TWO_NAMES_MATCH: 300,
  TWO_STEMS_MATCH: 200,
  INITIAL_AND_FINAL: 250,
  INITIALS_AND_FINAL: 200,
  INITIALS: 10,
  ONE_NAME: 20,
  ONE_STEM: 2,
};

export function normalise(value) {
  /* Given a name, return a version with:
   * - spaces trimmed & combined
   * - `.` removed
   * - all lower case
   * (and further 'simplifications' done)
   * */
  return (
    value
      // remove beginning/ending whitespace:
      .trim()
      .replace(/[\.'ʼ]/g, "") // O'Leary, etc.
      .replace(/[\s\-]+/g, " ") // Ffink-Nottle
      .toLowerCase()
      // strip common titles:
      .replace("^dr ", "")
      .replace("^mr ", "")
      .replace("^mrs ", "")
      .replace("^ms ", "")
      .replace("^m ", "")
      // strip out accents / diacritics:
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );
}

/*
 * Various 'variations' functions:
 * */

export function makeInitials(value) {
  //"Hello World" -> "H W"
  return value
    .replace(/(\w)([^\s]*)/g, "$1")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function makeFirstInitials(value) {
  return value.replace(/(\w)\w+\s+/g, "$1 ").replace(/\s+/g, " ");
}

export function makeFirstInitialAndLastName(value) {
  return value
    .replace(/(\w)\w+\s+/g, "$1 ")
    .replace(/\s+/g, " ")
    .replace(/ . /, " ");
}

function makeStemmed(value) {
  const cleaned = value
    // replace double letters
    .replace(/(\w)(\1)/g, "$1")
    .replace("ph", "f") // philipe/filipe
    .replace("ge", "je") // jeff/geoff
    .replace("g", "j") // Gill/jill
    .replace("k", "c") // Kate/cath
    .replace("z", "s") // Elizabeth/Elisabeth
    .replace("tch", "ch") // watch / wach
    .replace("th", "t") // esther / ester
    .replace(/[rw]/, "b") // bill/will, rob/bob
    .replace("oh", "o") // john/jon
    .replace("mac", "mc") // Macfarlane/mcfarlane
    // common suffixes:
    .replace("tofer", "") // Christopher/chris
    // TODO - think about '-athon', '-tina', and other common suffixes???
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

function dedup(values) {
  return [...new Set(values).values()];
}

/* And combine them all: */

function makeSubVariations(value) {
  const splitNames = value.split(" ").filter((i) => i.length);

  // First the 'full names' at full value:
  const variations = [
    [value, MATCHVAL.TOTAL],
    [
      splitNames
        .map(makeStemmed)
        .filter((m) => m.length > 1)
        .join(" "),
      MATCHVAL.TOTAL_STEM,
    ],
    // Plus all the individual names (stemmed) at that value:
    ...dedup(splitNames.map(makeStemmed).filter((m) => m.length > 1)).map(
      (w) => [w, MATCHVAL.ONE_STEM],
    ),
  ];

  // All combinations of names (& stemmed Names)
  const combinationNameVariations = [];
  const combinationStemVariations = [];

  for (const name of splitNames) {
    for (const name2 of splitNames) {
      if (name !== name2 && `${name} ${name2}` !== value) {
        combinationNameVariations.push(`${name} ${name2}`);
        combinationStemVariations.push(
          `${makeStemmed(name)} ${makeStemmed(name2)}`,
        );
      }
    }
  }
  variations.push(
    ...dedup(combinationNameVariations).map((v) => [
      v,
      MATCHVAL.TWO_NAMES_MATCH,
    ]),
    ...dedup(combinationStemVariations).map((v) => [
      v,
      MATCHVAL.TWO_STEMS_MATCH,
    ]),
  );
  const lastname = splitNames[splitNames.length - 1];
  variations.push(
    ...combinationNameVariations
      .filter((w) => w.includes(splitNames[0]) && w.includes(lastname))
      .map((v) => [v, MATCHVAL.TWO_NAMES_MATCH * 2]),
  );

  const nameWithoutIndividualLetters = value.replace(/ . /g, " ");
  if (nameWithoutIndividualLetters !== value) {
    variations.push([nameWithoutIndividualLetters, MATCHVAL.TOTAL]);
  }

  if (splitNames.length > 1) {
    const mostCommonCombined = `${splitNames[0]} ${splitNames.toReversed()[0]}`;
    if (mostCommonCombined !== value) {
      variations.push([mostCommonCombined, MATCHVAL.TWO_NAMES_MATCH]);
      variations.push([makeStemmed(mostCommonCombined), MATCHVAL.TOTAL_STEM]);
    }

    const firstInitialsAndLastName = makeFirstInitials(value);
    const firstInitialAndLastName = makeFirstInitialAndLastName(value);

    variations.push(
      ...dedup(splitNames).map((w) => [w, MATCHVAL.ONE_NAME]),
      [firstInitialAndLastName, MATCHVAL.INITIAL_AND_FINAL],
      [makeInitials(value), MATCHVAL.INITIALS],
    );
    if (firstInitialAndLastName !== firstInitialsAndLastName) {
      variations.push([firstInitialsAndLastName, MATCHVAL.INITIALS_AND_FINAL]);
    }
  }
  return variations;
}

export function makeVariations(value) {
  /* Given an original (complex) name, normalise it and return all the variations
   * of it we could expect, with a score for how likely a match is to be a real match
   * Eg "Hello World" -> [["hello world", 100], ['h world", 20], ["h w", 5]...]
   * */
  const nameOutsideBrackets = normalise(
    value.replace(/\([^\)]*\)/g, "").trim(),
  );
  const variations = makeSubVariations(nameOutsideBrackets);

  const bracketedNames = normalise(value).matchAll(/\(([^\)]*)\)/g);

  for (const [_, bracketedName] of bracketedNames) {
    if (nameOutsideBrackets !== bracketedName) {
      variations.push(...makeSubVariations(bracketedName));
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
  const normalisedOriginal = normalise(one);
  const wordsInOriginal = normalisedOriginal.split(" ").filter((i) => i.length);
  let individualWordsMatchDeboost = 0;
  let normalisedName = "";

  for (const [variation, variationScore] of variations) {
    const match = matchesMap.get(variation);
    if (match) {
      for (const [phrase, score] of match) {
        normalisedName = normalise(phrase);
        individualWordsMatchDeboost = 0;

        for (const individualWord of wordsInOriginal) {
          if (!normalisedName.includes(individualWord)) {
            individualWordsMatchDeboost += MATCHVAL.MISSING_NAME_DEBOOST;
          }
        }
        for (const individualWord of normalisedName
          .split(" ")
          .filter((i) => i.length)) {
          if (!normalisedOriginal.includes(individualWord)) {
            individualWordsMatchDeboost += MATCHVAL.MISSING_NAME_DEBOOST;
          }
        }

        // and increase the score for that phrase match
        foundNames.set(
          phrase,
          (foundNames.get(phrase) || 0) +
            score * variationScore -
            individualWordsMatchDeboost,
        );
      }
    }
  }

  const highestScore = Math.max(...foundNames.values());

  // We only want to include possible matches that are either the heighest scoring match,
  // or very close to it.  So two matches at 75 could both be shown, if there's another at 20,
  // drop it.
  const cutoff = Math.max(highestScore / 3, 0.1);
  const sortedNames = [...foundNames.entries()]
    .filter((a) => a[1] > cutoff)
    .sort((a, b) => b[1] - a[1])
    .map((i) => [i[0], i[1] / highestScore]);

  // The 'total' score is the one we show as a number to the end user.
  let totalScore = Math.max(0, highestScore / 160) ** 0.5;
  // let totalScore = highestScore;

  // // To make things less confusing for users, reduce all non-100% matches that score really well
  // // down to 99, and set any exact matches to 100.
  if (totalScore > 99) {
    if (normalise(one) === normalise(sortedNames[0][0])) {
      totalScore = 100;
    } else {
      totalScore = 99;
    }
  }

  return [totalScore, sortedNames];
}

export function findMatches(listOne, listTwo) {
  const matchesMap = makeMatchesMap(listTwo);
  return listOne.map((one) => [one, getScore(one, matchesMap)]);
}
