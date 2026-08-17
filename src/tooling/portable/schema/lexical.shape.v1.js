export const PORTABLE_LEXICAL_SHAPE_PROFILE_V1 = 'tiinex.lexical.shape.v1';

const RESERVED_IDENTIFIERS = new Set(['SPACE', 'TAB', 'CR', 'LF', 'DIGIT', 'ASCII-LETTER', 'ANY', 'ANY-EXCEPT']);
const SIMPLE_BUILTINS = new Set(['SPACE', 'TAB', 'CR', 'LF', 'DIGIT', 'ASCII-LETTER', 'ANY']);

export function compileLexicalShapeV1(input = {}) {
  const startRule = exact(input.startRule);
  const grammarRules = Array.isArray(input.grammarRules) ? input.grammarRules.map(String) : [];
  const findings = [];
  const rules = [];
  const byName = new Map();

  if (!grammarRules.length) findings.push('At least one Grammar Rule is required.');
  for (let index = 0; index < grammarRules.length; index += 1) {
    const source = grammarRules[index];
    try {
      const parsed = parseGrammarRule(source);
      if (RESERVED_IDENTIFIERS.has(parsed.name)) throw new GrammarError(`Grammar Rule identifier is reserved: ${parsed.name}.`);
      if (byName.has(parsed.name)) throw new GrammarError(`Duplicate Grammar Rule identifier: ${parsed.name}.`);
      const rule = { name: parsed.name, source, expression: parsed.expression };
      byName.set(parsed.name, rule);
      rules.push(rule);
    } catch (error) {
      findings.push(`Grammar Rule ${index + 1}: ${messageOf(error)}`);
    }
  }

  if (!startRule) findings.push('Start Rule is required.');
  else if (!byName.has(startRule)) findings.push(`Start Rule does not resolve to a declared Grammar Rule: ${startRule}.`);

  if (!findings.length) {
    for (const rule of rules) {
      for (const reference of collectReferences(rule.expression)) {
        if (!byName.has(reference)) findings.push(`Undefined local Grammar Rule reference: ${reference}.`);
      }
    }
  }
  if (!findings.length) findings.push(...detectCycles(rules));

  const frozenRules = Object.freeze(rules.map((rule) => Object.freeze({
    name: rule.name,
    source: rule.source,
    expression: freezeNode(rule.expression)
  })));
  return Object.freeze({
    profile: PORTABLE_LEXICAL_SHAPE_PROFILE_V1,
    qualification: findings.length ? 'structurally-invalid' : 'valid',
    startRule,
    grammarRules: frozenRules,
    findings: Object.freeze(findings)
  });
}

export function qualifyLexicalShapeV1(compiled = {}, value = '') {
  if (compiled?.qualification !== 'valid') return Object.freeze({ qualification: 'unresolved' });
  const rules = new Map((compiled.grammarRules || []).map((rule) => [rule.name, rule.expression]));
  const start = rules.get(compiled.startRule);
  if (!start) return Object.freeze({ qualification: 'unresolved' });
  const scalars = [...String(value ?? '')];
  const memo = new WeakMap();
  const positions = matchNode(start, 0, scalars, rules, memo);
  return Object.freeze({ qualification: positions.has(scalars.length) ? 'matched' : 'not-matched' });
}

function parseGrammarRule(source = '') {
  const tokens = tokenizeGrammar(source);
  const parser = new Parser(tokens);
  const name = parser.takeIdentifier('Grammar Rule identifier');
  parser.expect('=');
  const expression = parser.parseExpression(new Set(['eof']));
  parser.expect('eof');
  return { name, expression };
}

function tokenizeGrammar(source = '') {
  const text = String(source ?? '');
  const tokens = [];
  let index = 0;
  while (index < text.length) {
    const ch = text[index];
    if (ch === ' ' || ch === '\t') { index += 1; continue; }
    if (isForbiddenMetaWhitespace(ch)) throw new GrammarError(`Unsupported grammar-source whitespace U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}.`);
    if (ch === '"') {
      const parsed = readQuotedLiteral(text, index);
      tokens.push({ type: 'literal', value: parsed.value });
      index = parsed.next;
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      let end = index + 1;
      while (end < text.length && /[A-Za-z0-9-]/.test(text[end])) end += 1;
      tokens.push({ type: 'identifier', value: text.slice(index, end) });
      index = end;
      continue;
    }
    if ('?*+|(),='.includes(ch)) {
      tokens.push({ type: ch, value: ch });
      index += 1;
      continue;
    }
    throw new GrammarError(`Unsupported grammar token: ${ch}.`);
  }
  tokens.push({ type: 'eof', value: '' });
  return tokens;
}

