import {
  findMatches,
  normalise,
  dedup,
  makeMatchesMap,
  getScore,
  makeVariations,
  MATCHVAL,
  makeFirstInitials,
  makeFirstInitialAndLastName,
  makeStemmed,
  sortMatches,
} from "./lib";

describe("dedup", () => {
  it("deduplicates individual strings", () => {
    expect(dedup(["a", "b", "c", "a", "x", "y", "z", "z", "z", "z"])).toEqual([
      "a",
      "b",
      "c",
      "x",
      "y",
      "z",
    ]);
  });
});

describe("makeFirstInitials", () => {
  it("does it with one first name", () => {
    expect(makeFirstInitials("hello world")).toEqual("h world");
  });
  it("does it with two first names", () => {
    expect(makeFirstInitials("hello there world")).toEqual("h t world");
  });
  it("does it with 'x yyy zzzzz'", () => {
    expect(makeFirstInitials("h there world")).toEqual("h t world");
  });
});
describe("makeFirstInitialAndLastName", () => {
  it("does it with 'x yyy zzzzz'", () => {
    const value = "h there world";
    const output = makeFirstInitialAndLastName(value).replace(/ . /, " ");
    expect(output).toEqual("h world");
  });
});

describe("normalise", () => {
  it("makes things lower case", () => {
    expect(normalise("ALICE Smithe")).toEqual("alice smithe");
  });

  it("removes multiple dots", () => {
    expect(normalise("p. g. woodhouse")).toEqual("p g woodhouse");
  });

  it("removes single quotes", () => {
    expect(normalise("Bob O'neil")).toEqual("bob oneil");
  });

  it("removes single apostrophes", () => {
    expect(normalise("Bob Oʼneil")).toEqual("bob oneil");
  });
  it("removes multiple spaces", () => {
    expect(normalise("   test       person")).toEqual("test person");
  });
  it("removes tabs", () => {
    expect(normalise("\ttest     \t  person \t ")).toEqual("test person");
  });
});

describe("makeStemmed", () => {
  it("makes Bill and Will match", () => {
    expect(makeStemmed("will")).toEqual(makeStemmed("bill"));
  });
  it("makes Elizabeth and Elisabeth match", () => {
    expect(makeStemmed("elizabeth")).toEqual(makeStemmed("elisabeth"));
  });
});

