/*
 * Fuzzy name lists matcher
 * Copyright (C) 2024 Daniel Fairhead & Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * ----------------------------------------------------------------------
 *
 *  This file contains the required javascript to connect the UI of the main
 *  view page & display the output nicely.
 *
 */

import { findMatches, sortMatches } from "./lib";
import { makeTableRow } from "./displayTable";

const buttonEl = document.getElementById("findMatchesButton");
const listOneEl = document.getElementById("listOne");
const listTwoEl = document.getElementById("listTwo");
const listOneCountEl = document.getElementById("listOne-count");
const listTwoCountEl = document.getElementById("listTwo-count");

const outputEl = document.getElementById("matchesOutput");

// Configuration options:
const cutoffValueEl = document.getElementById("cutoffValue");
const possibleMatchSeparatorEl = document.getElementById(
  "possibleMatchSeparator",
);

// The main button gets clicked:
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

    // Drop results below the threshold, and sort the remaining results by score:
    const sorted = sortMatches(matches, cutoff);

    // Now display them as rows in the table:
    const possibleMatchSeparatorValue = possibleMatchSeparatorEl.value;

    const output = sorted.map(([name, [score, possibleMatches]]) =>
      makeTableRow(name, score, possibleMatches, possibleMatchSeparatorValue),
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

// Make the two list inputs show a 'count' of rows, and trim their data
// when they lose focus:

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

// Validation for the cutoff value input:

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
