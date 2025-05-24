function cleanExpression(expr) {
  return expr
    .replace(/\s+/g, '')
    .replace(/([0-9a-zA-Z])\(/g, '$1*(')
    .replace(/\)\(/g, ')*(')
    .replace(/([)])([a-zA-Z0-9])/g, '$1*$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1*$2')
    .replace(/([0-9])\/([0-9a-zA-Z])/g, '$1/($2)');
}

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

function logStep(label, explanation, resultLatex) {
  const stepsList = document.getElementById("steps");

  const li = document.createElement("li");

  const labelSpan = document.createElement("span");
  labelSpan.className = "step-label";
  labelSpan.textContent = label;

  const explanationSpan = document.createElement("span");
  explanationSpan.className = "step-explanation";
  explanationSpan.textContent = explanation;

  const resultDiv = document.createElement("div");
  resultDiv.className = "step-result";
  resultDiv.innerHTML = katex.renderToString(resultLatex, { throwOnError: false });

  li.appendChild(labelSpan);
  li.appendChild(explanationSpan);
  li.appendChild(resultDiv);
  stepsList.appendChild(li);
}

function insertMathNote() {
  const mathField = document.getElementById("mathInput");
  const latex = mathField.getValue("latex");
  const notebook = document.getElementById("notebook");

  const span = document.createElement("span");
  span.innerHTML = katex.renderToString(latex, { throwOnError: false });
  notebook.appendChild(span);
  notebook.appendChild(document.createElement("br"));
}

async function solveWithSymPy() {
  const mathField = document.getElementById("mathInput");
  let equation = cleanExpression(mathField.getValue("ascii-math"));
  const katexDiv = document.getElementById("sympy-katex");

  const subsInput = document.getElementById("subs").getValue("ascii-math").trim();
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
        .replace(/^\[|\]$/g, '')
        .replace(/\.0+$/, '')
        .replace(/\*\*/g, '^')
        .replace(/\*/g, '');

      katex.render(`x = ${output}`, katexDiv, { throwOnError: false });

      const stepsList = document.getElementById("steps");
      stepsList.innerHTML = ''; // Clear previous steps
      logStep("Step 1:", "Solved equation", `x = ${output}`);
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
  let expression = cleanExpression(mathField.getValue("ascii-math"));
  const katexDiv = document.getElementById("sympy-katex");

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
      logStep("Step:", `${action} result`, output);
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
  if (mode === "solve") {
    solveWithSymPy();
  } else {
    applySymPy(mode);
  }
}

async function suggestNextStep() {
  const notebook = document.getElementById("notebook");
  const text = notebook.innerText.trim();
  const lastMathLine = text.split('\n').reverse().find(line => /=/.test(line));

  if (!lastMathLine) {
    alert("No recent equation found in notebook.");
    return;
  }

  const cleaned = cleanExpression(lastMathLine);

  try {
    const res = await fetch("http://127.0.0.1:5000/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equation: cleaned })
    });

    const data = await res.json();
    const suggestionText = data.suggestion || data.error || "No suggestion available.";

    const suggestionDiv = document.createElement("div");
    suggestionDiv.className = "notebook-suggestion";
    suggestionDiv.textContent = `💡 Suggestion: ${suggestionText}`;

    notebook.appendChild(suggestionDiv);
  } catch (err) {
    console.error(err);
    alert("Could not connect to suggestion server.");
  }
}