describe("makeVariations", () => {
  it("simple name", () => {
    const variations = makeVariations("hello world");
    expect(variations).toContainEqual(["hello world", MATCHVAL.TOTAL]);
    expect(variations).toContainEqual(["h world", MATCHVAL.INITIAL_AND_FINAL]);
    expect(variations).toContainEqual(["h w", MATCHVAL.INITIALS]);
    expect(variations).toContainEqual(["hello", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["world", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["h_l_", MATCHVAL.ONE_STEM]);
    expect(variations).toContainEqual(["b_rld", MATCHVAL.ONE_STEM]);
  });

  it("name with bracketed version", () => {
    const variations = makeVariations("hello WORLD (hey cosmos)");
    expect(variations).toContainEqual(["hello world", MATCHVAL.TOTAL]);
    expect(variations).toContainEqual(["h world", MATCHVAL.INITIAL_AND_FINAL]);
    expect(variations).toContainEqual(["h w", MATCHVAL.INITIALS]);
    expect(variations).toContainEqual(["hello", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["world", MATCHVAL.ONE_NAME]);

    expect(variations).toContainEqual(["hey cosmos", MATCHVAL.TOTAL]);
    expect(variations).toContainEqual(["h cosmos", MATCHVAL.INITIAL_AND_FINAL]);
    expect(variations).toContainEqual(["h c", MATCHVAL.INITIALS]);
    expect(variations).toContainEqual(["hey", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["cosmos", MATCHVAL.ONE_NAME]);
    // expect(variations).toContainEqual(["h", MATCHVAL.ONE_STEM]);
    expect(variations).toContainEqual(["c_sm_s", MATCHVAL.ONE_STEM]);
  });
  it("copes with multiple bracket versions", () => {
    const variations = makeVariations("(Julie Armada) Frost (Dr julie test)");
    const words = variations.map(([a, b]) => a);
    expect(words).not.toContain("");
    expect(words).toContain("julie");
    expect(words).toContain("armada");
    expect(words).toContain("frost");
    expect(words).toContain("test");
  });
  it("makes a non-extra letters version", () => {
    const variations = makeVariations("hello g world");
    expect(variations).toContainEqual(["hello world", MATCHVAL.TOTAL]);
  });
});

describe("makeMatchesMap", () => {
  it("works with one item", () => {
    const output = makeMatchesMap(["Hello World"]);
    expect(output.get("hello world").get("Hello World")).toEqual(
      1000, // MATCHVAL.TOTAL
    );
    expect(output.get("h world").get("Hello World")).toEqual(
      MATCHVAL.INITIAL_AND_FINAL,
    );
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);
  });
  it("works with two items", () => {
    const output = makeMatchesMap(["Hello World", "Be Kind"]);
    expect(output.get("hello world").get("Hello World")).toEqual(1000);
    expect(output.get("h world").get("Hello World")).toEqual(
      MATCHVAL.INITIAL_AND_FINAL,
    );
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);

    expect(output.get("be kind").get("Be Kind")).toEqual(1000);
    expect(output.get("b kind").get("Be Kind")).toEqual(
      MATCHVAL.INITIAL_AND_FINAL,
    );
    expect(output.get("b k").get("Be Kind")).toEqual(MATCHVAL.INITIALS);
  });
  it("works with two items with the same initials", () => {
    const output = makeMatchesMap(["Hello World", "House Wooster"]);

    expect(output.get("hello world").get("Hello World")).toEqual(1000);
    expect(output.get("h world").get("Hello World")).toEqual(
      MATCHVAL.INITIAL_AND_FINAL,
    );
    expect(output.get("h w").get("House Wooster")).toEqual(MATCHVAL.INITIALS);
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);

    expect(output.get("house wooster").get("House Wooster")).toEqual(1000);
    expect(output.get("h wooster").get("House Wooster")).toEqual(
      MATCHVAL.INITIAL_AND_FINAL,
    );
    expect(output.get("h w").get("House Wooster")).toEqual(MATCHVAL.INITIALS);
  });

  it("it prioritises exact matches", () => {
    const output = makeMatchesMap(["H World", "Hello World"]);

    expect(output.get("hello world").get("Hello World")).toEqual(1000);
    expect(output.get("h world").get("H World")).toEqual(1000);
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);
  });
});

