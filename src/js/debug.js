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
 *  This file contains the required javascript for the 'debug.html' testing view.
 *
 */

import {
  normalise,
  makeStemmed,
  makeVariations,
  getScore,
  makeMatchesMap,
} from "./lib";

const normaliseInputEl = document.getElementById("normaliseInput");
const normaliseOutputEl = document.getElementById("normaliseOutput");

normaliseInputEl.addEventListener("input", () => {
  normaliseOutputEl.innerHTML = normalise(normaliseInputEl.value);
});

const makeStemmedInputEl = document.getElementById("makeStemmedInput");
const makeStemmedOutputEl = document.getElementById("makeStemmedOutput");

makeStemmedInputEl.addEventListener("input", () => {
  makeStemmedOutputEl.innerHTML = makeStemmed(makeStemmedInputEl.value);
});

const makeVariationsInputEl = document.getElementById("makeVariationsInput");
const makeVariationsOutputEl = document.getElementById("makeVariationsOutput");

makeVariationsInputEl.addEventListener("input", () => {
  makeVariationsOutputEl.innerHTML = makeVariations(
    makeVariationsInputEl.value,
  ).join("<br>");
});

const getScoreInputEl = document.getElementById("getScoreInput");
const getScoreSearchInput = document.getElementById("getScoreSearchInput");
const getScoreOutputEl = document.getElementById("getScoreOutput");

function updateMatchesMapOutput() {
  getScoreOutputEl.innerHTML = getScore(
    getScoreInputEl.value,
    makeMatchesMap(getScoreSearchInput.value.trim().split(/\r?\n/)),
  ).join("<br>");
}

getScoreInputEl.addEventListener("input", updateMatchesMapOutput);
getScoreSearchInput.addEventListener("input", updateMatchesMapOutput);
