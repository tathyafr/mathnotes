from flask import Flask, request, jsonify
from flask_cors import CORS
from sympy import symbols, Eq, solve, sympify

app = Flask(__name__)
CORS(app)  # ✅ This enables cross-origin requests from your frontend

@app.route("/solve", methods=["POST"])
def solve_equation():
    data = request.json
    expr_str = data.get("equation", "")
    substitutions = data.get("substitutions", {})
    variable = data.get("variable", "x")

    try:
        if "=" in expr_str:
            lhs, rhs = expr_str.split("=")
            lhs_expr = sympify(lhs)
            rhs_expr = sympify(rhs)

            if substitutions:
                subs_dict = {symbols(k): float(v) for k, v in substitutions.items()}
                lhs_expr = lhs_expr.subs(subs_dict)
                rhs_expr = rhs_expr.subs(subs_dict)

            eq = Eq(lhs_expr, rhs_expr)
            result = solve(eq, symbols(variable))
        else:
            expr = sympify(expr_str)
            if substitutions:
                subs_dict = {symbols(k): float(v) for k, v in substitutions.items()}
                expr = expr.subs(subs_dict)
            result = expr

        return jsonify({"solution": str(result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/transform", methods=["POST"])
def transform_expression():
    data = request.json
    expression = data.get("expression", "")
    action = data.get("action", "")

    try:
        expr = sympify(expression)
        if action == "simplify":
            result = expr.simplify()
        elif action == "expand":
            result = expr.expand()
        elif action == "factor":
            result = expr.factor()
        else:
            return jsonify({"error": "Invalid action"}), 400

        return jsonify({"result": str(result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("Starting Flask app...")
    app.run(debug=True)
