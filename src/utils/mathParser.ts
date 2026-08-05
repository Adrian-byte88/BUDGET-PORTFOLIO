/**
 * Safely evaluates simple mathematical expressions in real-time.
 * Supports +, -, *, /, parenthesis (), and decimals.
 * Automatically strips commas formatted as thousands separators (e.g. 34,007.89).
 */
export function safeEvaluate(expr: string): number {
  if (!expr) return 0;
  const cleanCommas = String(expr).replace(/,/g, '');
  const clean = cleanCommas.replace(/[^0-9+\-*/().]/g, '');
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

/**
 * Parses numbers with optional commas (e.g. "34,007.89", "1,250,000", "₱34,007.89")
 * into a valid JS number. Returns 0 if invalid.
 */
export function parseFormattedNumber(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).replace(/,/g, '').trim();
  const res = safeEvaluate(str);
  if (!isNaN(res)) return res;
  const num = Number(str.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}
