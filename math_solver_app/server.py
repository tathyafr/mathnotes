from flask import Flask, request, jsonify
from sympy import symbols, Eq, solve, sympify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)



@app.route("/solve", methods=["POST"])
def solve_equation():
    data = request.json
    equation_str = data.get("equation", "")
    variable = data.get("variable", "x")

    try:
        lhs, rhs = equation_str.split("=")
        x = symbols(variable)
        equation = Eq(sympify(lhs), sympify(rhs))
        solution = solve(equation, x)
        return jsonify({"solution": [str(s) for s in solution]})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