describe("getScore", () => {
  it("exact match", () => {
    const matchesMap = makeMatchesMap(["Hello World"]);
    expect(getScore("Hello World", matchesMap)).toEqual([
      100,
      [["Hello World", 1.0]],
    ]);
  });

  it("secondary match", () => {
    const matchesMap = makeMatchesMap(["Hello World"]);
    expect(getScore("H World", matchesMap)[1]).toEqual([["Hello World", 1.0]]);
    expect(getScore("H World", matchesMap)[0]).toBeGreaterThan(18);
    expect(getScore("H World", matchesMap)[0]).toBeLessThan(100);
  });

  it("non-match", () => {
    const matchesMap = makeMatchesMap(["Hello World"]);
    expect(getScore("Banana", matchesMap)).toEqual([0, []]);
  });

  it("doesn't get bigger with hits to different results", () => {
    const singleScore = getScore("foo", makeMatchesMap(["fu"]));
    const doubleScore = getScore("foo", makeMatchesMap(["fu", "fa"]));
    // expect(makeMatchesMap(['fu'])).toEqual('');
    // expect(makeMatchesMap(['fu', 'fa'])).toEqual('');
    expect(singleScore[0]).toEqual(doubleScore[0]);
  });

  it("surname only match is below 30", () => {
    const matchesMap = makeMatchesMap(["(Annie George) TEST"]);
    expect(getScore("Mike Test", matchesMap)[0]).toBeLessThan(30);
  });

  it("get's a good match score for missing middle name only from bracketed", () => {
    const matchesMap = makeMatchesMap(["Hello LARGE-WORLD (Hello World)"]);
    const matchScore = getScore("Hello M World", matchesMap);

    expect(matchScore[1][0][0]).toEqual("Hello LARGE-WORLD (Hello World)");
    expect(matchScore[0]).toBeGreaterThan(20);
    expect(matchScore[0]).toBeLessThan(100);
  });

  it("finds gareth yellow against ", () => {
    const matchesMap = makeMatchesMap(["gareth YELLOW"]);
    const matchScore = getScore("g bbb yellow", matchesMap);

    expect(matchScore[0]).toBeGreaterThan(20);
    expect(matchScore[0]).toBeLessThan(100);
  });

  it("finds test user against test", () => {
    const matchesMap = makeMatchesMap(["user"]);
    const matchScore = getScore("test user", matchesMap);

    expect(matchScore[0]).toBeGreaterThan(2);
    expect(matchScore[0]).toBeLessThan(30);
  });

  // TODO...
  // it("doesn't get a better score for matching the same stem word multiple times", () => {
  //   const TwoMatches = makeMatchesMap(["ian john"]);
  //   const ThreeMatches = makeMatchesMap(["ian john jon"]);
  //   console.log(TwoMatches);
  //   console.log(ThreeMatches);

  //   expect(getScore("john smith", TwoMatches)[0]).toEqual(
  //     getScore("john smith", ThreeMatches)[0],
  //   );
  // });
});

describe("findMatches", () => {
  test("exact match", () => {
    expect(findMatches(["Hello World"], ["Hello World"])).toContainEqual([
      "Hello World",
      [100, [["Hello World", 1]]],
    ]);
  });

  test("first initial match", () => {
    const expectedPhrase = "Hello World";
    const otherListPhrases = ["H World"];

    const foundScore = findMatches([expectedPhrase], otherListPhrases).filter(
      ([phrase, _score]) => phrase === expectedPhrase,
    )[0];

    expect(foundScore[1][0]).toBeLessThan(40);
    expect(foundScore[1][0]).toBeGreaterThan(10);
  });

  test("first initial with dot match", () => {
    const expectedPhrase = "Hello World";
    const otherListPhrases = ["H. World"];

    const foundScore = findMatches([expectedPhrase], otherListPhrases).filter(
      ([phrase, _score]) => phrase === expectedPhrase,
    )[0];

    expect(foundScore[1][0]).toBeLessThan(40);
    expect(foundScore[1][0]).toBeGreaterThan(10);
  });

  test("no match", () => {
    const phrase = "Hello World";
    const otherListPhrases = ["Tomato Sauce"];
    const expectedScore = [0, []];
    expect(findMatches([phrase], otherListPhrases)).toContainEqual([
      phrase,
      expectedScore,
    ]);
  });
});

describe("sortMatches", () => {
  const scores = [
    ["Hello Tests", [42.0, ["hello"]]],
    ["Hello World", [90.0, ["hello", "world"]]],
    ["No match", [0.0, []]],
    ["H W", [5.0, ["hello", "world"]]],
  ];

  test("sorts by highest score", () => {
    const expected = [
      ["Hello World", [90.0, ["hello", "world"]]],
      ["Hello Tests", [42.0, ["hello"]]],
      ["H W", [5.0, ["hello", "world"]]],
      ["No match", [0.0, []]],
    ];
    expect(sortMatches(scores, 0)).toEqual(expected);
  });
  test("cuts off below threshold", () => {
    const expected = [
      ["Hello World", [90.0, ["hello", "world"]]],
      ["Hello Tests", [42.0, ["hello"]]],
    ];
    expect(sortMatches(scores, 20.0)).toEqual(expected);
  });
});
