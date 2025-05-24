from flask import Flask, request, jsonify
from sympy import symbols, Eq, solve, sympify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

            expr = Eq(lhs_expr, rhs_expr)
            result = solve(expr, symbols(variable))
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
    

@app.route("/suggest", methods=["POST"])
def suggest_step():
    data = request.json
    expr_str = data.get("equation", "")

    try:
        if "=" in expr_str:
            lhs, rhs = expr_str.split("=")
            lhs_expr = sympify(lhs)
            rhs_expr = sympify(rhs)

            diff = lhs_expr - rhs_expr
            symbols_in_expr = list(diff.free_symbols)

            if len(symbols_in_expr) == 1:
                var = symbols_in_expr[0]
                terms = diff.as_ordered_terms()

                if len(terms) >= 2:
                    return jsonify({"suggestion": f"Move all terms involving {var} to one side"})

            return jsonify({"suggestion": "Isolate the variable or simplify both sides"})
        else:
            return jsonify({"suggestion": "No equation to solve"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    print("Starting Flask app...")
    app.run(debug=True)
