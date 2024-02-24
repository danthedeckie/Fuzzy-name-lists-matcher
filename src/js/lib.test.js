// import { expect } from "@jest/globals";

import { makeVariations } from "./lib";

test("exact", () => {
  expect(makeVariations("Hello World")).toContain("Hello World");
});

test("lowercase", () => {
  expect(makeVariations("Hello World")).toContain("hello world");
});

test("uppercase", () => {
  expect(makeVariations("Hello World")).toContain("HELLO WORLD");
});

test("initials", () => {
  expect(makeVariations("Hello World")).toContain("H W");
});
