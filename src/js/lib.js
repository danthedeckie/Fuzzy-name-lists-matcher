function makeInitials(value) {
  //"Hello World" -> "H W"
  return value
    .split(" ")
    .map((word) => word[0])
    .join(" ");
}

export function makeVariations(value) {
  return [value, value.toLowerCase(), value.toUpperCase(), makeInitials(value)];
}

export function getScore(one, normalizedTwo) {
  variations = makeVariations(one);
  return variations.map((v) => normalizedTwo.has(v)).filter((v) => v == true)
    .length;
}

export function findMatches(listOne, listTwo) {
  const normalizedTwo = new Set();
  listTwo.forEach((two) => {
    makeVariations(two).forEach((v) => normalizedTwo.add(v));
  });

  return listOne.map((one) => [one, getScore(one, normalizedTwo)]);
}
