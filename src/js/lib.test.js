import { findMatches } from "./lib";

test("exact match", () => {
  expect(findMatches(["Hello World"], ["Hello World"])).toContainEqual([
    "Hello World",
    1000,
  ]);
});

test("first initial match", () => {
  const phrase = "Hello World";
  const otherListPhrases = ["H World"];
  const expectedScore = 425;
  expect(findMatches([phrase], otherListPhrases)).toContainEqual([
    phrase,
    expectedScore,
  ]);
});


test("first initial with dot match", () => {
  const phrase = "Hello World";
  const otherListPhrases = ["H. World"];
  const expectedScore = 425;
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
