import { existsSync, readFileSync } from 'node:fs';
import { parseSync, type Program } from 'oxc-parser';
import { ResolverFactory } from 'oxc-resolver';
import path from 'path';

interface CliOptions {
  debug: boolean;
}

interface FileNode {
  file: string;
  depth: number;
}

type Nodes = Map<string, FileNode>;

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
// @param cliOptions
// @param edges - will mutate
// @param nodes - will mutate
// @param filesQueue - will mutate
export const parse = (
  node: FileNode,
  cliOptions: CliOptions,
  edges: DependencyEdge[],
  nodes: Nodes,
  filesQueue: FileNode[]
): void => {
  const { file: filePath, depth } = node;
  const nextDepth = depth + 1;
  if (nodes.has(filePath)) {
    return;
  }
  const exists = existsSync(filePath);
  if (cliOptions.debug) {
    console.log(`${exists ? '' : '(x) '}${filePath}`);
  }
  if (exists) {
    nodes.set(filePath, { file: filePath, depth: depth });
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
          filesQueue.push({ file: childFile, depth: nextDepth });
        }
      }
    }
  }
};

// @param {string} filePath - absolute path
export const parseQueue = (
  filePath: string,
  cliOptions: CliOptions
): { edges: DependencyEdge[]; nodes: FileNode[] } => {
  const edges: DependencyEdge[] = [];
  const nodes: Nodes = new Map();

  const queue: FileNode[] = [{ file: filePath, depth: 0 }];
  let node: FileNode | undefined;
  while ((node = queue.shift())) {
    parse(node, cliOptions, edges, nodes, queue);
  }
  return { edges, nodes: Array.from(nodes.values()) };
};

if (process.argv[2]) {
  parseQueue(path.resolve(process.argv[2]), { debug: process.argv.includes('--debug') });
}
