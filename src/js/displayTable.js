/* Various UI drawing helper functions */

function scoreClass(value) {
  if (value > 98.5) {
    return "certain";
  }
  if (value > 35) {
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

export function makeTableRow(
  name,
  score,
  possibleMatches,
  possibleMatchSeparatorValue,
) {
  return `<tr class="${scoreClass(score)}">
        <td>${name}</td>
        <td><div class="matchoptions">${possibleMatches
          .map(makeMatchDisplay)
          .join(
            ` <span class="joiner" aria-label="or" role="separator">${possibleMatchSeparatorValue}</span> `,
          )}</div></td>
        <td class="score">${score.toFixed(2)}</td>
      </tr>`;
}
