function convertToKaTeX(input) {
  // Turn (a)/(b) into \frac{a}{b}
  input = input.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
  return input;
}

function renderEquationLive() {
  const mathField = document.getElementById("mathInput");
  const rawInput = mathField.getValue("ascii-math");
  const output = document.getElementById("output");

  const formatted = convertToKaTeX(rawInput);

  try {
    katex.render(formatted, output, { throwOnError: false });
  } catch (err) {
    output.innerText = "Invalid equation!";
  }
}

function evaluateExpression() {
  const input = document.getElementById("mathInput").getValue("ascii-math");
  const resultDiv = document.getElementById("result");

  try {
    let cleaned = input
      .replace(/\s+/g, '')                     // remove spaces
      .replace(/\^/g, '**')                    // x^2 → x**2
      .replace(/([0-9])([a-zA-Z])/g, '$1*$2'); // 2x → 2*x

    let result;

    if (cleaned.includes('=')) {
      // Split and turn into symbolic math
      const [lhs, rhs] = cleaned.split('=');
      const equation = math.parse(lhs + ' - (' + rhs + ')');
      const simplified = math.simplify(equation);

      // Solve for x
      result = math.solve(simplified, 'x');
      resultDiv.innerText = `Solution: ${result.toString()}`;
    } else {
      // Basic calculation
      result = math.evaluate(cleaned);
      resultDiv.innerText = `Result: ${result}`;
    }
  } catch (err) {
    resultDiv.innerText = "⚠️ Invalid or unsupported expression.";
    console.error("Math.js Error:", err.message);
  }
}


window.addEventListener("DOMContentLoaded", () => {
  const mathField = document.getElementById("mathInput");

  mathField.addEventListener("input", () => {
    renderEquationLive();
  });

  mathField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      evaluateExpression();
    }
  });
});
