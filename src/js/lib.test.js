import {
  findMatches,
  normalise,
  makeMatchesMap,
  getScore,
  makeVariations,
  MATCHVAL,
  makeFirstInitials,
} from "./lib";

describe("makeFirstInitials", () => {
  it("does it with one first name", () => {
    expect(makeFirstInitials("hello world")).toEqual("h world");
  });
  it("does it with two first names", () => {
    expect(makeFirstInitials("hello there world")).toEqual("h t world");
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

describe("makeVariations", () => {
  it("simple name", () => {
    const variations = makeVariations("hello world");
    expect(variations).toContainEqual(["hello world", MATCHVAL.TOTAL]);
    expect(variations).toContainEqual(["h world", MATCHVAL.INITIALS_AND_FINAL]);
    expect(variations).toContainEqual(["h w", MATCHVAL.INITIALS]);
    expect(variations).toContainEqual(["hello", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["world", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["h_l_", MATCHVAL.ONE_STEM]);
    expect(variations).toContainEqual(["b_rld", MATCHVAL.ONE_STEM]);
  });

  it("name with bracketed version", () => {
    const variations = makeVariations("hello WORLD (hey cosmos)");
    expect(variations).toContainEqual(["hello world", MATCHVAL.TOTAL]);
    expect(variations).toContainEqual(["h world", MATCHVAL.INITIALS_AND_FINAL]);
    expect(variations).toContainEqual(["h w", MATCHVAL.INITIALS]);
    expect(variations).toContainEqual(["hello", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["world", MATCHVAL.ONE_NAME]);

    expect(variations).toContainEqual(["hey cosmos", MATCHVAL.TOTAL]);
    expect(variations).toContainEqual([
      "h cosmos",
      MATCHVAL.INITIALS_AND_FINAL,
    ]);
    expect(variations).toContainEqual(["h c", MATCHVAL.INITIALS]);
    expect(variations).toContainEqual(["hey", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["cosmos", MATCHVAL.ONE_NAME]);
    expect(variations).toContainEqual(["h", MATCHVAL.ONE_STEM]);
    expect(variations).toContainEqual(["c_sm_s", MATCHVAL.ONE_STEM]);
  });
  it("copes with multiple bracket versions", () => {
    const variations = makeVariations(
      "(Julia Elizabeth) WALPORT (Dr Julia Neild)",
    );
    const words = variations.map(([a, b]) => a);
    expect(words).not.toContain("");
    expect(words).toContain("julia");
    expect(words).toContain("elizabeth");
    expect(words).toContain("walport");
    expect(words).toContain("neild");
  });
  it("makes a non-extra letters version", () => {
    const variations = makeVariations("hello g world");
    expect(variations).toContainEqual(["hello world", MATCHVAL.TOTAL]);
  });
  // it("comapre", () => {
  //   const variations = makeVariations("David Williams");
  //   const variations2 = makeVariations("David Walliams");
  //     expect(variations).toEqual(variations2);
  // });
});

describe("makeMatchesMap", () => {
  it("works with one item", () => {
    const output = makeMatchesMap(["Hello World"]);
    expect(output.get("hello world").get("Hello World")).toEqual(
      1000, // MATCHVAL.TOTAL
    );
    expect(output.get("h world").get("Hello World")).toEqual(
      MATCHVAL.INITIALS_AND_FINAL,
    );
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);
  });
  it("works with two items", () => {
    const output = makeMatchesMap(["Hello World", "Be Kind"]);
    expect(output.get("hello world").get("Hello World")).toEqual(1000);
    expect(output.get("h world").get("Hello World")).toEqual(
      MATCHVAL.INITIALS_AND_FINAL,
    );
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);

    expect(output.get("be kind").get("Be Kind")).toEqual(1000);
    expect(output.get("b kind").get("Be Kind")).toEqual(
      MATCHVAL.INITIALS_AND_FINAL,
    );
    expect(output.get("b k").get("Be Kind")).toEqual(MATCHVAL.INITIALS);
  });
  it("works with two items with the same initials", () => {
    const output = makeMatchesMap(["Hello World", "House Wooster"]);

    expect(output.get("hello world").get("Hello World")).toEqual(1000);
    expect(output.get("h world").get("Hello World")).toEqual(
      MATCHVAL.INITIALS_AND_FINAL,
    );
    expect(output.get("h w").get("House Wooster")).toEqual(MATCHVAL.INITIALS);
    expect(output.get("h w").get("Hello World")).toEqual(MATCHVAL.INITIALS);

    expect(output.get("house wooster").get("House Wooster")).toEqual(1000);
    expect(output.get("h wooster").get("House Wooster")).toEqual(
      MATCHVAL.INITIALS_AND_FINAL,
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
    expect(getScore("Hello World", matchesMap)).toEqual([100, ["Hello World"]]);
  });

  it("secondary match", () => {
    const matchesMap = makeMatchesMap(["Hello World"]);
    expect(getScore("H World", matchesMap)[1]).toEqual(["Hello World"]);
    expect(getScore("H World", matchesMap)[0]).toBeGreaterThan(18);
    expect(getScore("H World", matchesMap)[0]).toBeLessThan(100);
  });

  it("non-match", () => {
    const matchesMap = makeMatchesMap(["Hello World"]);
    expect(getScore("Banana", matchesMap)).toEqual([0, []]);
  });

  // it("surname only match is NOT 100", () => {
  //   const matchesMap = makeMatchesMap(["(Annie George) TEST"]);
  //   expect(getScore("Mike Test", matchesMap)).toEqual([
  //     20,
  //     ["(Annie George) TEST"],
  //   ]);
  // });

  it("get's a good match score for missing middle name only from bracketed", () => {
    const matchesMap = makeMatchesMap(["Hello LARGE-WORLD (Hello World)"]);
    const matchScore = getScore("Hello M World", matchesMap);

    expect(matchScore[1]).toEqual(["Hello LARGE-WORLD (Hello World)"]);
    expect(matchScore[0]).toBeGreaterThan(20);
    expect(matchScore[0]).toBeLessThan(100);
  });
});

describe("findMatches", () => {
  test("exact match", () => {
    expect(findMatches(["Hello World"], ["Hello World"])).toContainEqual([
      "Hello World",
      [100, ["Hello World"]],
    ]);
  });

  test("first initial match", () => {
    const expectedPhrase = "Hello World";
    const otherListPhrases = ["H World"];

    const foundScore = findMatches([expectedPhrase], otherListPhrases).filter(
      ([phrase, _score]) => phrase === expectedPhrase,
    )[0];

    expect(foundScore[1][0]).toBeLessThan(25);
    expect(foundScore[1][0]).toBeGreaterThan(10);
  });

  test("first initial with dot match", () => {
    const expectedPhrase = "Hello World";
    const otherListPhrases = ["H. World"];

    const foundScore = findMatches([expectedPhrase], otherListPhrases).filter(
      ([phrase, _score]) => phrase === expectedPhrase,
    )[0];

    expect(foundScore[1][0]).toBeLessThan(25);
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

// test('foo', () => {
//     expect(makeVariations('(Julia Elizabeth) WALPORT (Dr Julia Neild)')).toEqual('foo');
// });
