import { existsSync, readFileSync } from 'node:fs';
import { parseSync, type Program } from 'oxc-parser';
import { ResolverFactory } from 'oxc-resolver';
import path from 'path';

interface CliOptions {
  debug: boolean;
}

type Nodes = Set<string>;

interface DependencyEdge {
  parentFile: string;
  childFile: string;
}

const resolver = new ResolverFactory({
  conditionNames: ['node', 'import'],
  extensions: ['.ts'],
  roots: []
});

export const extractRelativeImports = (ast: Program): string[] => {
  const importPaths: string[] = [];
  for (const statementOrDir of ast.body) {
    if (statementOrDir.type === 'ImportDeclaration') {
      importPaths.push(statementOrDir.source.value);
    }
  }
  return importPaths;
};

// @param {string} filePath - absolute path
// @param edges - will mutate
// @param nodes - will mutate
export const parse = (
  filePath: string,
  cliOptions: CliOptions,
  edges: DependencyEdge[],
  nodes: Nodes,
  filesQueue: string[]
): void => {
  const exists = existsSync(filePath);
  if (cliOptions.debug) {
    console.log(`${exists ? '' : '(x) '}${filePath}`);
  }
  if (exists) {
    nodes.add(filePath);
    const bytes = readFileSync(filePath);
    const programAST: Program = parseSync(filePath, bytes.toString()).program;
    const importPaths = extractRelativeImports(programAST);
    for (const importPath of importPaths) {
      // resolveFileSync(filePath, ...).path depends on `filePath` argument format:
      // | filePath     | resolverRsult.path                                   |
      // | /some/path/? | /some/path/? (absolute remains)                      |
      // | ../../some/? | some/?       (relative drops '..')                   |
      // | some/path/?  | some/path/?  (relative that didn't have '../' is ok) |
      const resolverResult = resolver.resolveFileSync(filePath, importPath);
      // console.log(resolverResult.packageJsonPath);
      // console.log(resolverResult.error || resolverResult.path);
      if (cliOptions.debug) {
        console.log(`  ${resolverResult.path ? '' : '(x) '}${importPath}`);
      }
      const childFile = resolverResult.path;
      if (childFile) {
        edges.push({ parentFile: filePath, childFile: childFile });
        if (!nodes.has(childFile)) {
          filesQueue.push(childFile);
        }
      }
    }
  }
};

// @param {string} filePath - absolute path
export const parseQueue = (
  filePath: string,
  cliOptions: CliOptions
): { edges: DependencyEdge[]; nodes: string[] } => {
  const edges: DependencyEdge[] = [];
  const nodes: Nodes = new Set();

  const queue: string[] = [filePath];
  let file: string | undefined;
  while ((file = queue.shift())) {
    parse(file, cliOptions, edges, nodes, queue);
  }
  return { edges, nodes: Array.from(nodes) };
};

if (process.argv[2]) {
  parseQueue(path.resolve(process.argv[2]), { debug: process.argv.includes('--debug') });
}
