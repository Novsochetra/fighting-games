const BLOCKS = new Set([
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'TryStatement',
  'SwitchStatement',
  'BlockStatement',
]);

const FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

const isFunctionBody = (node) => FUNCTIONS.has(node.parent?.type);

const spansLines = (node) => node.loc.end.line > node.loc.start.line;

function isMultiLineMethod(member) {
  const value = member.type === 'MethodDefinition' ? member.value : (member.value ?? member);

  return FUNCTIONS.has(value.type) && spansLines(member);
}

// A comment on a statement's own line belongs to it, so the blank line goes after the comment.
function lastOnLine(sourceCode, node) {
  let end = sourceCode.getLastToken(node);
  let after = sourceCode.getTokenAfter(end, { includeComments: true });

  while (after && after.loc.start.line === end.loc.end.line) {
    end = after;
    after = sourceCode.getTokenAfter(end, { includeComments: true });
  }

  return { end, after };
}

function requireGap(context, previous, messageId) {
  const { end, after } = lastOnLine(context.sourceCode, previous);

  if (!after || after.loc.start.line - end.loc.end.line > 1) {
    return;
  }

  context.report({
    loc: after.loc,
    messageId,
    fix: (fixer) => fixer.insertTextAfterRange(end.range, '\n'),
  });
}

function checkStatements(context, statements) {
  statements.slice(0, -1).forEach((statement) => {
    if (BLOCKS.has(statement.type)) {
      requireGap(context, statement, 'afterBlock');
    }
  });
}

function checkFinalReturn(context, body) {
  const last = body.body.at(-1);
  const previous = body.body.at(-2);

  if (last?.type === 'ReturnStatement' && previous && !BLOCKS.has(previous.type)) {
    requireGap(context, previous, 'beforeReturn');
  }
}

function checkMembers(context, members) {
  members.slice(0, -1).forEach((member, index) => {
    if (isMultiLineMethod(member) || isMultiLineMethod(members[index + 1])) {
      requireGap(context, member, 'betweenMethods');
    }
  });
}

export const blankLines = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: {
      description: 'Require the blank lines that split code into steps (docs/coding-style.md)',
    },
    messages: {
      afterBlock: 'Put a blank line after a block that closes with } when more code follows.',
      beforeReturn: 'Put a blank line before the final return of a function.',
      betweenMethods: 'Put a blank line between the methods of an object or a class.',
    },
    schema: [],
  },

  create(context) {
    const statementList = (node) => checkStatements(context, node.body);

    return {
      Program: statementList,
      StaticBlock: statementList,
      SwitchCase: (node) => checkStatements(context, node.consequent),

      BlockStatement(node) {
        checkStatements(context, node.body);

        if (isFunctionBody(node)) {
          checkFinalReturn(context, node);
        }
      },

      ObjectExpression: (node) => checkMembers(context, node.properties),
      ClassBody: (node) => checkMembers(context, node.body),
    };
  },
};
