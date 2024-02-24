// import { expect } from "@jest/globals";

import { makeVariations } from "./lib";

test("exact", () => {
  expect(makeVariations("Hello World")).toContain("Hello World");
});

test("lowercase", () => {
  expect(makeVariations("Hello World")).toContain("hello world");
});

// TODO - drop uppercase - normalise everything to lower?
test("uppercase", () => {
  expect(makeVariations("Hello World")).toContain("HELLO WORLD");
});

test("initials", () => {
  expect(makeVariations("Hello World")).toContain("h w");
  expect(makeVariations("Alfred Bernard Charles")).toContain("a b c");
  expect(makeVariations("Alfred B Charles")).toContain("a b c");
  expect(makeVariations("A B Charles")).toContain("a b c");
});

test("initials", () => {
  expect(makeVariations("Hello World")).toContain("H World");
  expect(makeVariations("Alfred Bernard Charles")).toContain("A B Charles");
  expect(makeVariations("Alfred  B Charles")).toContain("A B Charles");
  expect(makeVariations("Alfred B   Charles")).toContain("A B Charles");
});

