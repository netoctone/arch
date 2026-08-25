export interface FileNode {
  file: string;
  depth: number;
}

export interface DependencyEdge {
  parentFile: string;
  childFile: string;
}

export interface GetFileDependencyGraphPayload {
  nodes: FileNode[];
  edges: DependencyEdge[];
}

export interface GetFilePayload {
  file: string;
  text: string;
}
