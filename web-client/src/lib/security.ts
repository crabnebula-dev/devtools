import { CspEvaluator } from "csp_evaluator/dist/evaluator";
import { CspParser } from "csp_evaluator/dist/parser";

/**
 *
 * @TODO this is not being used yet.
 */

export function evaluateCSP(policy: string) {
  const { csp } = new CspParser(policy);

  const findings = new CspEvaluator(csp).evaluate();
  return findings.map(({ description }) => description);
}
