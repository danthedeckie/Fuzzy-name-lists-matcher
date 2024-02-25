import { findMatches, normalise, makeMatchesMap, getScore } from "./lib";

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

describe("makeMatchesMap", () => {
  it("works with one item", () => {
    const output = makeMatchesMap(["Hello World"]);
    expect(output.get("hello world")).toEqual([["Hello World"], 100]);
    expect(output.get("h world")).toEqual([["Hello World"], 20]);
    expect(output.get("h w")).toEqual([["Hello World"], 5]);
  });
  it("works with two items", () => {
    const output = makeMatchesMap(["Hello World", "Be Kind"]);
    expect(output.get("hello world")).toEqual([["Hello World"], 100]);
    expect(output.get("h world")).toEqual([["Hello World"], 20]);
    expect(output.get("h w")).toEqual([["Hello World"], 5]);

    expect(output.get("be kind")).toEqual([["Be Kind"], 100]);
    expect(output.get("b kind")).toEqual([["Be Kind"], 20]);
    expect(output.get("b k")).toEqual([["Be Kind"], 5]);
  });
  it("works with two items with the same initials", () => {
    const output = makeMatchesMap(["Hello World", "House Wooster"]);
    expect(output.get("hello world")).toEqual([["Hello World"], 100]);
    expect(output.get("h world")).toEqual([["Hello World"], 20]);
    expect(output.get("h w")).toEqual([["House Wooster","Hello World"], 5]);

    expect(output.get("house wooster")).toEqual([["House Wooster"], 100]);
    expect(output.get("h wooster")).toEqual([["House Wooster"], 20]);
    expect(output.get("h w")).toEqual([
      ["House Wooster", "Hello World"],
      5,
    ]);
  });

  it("it prioritises exact matches", () => {
    const output = makeMatchesMap(["H World", "Hello World"]);
    expect(output.get("hello world")).toEqual([["Hello World"], 100]);
    expect(output.get("h world")).toEqual([["H World", "Hello World"], 100]);
    expect(output.get("h w")).toEqual([["Hello World", "H World"], 5]);
  });

});

describe("getScore", () => {
    it("works", () => {
        const matchesMap = makeMatchesMap(['Hello World']);
        expect(getScore('Hello World', matchesMap)).toEqual(100);

    });

})

describe("findMatches", () => {
  test("exact match", () => {
    expect(findMatches(["Hello World"], ["Hello World"])).toContainEqual([
      "Hello World",
      100,
    ]);
  });

  test("first initial match", () => {
    const phrase = "Hello World";
    const otherListPhrases = ["H World"];
    const expectedScore = 25;
    expect(findMatches([phrase], otherListPhrases)).toContainEqual([
      phrase,
      expectedScore,
    ]);
  });

  test("first initial with dot match", () => {
    const phrase = "Hello World";
    const otherListPhrases = ["H. World"];
    const expectedScore = 25;
    expect(findMatches([phrase], otherListPhrases)).toContainEqual([
      phrase,
      expectedScore,
    ]);
  });

  test("no match", () => {
    const phrase = "Hello World";
    const otherListPhrases = ["Tomato Sauce"];
    const expectedScore = 0;
    expect(findMatches([phrase], otherListPhrases)).toContainEqual([
      phrase,
      expectedScore,
    ]);
  });
});