function readQuotedLiteral(text, start) {
  let index = start + 1;
  let value = '';
  while (index < text.length) {
    const ch = text[index];
    if (ch === '"') return { value, next: index + 1 };
    if (ch !== '\\') {
      value += ch;
      index += 1;
      continue;
    }
    if (index + 1 >= text.length) throw new GrammarError('Unterminated quoted-literal escape.');
    const escaped = text[index + 1];
    if (escaped === '"') value += '"';
    else if (escaped === '\\') value += '\\';
    else if (escaped === 't') value += '\t';
    else if (escaped === 'r') value += '\r';
    else if (escaped === 'n') value += '\n';
    else throw new GrammarError(`Invalid quoted-literal escape: \\${escaped}.`);
    index += 2;
  }
  throw new GrammarError('Unterminated quoted literal.');
}

class Parser {
  constructor(tokens) { this.tokens = tokens; this.index = 0; }
  peek() { return this.tokens[this.index] || { type: 'eof', value: '' }; }
  take() { const token = this.peek(); this.index += 1; return token; }
  expect(type) {
    const token = this.peek();
    if (token.type !== type) throw new GrammarError(`Expected ${display(type)} but found ${display(token.type)}.`);
    return this.take();
  }
  takeIdentifier(label = 'identifier') {
    const token = this.peek();
    if (token.type !== 'identifier') throw new GrammarError(`Expected ${label}.`);
    return this.take().value;
  }
  parseExpression(stops = new Set(['eof'])) {
    if (stops.has(this.peek().type) || this.peek().type === '|') throw new GrammarError('Expression must not be empty.');
    const alternatives = [this.parseConcatenation(stops)];
    while (this.peek().type === '|') {
      this.take();
      if (stops.has(this.peek().type) || this.peek().type === '|') throw new GrammarError('Alternation sides must not be empty.');
      alternatives.push(this.parseConcatenation(stops));
    }
    return alternatives.length === 1 ? alternatives[0] : { type: 'alternation', alternatives };
  }
  parseConcatenation(stops) {
    const parts = [];
    while (!stops.has(this.peek().type) && this.peek().type !== '|') parts.push(this.parsePostfix());
    if (!parts.length) throw new GrammarError('Concatenation must not be empty.');
    return parts.length === 1 ? parts[0] : { type: 'concatenation', parts };
  }
  parsePostfix() {
    const atom = this.parseAtom();
    let quantifier = '';
    if (['?', '*', '+'].includes(this.peek().type)) quantifier = this.take().type;
    if (['?', '*', '+'].includes(this.peek().type)) throw new GrammarError('A postfix-expression permits at most one postfix quantifier.');
    return quantifier ? { type: 'repeat', quantifier, expression: atom } : atom;
  }
  parseAtom() {
    const token = this.peek();
    if (token.type === 'literal') { this.take(); return { type: 'literal', value: token.value }; }
    if (token.type === '(') {
      this.take();
      if (this.peek().type === ')') throw new GrammarError('Parenthesized expression must not be empty.');
      const expression = this.parseExpression(new Set([')']));
      this.expect(')');
      return expression;
    }
    if (token.type !== 'identifier') throw new GrammarError(`Expected expression atom but found ${display(token.type)}.`);
    const name = this.take().value;
    if (name === 'ANY-EXCEPT') return this.parseAnyExcept();
    if (SIMPLE_BUILTINS.has(name)) return { type: 'builtin', name };
    return { type: 'reference', name };
  }
  parseAnyExcept() {
    this.expect('(');
    const exclusions = [];
    if (this.peek().type === ')') throw new GrammarError('ANY-EXCEPT requires one or more exclusions.');
    while (true) {
      const token = this.peek();
      if (token.type === 'literal') {
        this.take();
        if ([...token.value].length !== 1) throw new GrammarError('ANY-EXCEPT quoted exclusions must contain exactly one Unicode scalar.');
        exclusions.push(token.value);
      } else if (token.type === 'identifier' && ['SPACE', 'TAB', 'CR', 'LF'].includes(token.value)) {
        this.take();
        exclusions.push(builtinScalar(token.value));
      } else {
        throw new GrammarError('ANY-EXCEPT exclusion must be a one-scalar quoted literal or SPACE/TAB/CR/LF.');
      }
      if (this.peek().type === ',') { this.take(); continue; }
      break;
    }
    this.expect(')');
    return { type: 'any-except', exclusions };
  }
}

