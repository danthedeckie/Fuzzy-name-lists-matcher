import { findMatches } from "./lib";

const buttonEl = document.getElementById("findMatchesButton");
const listOneEl = document.getElementById("listOne");
const listTwoEl = document.getElementById("listTwo");
const listOneCountEl = document.getElementById("listOne-count");
const listTwoCountEl = document.getElementById("listTwo-count");

const outputEl = document.getElementById("matchesOutput");

function scoreClass(value) {
  if (value > 98.5) {
    return "certain";
  }
  if (value > 30) {
    return "possible";
  }
  if (value < 1.1) {
    return "nothing";
  }
  if (value < 5) {
    return "unlikely";
  }
}

function makeMatchDisplay([name, probabilty]) {
  if (probabilty > 0.6) {
    return name;
  }
  return `<span class="less-likely">${name}</span>`;
}

buttonEl.addEventListener("click", () => {
  buttonEl.textContent = "Searching...";
  //buttonEl.disabled = true;
  buttonEl.style.cursor = "wait";

  window.setTimeout(() => {
    const listOne = listOneEl.value.split(/\r?\n/);
    const listTwo = listTwoEl.value.split(/\r?\n/);
    const matches = findMatches(listOne, listTwo);

    const sorted = matches
      .filter(([name, [score, possibleMatches]]) => score > 1)
      .sort(
        (
          [name, [score, possibleMatches]],
          [name2, [score2, possibleMatches2]]
        ) => score2 - score
      );
    const output = sorted.map(
      ([name, [score, possibleMatches]]) =>
        `<tr class="${scoreClass(score)}">
        <td>${name}</td>
        <td><div class="matchoptions">${possibleMatches
          .map(makeMatchDisplay)
          .join(' <span class="joiner">⊕</span> ')}</div></td>
        <td class="score">${score.toFixed(2)}</td>
      </tr>`
    );

    matchesOutput.innerHTML = [...output].join("\n");

    buttonEl.textContent = "Search";
    buttonEl.style.cursor = "auto";
  }, 1);
});

listOneEl.addEventListener("blur", () => {
  listOneEl.value = listOneEl.value.trim();
  listOneCountEl.innerHTML = `(${
    listOneEl.value.split(/\r?\n/).filter((i) => i.length).length
  })`;
});

listTwoEl.addEventListener("blur", () => {
  listTwoEl.value = listTwoEl.value.trim();
  listTwoCountEl.innerHTML = `(${
    listTwoEl.value.split(/\r?\n/).filter((i) => i.length).length
  })`;
});
