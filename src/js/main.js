import { findMatches } from "./lib";

const buttonEl = document.getElementById("findMatchesButton");
const listOneEl = document.getElementById("listOne");
const listTwoEl = document.getElementById("listTwo");
const listOneCountEl = document.getElementById("listOne-count");
const listTwoCountEl = document.getElementById("listTwo-count");

const outputEl = document.getElementById("matchesOutput");

// Configuration
const cutoffValueEl = document.getElementById("cutoffValue");
const possibleMatchSeparatorEl = document.getElementById(
  "possibleMatchSeparator",
);

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
  const cutoff = parseFloat(cutoffValueEl.value);
  if (Number.isNaN(cutoff)) {
    alert("Invalid Cutoff value");
    return;
  }

  buttonEl.textContent = "Searching...";
  //buttonEl.disabled = true;
  buttonEl.style.cursor = "wait";

  // use a timeout to delay *actually* running the search for 2ms, which gives the UI
  // time to update the button text & cursor before a multi-second entire page pause
  // while it does the filtering:
  window.setTimeout(() => {
    const listOne = listOneEl.value.split(/\r?\n/);
    const listTwo = listTwoEl.value.split(/\r?\n/);
    const matches = findMatches(listOne, listTwo);

    // Drop results below the threshold, and sort the remaining results
    // by score:

    const sorted = matches
      .filter(([_name, [score, possibleMatches]]) => score > cutoff)
      .sort(
        (
          [_name, [score, possibleMatches]],
          [_name2, [score2, _possibleMatches2]],
        ) => score2 - score,
      );

    // Now display them as rows in the table:

    const possibleMatchSeparatorValue = possibleMatchSeparatorEl.value;

    const output = sorted.map(
      ([name, [score, possibleMatches]]) =>
        `<tr class="${scoreClass(score)}">
        <td>${name}</td>
        <td><div class="matchoptions">${possibleMatches
          .map(makeMatchDisplay)
          .join(
            ` <span class="joiner" aria-label="or" role="separator">${possibleMatchSeparatorValue}</span> `,
          )}</div></td>
        <td class="score">${score.toFixed(2)}</td>
      </tr>`,
    );

    outputEl.innerHTML = [...output].join("\n");

    // Use a second timeout to again give the page a chance to finish updating before
    // removing the button 'Searching...' text & cursor
    window.setTimeout(() => {
      buttonEl.textContent = "Search";
      buttonEl.style.cursor = "auto";
    }, 2);
  }, 2);
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

cutoffValueEl.addEventListener("blur", () => {
  let value = parseFloat(cutoffValueEl.value);
  if (Number.isNaN(value)) {
    value = 3.5;
  } else if (value < 0) {
    value = 0.0;
  } else if (value > 99.9) {
    value = 99.9;
  }
  cutoffValueEl.value = value;
});
