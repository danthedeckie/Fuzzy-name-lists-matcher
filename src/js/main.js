import { findMatches } from "./lib";

const buttonEl = document.getElementById("findMatchesButton");
const listOneEl = document.getElementById("listOne");
const listTwoEl = document.getElementById("listTwo");
const outputEl = document.getElementById("matchesOutput");

function scoreClass(value) {
  if (value > 99) {
    return "certain";
  }
  if (value > 40) {
    return "possible";
  }
  if (value < 1.1) {
    return "nothing";
  }
}

buttonEl.addEventListener("click", () => {
  buttonEl.textContent = "Searching...";
    //buttonEl.disabled = true;
  buttonEl.style.cursor = 'wait';

  window.setTimeout(() => {
    const listOne = listOneEl.value.split(/\r?\n/);
    const listTwo = listTwoEl.value.split(/\r?\n/);
    const matches = findMatches(listOne, listTwo);

    const sorted = matches.filter(([name, [score, possibleMatches]]) => score > 1).sort(
      ([name, [score, possibleMatches]], [name2, [score2, possibleMatches2]]) =>
        score2 - score
    );
    const output = sorted.map(
      ([name, [score, possibleMatches]]) =>
        `<tr class="${scoreClass(score)}">
        <td>${name}</td>
        <td><div class="matchoptions">${possibleMatches}</div></td>
        <td class="score">${score.toFixed(2)}</td>
      </tr>`
    );

    matchesOutput.innerHTML = [...output].join("\n");

    buttonEl.textContent = "Search";
    buttonEl.style.cursor = 'auto';
  }, 1);
});
