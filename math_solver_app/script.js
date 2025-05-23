function renderEquationLive() {
  const mathField = document.getElementById("mathInput");
  const latex = mathField.getValue("latex");
  const output = document.getElementById("output");

  try {
    katex.render(latex, output, { throwOnError: false });
  } catch (err) {
    output.innerText = "Invalid equation!";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const mathField = document.getElementById("mathInput");

  mathField.addEventListener("input", renderEquationLive);
  mathField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      solveWithSymPy();
    }
  });
});

async function solveWithSymPy() {
  const mathField = document.getElementById("mathInput");
  let equation = mathField.getValue("ascii-math");
  const katexDiv = document.getElementById("sympy-katex");

  equation = equation.replace(/\s+/g, '');
  equation = equation.replace(/([0-9])([a-zA-Z])/g, '$1*$2');

  const subsInput = document.getElementById("subs").value.trim();
  const substitutions = {};
  if (subsInput) {
    subsInput.split(',').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) substitutions[key.trim()] = value.trim();
    });
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equation, variable: 'x', substitutions })
    });

    const data = await res.json();

    if (data.solution) {
      let output = String(data.solution)
        .replace(/^\[|\]$/g, '')  // remove brackets
        .replace(/\.0+$/, '')     // clean decimals
        .replace(/\*\*/g, '^')    // exponents
        .replace(/\*/g, '');      // multiplication
      katex.render(output, katexDiv, { throwOnError: false });
    } else if (data.error) {
      katexDiv.innerHTML = `❌ ${data.error}`;
    }
  } catch (err) {
    katexDiv.innerHTML = "⚠️ Could not connect to SymPy server.";
    console.error(err);
  }
}

async function applySymPy(action) {
  const mathField = document.getElementById("mathInput");
  let expression = mathField.getValue("ascii-math");
  const katexDiv = document.getElementById("sympy-katex");

  expression = expression.replace(/\s+/g, '');
  expression = expression.replace(/([0-9])([a-zA-Z])/g, '$1*$2');

  try {
    const res = await fetch("http://127.0.0.1:5000/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression, action })
    });

    const data = await res.json();

    if (data.result) {
      let output = String(data.result)
        .replace(/^\[|\]$/g, '')
        .replace(/\.0+$/, '')
        .replace(/\*\*/g, '^')
        .replace(/\*/g, '');
      katex.render(output, katexDiv, { throwOnError: false });
    } else if (data.error) {
      katexDiv.innerHTML = `❌ ${data.error}`;
    }
  } catch (err) {
    katexDiv.innerHTML = "⚠️ Could not connect to SymPy server.";
    console.error(err);
  }
}

function runSelectedMode() {
  const mode = document.getElementById("mode").value;
  if (mode === "solve" || mode === "substitute") {
    solveWithSymPy();
  } else {
    applySymPy(mode);
  }
}
