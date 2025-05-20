function convertToKaTeX(input) {
  // Turn (a)/(b) into \frac{a}{b}
  input = input.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
  return input;
}

function renderEquationLive() {
  const mathField = document.getElementById("mathInput");
  const latex = mathField.getValue("latex");  // <- this is the fix
  const output = document.getElementById("output");

  try {
    katex.render(latex, output, {
      throwOnError: false
    });
  } catch (err) {
    output.innerText = "Invalid equation!";
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

async function solveWithSymPy() {
  const mathField = document.getElementById("mathInput");
  let equation = mathField.getValue("ascii-math");  // raw input
  const resultDiv = document.getElementById("sympy-result");

  // 🔧 Fix: Add explicit multiplication (2x → 2*x)
  equation = equation.replace(/\s+/g, '');                    // remove spaces
  equation = equation.replace(/([0-9])([a-zA-Z])/g, '$1*$2'); // 2x → 2*x

  try {
    const res = await fetch("http://127.0.0.1:5000/solve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ equation: equation, variable: 'x' })
    });

    const data = await res.json();

    if (data.solution) {
      resultDiv.innerText = `SymPy Solution: ${data.solution.join(', ')}`;
    } else if (data.error) {
      resultDiv.innerText = `Error: ${data.error}`;
    }
  } catch (err) {
    resultDiv.innerText = "⚠️ Could not connect to SymPy server.";
    console.error(err);
  }
}
