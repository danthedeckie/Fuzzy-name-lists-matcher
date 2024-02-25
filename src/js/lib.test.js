import { findMatches, normalise, makeMatchesMap, getScore, makeVariations } from "./lib";

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
      expect(variations).toContainEqual(["hello world", 100]);
      expect(variations).toContainEqual(["h world", 10]);
      expect(variations).toContainEqual(["h w", 2]);
      expect(variations).toContainEqual(["hello", 4]);
      expect(variations).toContainEqual(["world", 4]);
      expect(variations).toContainEqual(["h_l_", 2]);
      expect(variations).toContainEqual(["b_rld", 2]);

  })

  it("name with bracketed version", () => {
      const variations = makeVariations("hello WORLD (hey cosmos)");
      expect(variations).toContainEqual(["hello world", 100]);
      expect(variations).toContainEqual(["h world", 10]);
      expect(variations).toContainEqual(["h w", 2]);
      expect(variations).toContainEqual(["hello", 4]);
      expect(variations).toContainEqual(["world", 4]);

      expect(variations).toContainEqual(["hey cosmos", 100]);
      expect(variations).toContainEqual(["h cosmos", 10]);
      expect(variations).toContainEqual(["h c", 2]);
      expect(variations).toContainEqual(["hey", 4]);
      expect(variations).toContainEqual(["cosmos", 4]);

  })

}) 

describe("makeMatchesMap", () => {
  it("works with one item", () => {
    const output = makeMatchesMap(["Hello World"]);
    expect(output.get("hello world").get("Hello World")).toEqual(100);
    expect(output.get("h world").get("Hello World")).toEqual(10);
    expect(output.get("h w").get("Hello World")).toEqual(2);
  });
  it("works with two items", () => {
    const output = makeMatchesMap(["Hello World", "Be Kind"]);
    expect(output.get("hello world").get("Hello World")).toEqual(100);
    expect(output.get("h world").get("Hello World")).toEqual(10);
    expect(output.get("h w").get("Hello World")).toEqual(2);

    expect(output.get("be kind").get("Be Kind")).toEqual(100);
    expect(output.get("b kind").get("Be Kind")).toEqual(10);
    expect(output.get("b k").get("Be Kind")).toEqual(2);
  });
  it("works with two items with the same initials", () => {
    const output = makeMatchesMap(["Hello World", "House Wooster"]);

    expect(output.get("hello world").get("Hello World")).toEqual(100);
    expect(output.get("h world").get("Hello World")).toEqual(10);
    expect(output.get("h w").get("House Wooster")).toEqual(2);
    expect(output.get("h w").get("Hello World")).toEqual(2);

    expect(output.get("house wooster").get("House Wooster")).toEqual(100);
    expect(output.get("h wooster").get("House Wooster")).toEqual(5);
    expect(output.get("h w").get("House Wooster")).toEqual(2);
  });

  it("it prioritises exact matches", () => {
    const output = makeMatchesMap(["H World", "Hello World"]);

    expect(output.get("hello world").get("Hello World")).toEqual(10);
    expect(output.get("h world").get("H World")).toEqual(12); // TODO - check this...
    expect(output.get("h w").get("Hello World")).toEqual(0.5);
  });
});

describe("getScore", () => {
    it("exact match", () => {
        const matchesMap = makeMatchesMap(['Hello World']);
        expect(getScore('Hello World', matchesMap)).toEqual([100, ["Hello World"]]);
    });

    it("secondary match", () => {
        const matchesMap = makeMatchesMap(['Hello World']);
        expect(getScore('H World', matchesMap)).toEqual([22.25, ["Hello World"]]);
    });

    it("non-match", () => {
        const matchesMap = makeMatchesMap(['Hello World']);
        expect(getScore('Banana', matchesMap)).toEqual([0, []]);
    });


})

describe("findMatches", () => {
  test("exact match", () => {
    expect(findMatches(["Hello World"], ["Hello World"])).toContainEqual([
      "Hello World",
      [100, ["Hello World"]],
    ]);
  });

  test("first initial match", () => {
    const phrase = "Hello World";
    const otherListPhrases = ["H World"];
    const expectedScore = [12.25, ["H World"]];

    expect(findMatches([phrase], otherListPhrases)).toContainEqual([
      phrase,
      expectedScore,
    ]);
  });

  test("first initial with dot match", () => {
    const phrase = "Hello World";
    const otherListPhrases = ["H. World"];
    const expectedScore = [12.25, ["H. World"]];
    expect(findMatches([phrase], otherListPhrases)).toContainEqual([
      phrase,
      expectedScore,
    ]);
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
