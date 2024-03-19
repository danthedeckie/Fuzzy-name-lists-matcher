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
