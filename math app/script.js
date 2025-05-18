function renderEquation() {
  const input = document.getElementById("mathInput").getValue("ascii-math");
  const output = document.getElementById("output");

  try {
    katex.render(input, output, {
      throwOnError: false
    });
  } catch (err) {
    output.innerText = "Invalid equation!";
  }
}

function convertToKaTeX(input) {
  // Convert any (a)/(b) into \frac{a}{b}
  input = input.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
  return input;
}

function renderEquation() {
  const mathField = document.getElementById("mathInput");
  const rawInput = mathField.getValue("ascii-math");

  const output = document.getElementById("output");

  const formatted = convertToKaTeX(rawInput);

  try {
    katex.render(formatted, output, {
      throwOnError: false
    });
  } catch (err) {
    output.innerText = "Invalid equation!";
  }
}
