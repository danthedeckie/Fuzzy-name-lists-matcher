import { findMatches } from "./lib";

const buttonEl = document.getElementById("findMatchesButton");
const listOneEl = document.getElementById("listOne");
const listTwoEl = document.getElementById("listTwo");
const outputEl = document.getElementById("matchesOutput");

buttonEl.addEventListener("click", () => {
  const listOne = listOneEl.value.split(/\r?\n/);
  const listTwo = listTwoEl.value.split(/\r?\n/);
  const output = findMatches(listOne, listTwo).map(
    (line) => `<li>${line}</li>`
  );
  matchesOutput.innerHTML = [...output].join("\n");
});
