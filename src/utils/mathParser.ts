/**
 * Safely evaluates simple mathematical expressions in real-time.
 * Supports +, -, *, /, parenthesis (), and decimals.
 */
export function safeEvaluate(expr: string): number {
  const clean = expr.replace(/[^0-9+\-*/().]/g, '');
  if (!clean) return 0;

  try {
    let index = 0;

    function parseExpression(): number {
      let result = parseTerm();
      while (index < clean.length) {
        const op = clean[index];
        if (op === '+' || op === '-') {
          index++;
          const term = parseTerm();
          if (op === '+') result += term;
          else result -= term;
        } else {
          break;
        }
      }
      return result;
    }

    function parseTerm(): number {
      let result = parseFactor();
      while (index < clean.length) {
        const op = clean[index];
        if (op === '*' || op === '/') {
          index++;
          const factor = parseFactor();
          if (op === '*') result *= factor;
          else {
            if (factor === 0) throw new Error('Division by zero');
            result /= factor;
          }
        } else {
          break;
        }
      }
      return result;
    }

    function parseFactor(): number {
      if (index >= clean.length) return 0;

      let isNegative = false;
      if (clean[index] === '-') {
        isNegative = true;
        index++;
      } else if (clean[index] === '+') {
        index++;
      }

      if (index >= clean.length) return 0;

      let result = 0;
      if (clean[index] === '(') {
        index++; // consume '('
        result = parseExpression();
        if (clean[index] === ')') {
          index++; // consume ')'
        }
      } else {
        const start = index;
        while (index < clean.length && /[0-9.]/.test(clean[index])) {
          index++;
        }
        const numStr = clean.substring(start, index);
        result = parseFloat(numStr);
        if (isNaN(result)) result = 0;
      }

      return isNegative ? -result : result;
    }

    const finalResult = parseExpression();
    return Number(finalResult.toFixed(6)); // avoid floating point issues
  } catch (e) {
    console.error('Math evaluation failed for expr:', expr, e);
    return NaN;
  }
}
