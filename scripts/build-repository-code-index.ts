import fs from 'fs';
import path from 'path';
import { Node, Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
  skipAddingFilesFromTsConfig: false,
});

function getTextWithoutExport(node: Node): string {
  if (!Node.isModifierable(node)) {
    return node.getText();
  }

  const hadExport = node.hasModifier('export');
  const hadDefault = node.hasModifier('default');

  if (hadExport) node.toggleModifier('export', false);
  if (hadDefault) node.toggleModifier('default', false);

  const text = node.getText();

  // IMPORTANT: revert changes
  if (hadExport) node.toggleModifier('export', true);
  if (hadDefault) node.toggleModifier('default', true);

  return text;
}
type FileResult = {
  source: string;
  functions: Record<string, string>;
  types: Record<string, string>;
  variables: Record<string, string>;
};

const result: Record<string, FileResult> = {};

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();

  const functions: Record<string, string> = {};
  const types: Record<string, string> = {};
  const variables: Record<string, string> = {};

  sourceFile.getFunctions().forEach((fn) => {
    const name = fn.getName();
    if (!name) return;

    functions[name] = getTextWithoutExport(fn);
  });

  sourceFile.getVariableDeclarations().forEach((v) => {
    const name = v.getName();
    const initializer = v.getInitializer();

    if (
      initializer &&
      (Node.isArrowFunction(initializer) ||
        Node.isFunctionExpression(initializer))
    ) {
      const stmt = v.getVariableStatement();
      if (stmt) {
        functions[name] = getTextWithoutExport(stmt);
      }
    }
  });

  sourceFile.getVariableDeclarations().forEach((t) => {
    if (t.getVariableStatement())
      variables[t.getName()] = getTextWithoutExport(
        t.getVariableStatement(),
      );
  });

  sourceFile.getTypeAliases().forEach((t) => {
    types[t.getName()] = getTextWithoutExport(t);
  });

  sourceFile.getInterfaces().forEach((i) => {
    types[i.getName()] = getTextWithoutExport(i);
  });

  if (Object.keys(functions).length || Object.keys(types).length) {
    result[path.relative(process.cwd(), filePath)] = {
      source: sourceFile.getFullText(),
      functions,
      types,
      variables,
    };
  }
}

fs.mkdirSync('data', { recursive: true });

fs.writeFileSync(
  path.join('data', 'repository-code-index.json'),
  JSON.stringify(result, null, 2),
  'utf-8',
);
