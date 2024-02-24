import { findMatches } from "./lib";

const buttonEl = document.getElementById("findMatchesButton");
const listOneEl = document.getElementById("listOne");
const listTwoEl = document.getElementById("listTwo");
const outputEl = document.getElementById("matchesOutput");

function scoreClass(value) {
    if (value > 999) {
        return 'certain';
    }
    if (value > 400) {
        return 'possible';
    }
}

buttonEl.addEventListener("click", () => {
  const listOne = listOneEl.value.split(/\r?\n/);
  const listTwo = listTwoEl.value.split(/\r?\n/);
  const matches = findMatches(listOne, listTwo);

  const sorted = matches.sort(
    ([name, score], [name2, score2]) => score2 - score
  );
  const output = sorted.map(([name, score]) => `<li class="${scoreClass(score)}">${name} (${score})</li>`);

  matchesOutput.innerHTML = [...output].join("\n");
});