function matchNode(node, pos, scalars, rules, memo) {
  let perNode = memo.get(node);
  if (!perNode) { perNode = new Map(); memo.set(node, perNode); }
  if (perNode.has(pos)) return perNode.get(pos);
  const out = new Set();
  perNode.set(pos, out);

  if (node.type === 'literal') {
    const literal = [...node.value];
    if (matchesAt(scalars, pos, literal)) out.add(pos + literal.length);
  } else if (node.type === 'builtin') {
    if (pos < scalars.length && builtinMatches(node.name, scalars[pos])) out.add(pos + 1);
  } else if (node.type === 'any-except') {
    if (pos < scalars.length && !node.exclusions.includes(scalars[pos])) out.add(pos + 1);
  } else if (node.type === 'reference') {
    const target = rules.get(node.name);
    if (target) addAll(out, matchNode(target, pos, scalars, rules, memo));
  } else if (node.type === 'alternation') {
    for (const alternative of node.alternatives) addAll(out, matchNode(alternative, pos, scalars, rules, memo));
  } else if (node.type === 'concatenation') {
    let positions = new Set([pos]);
    for (const part of node.parts) {
      const next = new Set();
      for (const current of positions) addAll(next, matchNode(part, current, scalars, rules, memo));
      positions = next;
      if (!positions.size) break;
    }
    addAll(out, positions);
  } else if (node.type === 'repeat') {
    if (node.quantifier === '?') {
      out.add(pos);
      addAll(out, matchNode(node.expression, pos, scalars, rules, memo));
    } else if (node.quantifier === '*') {
      addAll(out, repetitionClosure(node.expression, new Set([pos]), scalars, rules, memo));
    } else if (node.quantifier === '+') {
      const first = matchNode(node.expression, pos, scalars, rules, memo);
      addAll(out, repetitionClosure(node.expression, first, scalars, rules, memo));
    }
  }
  return out;
}

function repetitionClosure(expression, seeds, scalars, rules, memo) {
  const seen = new Set(seeds);
  const queue = [...seeds];
  while (queue.length) {
    const pos = queue.shift();
    for (const next of matchNode(expression, pos, scalars, rules, memo)) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return seen;
}

function builtinMatches(name, scalar) {
  if (name === 'SPACE') return scalar === ' ';
  if (name === 'TAB') return scalar === '\t';
  if (name === 'CR') return scalar === '\r';
  if (name === 'LF') return scalar === '\n';
  if (name === 'DIGIT') return /^[0-9]$/.test(scalar);
  if (name === 'ASCII-LETTER') return /^[A-Za-z]$/.test(scalar);
  if (name === 'ANY') return true;
  return false;
}

function builtinScalar(name) {
  if (name === 'SPACE') return ' ';
  if (name === 'TAB') return '\t';
  if (name === 'CR') return '\r';
  if (name === 'LF') return '\n';
  return '';
}

function matchesAt(scalars, pos, literal) {
  if (pos + literal.length > scalars.length) return false;
  for (let index = 0; index < literal.length; index += 1) if (scalars[pos + index] !== literal[index]) return false;
  return true;
}

function collectReferences(node, out = new Set()) {
  if (!node) return out;
  if (node.type === 'reference') out.add(node.name);
  else if (node.type === 'alternation') for (const child of node.alternatives) collectReferences(child, out);
  else if (node.type === 'concatenation') for (const child of node.parts) collectReferences(child, out);
  else if (node.type === 'repeat') collectReferences(node.expression, out);
  return out;
}

function detectCycles(rules = []) {
  const graph = new Map(rules.map((rule) => [rule.name, [...collectReferences(rule.expression)]]));
  const visiting = new Set();
  const visited = new Set();
  const findings = [];
  function visit(name, stack = []) {
    if (visiting.has(name)) {
      findings.push(`Cyclic Grammar Rule reference: ${[...stack, name].join(' -> ')}.`);
      return;
    }
    if (visited.has(name)) return;
    visiting.add(name);
    for (const next of graph.get(name) || []) if (graph.has(next)) visit(next, [...stack, name]);
    visiting.delete(name);
    visited.add(name);
  }
  for (const name of graph.keys()) visit(name, []);
  return unique(findings);
}

function freezeNode(node = {}) {
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'alternation') return Object.freeze({ type: node.type, alternatives: Object.freeze(node.alternatives.map(freezeNode)) });
  if (node.type === 'concatenation') return Object.freeze({ type: node.type, parts: Object.freeze(node.parts.map(freezeNode)) });
  if (node.type === 'repeat') return Object.freeze({ type: node.type, quantifier: node.quantifier, expression: freezeNode(node.expression) });
  if (node.type === 'any-except') return Object.freeze({ type: node.type, exclusions: Object.freeze([...node.exclusions]) });
  return Object.freeze({ ...node });
}

function isForbiddenMetaWhitespace(ch) {
  if (ch === '\r' || ch === '\n') return true;
  if (ch === ' ' || ch === '\t') return false;
  return /^\s$/u.test(ch);
}

function addAll(target, source) { for (const item of source || []) target.add(item); }
function exact(value = '') { return String(value || '').trim(); }
function display(type = '') { return type === 'eof' ? 'end of grammar rule' : `token ${type}`; }
function messageOf(error) { return error instanceof Error ? error.message : String(error); }
function unique(values = []) { return [...new Set(values)]; }
class GrammarError extends Error {}
