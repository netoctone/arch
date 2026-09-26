import { GetFileDependencyGraphPayload } from 'arch-shared-types';
import Graph from 'graphology';

export interface NodeAttributes {
  x: number;
  y: number;
  label: string;
}

export interface EdgeAttributes {}

export type SigmaGraph = Graph<NodeAttributes, EdgeAttributes>;

export const buildSigmaGraphFromPayloadGraph = ({
  edges,
  nodes
}: GetFileDependencyGraphPayload): SigmaGraph => {
  const fileToDepth = new Map<string, number>(nodes.map(({ file, depth }) => [file, depth]));

  const graph = new Graph<NodeAttributes, EdgeAttributes>();
  let maxDepth = 0;
  const layerToWidth: number[] = [];
  for (const node of nodes) {
    maxDepth = Math.max(maxDepth, node.depth);
    layerToWidth[node.depth] = (layerToWidth[node.depth] || 0) + 1;
  }
  const layerNodesCount: number[] = [];
  for (const node of nodes) {
    const layerWidth = layerToWidth[node.depth] || 1;
    const newNodesCount = (layerNodesCount[node.depth] || 0) + 1;
    layerNodesCount[node.depth] = newNodesCount;

    const label = node.file.split('/').pop() || 'error';
    const dy = Math.abs((newNodesCount % 6) - 3) * (1000.0 / maxDepth / 5); // sine wave with period 6
    const y = 1000 - 2000.0 * (node.depth / maxDepth) + dy;
    const x = -1000 + 2000.0 * ((newNodesCount - 1) / layerWidth);
    const attrs: NodeAttributes = { x, y, label };
    graph.addNode(node.file, attrs);
  }
  for (const edge of edges) {
    if (graph.hasEdge(edge.parentFile, edge.childFile)) {
      continue;
    }
    const parentDepth = fileToDepth.get(edge.parentFile);
    const childDepth = fileToDepth.get(edge.childFile);
    graph.addEdge(edge.parentFile, edge.childFile, {
      type: 'arrow',
      color:
        !parentDepth || !childDepth || parentDepth < childDepth
          ? undefined
          : parentDepth === childDepth
            ? 'yellow'
            : 'red'
    });
  }
  return graph;
};
