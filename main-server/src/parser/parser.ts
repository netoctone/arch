import { existsSync, readFileSync } from 'node:fs';
import { type DependencyEdge, type FileNode } from 'arch-shared-types';
import { parseSync, type Program } from 'oxc-parser';
import { ResolverFactory } from 'oxc-resolver';
import path from 'path';

interface CliOptions {
  debug: boolean;
}

type Nodes = Map<string, FileNode>;

const resolver = new ResolverFactory({
  conditionNames: ['node', 'import'],
  extensions: ['.ts', '.tsx'],
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

// @param node - has field `file` with absolute path, and `depth`
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
      // resolverResult.path depends on `filePath` argument format:
      // | filePath          | resolveFileSync(filePath, ...).path                  |
      // | /some/path/?      | /some/path/? (absolute remains)                      |
      // | ../../some/path/? | some/path/?  (relative drops '..')                   |
      // | some/path/?       | some/path/?  (relative that didn't have '../' is ok) |
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

// @param filePath - absolute path
const findPackageJson = (filePath: string): string | null => {
  let result: string | null = null;
  const parts = filePath.split('/');
  while (parts.length > 0) {
    parts.pop();
    const pathCandidate = `${parts.join('/')}/package.json`;
    if (existsSync(pathCandidate)) {
      result = pathCandidate;
    }
  }
  return result;
};

export const optimizeDepths = (
  rootFilePath: string,
  edges: DependencyEdge[],
  nodes: Nodes
): Nodes => {
  const parentToAllChildren: Map<string, string[]> = new Map();
  for (const edge of edges) {
    const allChildren = parentToAllChildren.get(edge.parentFile) || [];
    allChildren.push(edge.childFile);
    parentToAllChildren.set(edge.parentFile, allChildren);
  }

  const res: Nodes = new Map(nodes);

  const queue: string[] = [rootFilePath];
  let queueInd = 0;
  let parentFile: string | undefined;
  while ((parentFile = queue[queueInd++])) {
    const parentNode = res.get(parentFile);
    if (!parentNode) {
      continue;
    }
    const parentDepth = parentNode.depth;
    for (const childFile of parentToAllChildren.get(parentFile) || []) {
      const childNode = res.get(childFile);
      if (!childNode) {
        continue;
      }
      if (parentDepth >= childNode.depth) {
        childNode.depth = parentDepth + 1;
      }
      queue.push(childFile);
    }
  }
  return res;
};

// @param filePath - absolute path
export const parseQueue = (
  filePath: string,
  cliOptions: CliOptions
): { edges: DependencyEdge[]; nodes: FileNode[]; pathPackageJson: string | null } => {
  const edges: DependencyEdge[] = [];
  const nodes: Nodes = new Map();

  const queue: FileNode[] = [{ file: filePath, depth: 1 }];
  let queueInd = 0;
  let node: FileNode | undefined;
  while ((node = queue[queueInd++])) {
    parse(node, cliOptions, edges, nodes, queue);
  }
  const pathPackageJson = findPackageJson(filePath);
  const optimize = true;
  return {
    edges,
    nodes: Array.from(
      optimize
        ? // prettier
          optimizeDepths(filePath, edges, nodes).values()
        : nodes.values()
    ),
    pathPackageJson
  };
};

if (process.argv[2]) {
  parseQueue(path.resolve(process.argv[2]), { debug: process.argv.includes('--debug') });
}
