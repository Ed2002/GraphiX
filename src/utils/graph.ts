import type { GraphState, Vertex, Edge } from '../types';

let vertexCounter = 0;

export const COLOR_PALETTE: Record<number, string> = {
  1: '#ef4444', // vermelho
  2: '#3b82f6', // azul
  3: '#22c55e', // verde
  4: '#eab308', // amarelo
  5: '#a855f7', // roxo
  6: '#f97316', // laranja
  7: '#14b8a6', // teal
  8: '#ec4899', // rosa
};


/** Create a fresh graph state */
export function createGraph(directed: boolean): GraphState {
  return { vertices: [], edges: [], directed };
}

/** Add a vertex with a unique ID */
export function addVertex(graph: GraphState, label: string): GraphState {
  const trimmed = label.trim();
  if (!trimmed) return graph;

  const exists = graph.vertices.some(
    (v) => v.label.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return graph;

  vertexCounter += 1;
  const newVertex: Vertex = { id: `v${vertexCounter}`, label: trimmed };

  return {
    ...graph,
    vertices: [...graph.vertices, newVertex],
  };
}

/** Remove a vertex and all its connected edges */
export function removeVertex(graph: GraphState, vertexId: string): GraphState {
  return {
    ...graph,
    vertices: graph.vertices.filter((v) => v.id !== vertexId),
    edges: graph.edges.filter(
      (e) => e.from !== vertexId && e.to !== vertexId
    ),
  };
}

/** Add an edge between two vertices */
export function addEdge(
  graph: GraphState,
  from: string,
  to: string
): GraphState {
  if (from === to) return graph;

  const fromExists = graph.vertices.some((v) => v.id === from);
  const toExists = graph.vertices.some((v) => v.id === to);
  if (!fromExists || !toExists) return graph;

  const duplicate = graph.edges.some((e) => e.from === from && e.to === to);
  if (duplicate) return graph;

  // For undirected graphs, check reverse edge too
  if (!graph.directed) {
    const reverseDup = graph.edges.some(
      (e) => e.from === to && e.to === from
    );
    if (reverseDup) return graph;
  }

  const newEdge: Edge = { from, to };
  return {
    ...graph,
    edges: [...graph.edges, newEdge],
  };
}

/** Remove an edge between two vertices */
export function removeEdge(
  graph: GraphState,
  from: string,
  to: string
): GraphState {
  return {
    ...graph,
    edges: graph.edges.filter((e) => {
      if (e.from === from && e.to === to) return false;
      if (!graph.directed && e.from === to && e.to === from) return false;
      return true;
    }),
  };
}

/** Toggle between directed and undirected, removing reverse duplicate edges */
export function toggleDirected(graph: GraphState): GraphState {
  const newDirected = !graph.directed;

  if (!newDirected) {
    // Switching to undirected — remove reverse duplicates
    const seen = new Set<string>();
    const deduped: Edge[] = [];

    for (const edge of graph.edges) {
      const key1 = `${edge.from}-${edge.to}`;
      const key2 = `${edge.to}-${edge.from}`;
      if (!seen.has(key1) && !seen.has(key2)) {
        seen.add(key1);
        deduped.push(edge);
      }
    }

    return { ...graph, directed: newDirected, edges: deduped };
  }

  return { ...graph, directed: newDirected };
}

/** Build adjacency list from graph state */
export function getAdjacencyList(
  graph: GraphState
): Map<string, string[]> {
  const adj = new Map<string, string[]>();

  for (const v of graph.vertices) {
    adj.set(v.id, []);
  }

  for (const e of graph.edges) {
    adj.get(e.from)?.push(e.to);
    if (!graph.directed) {
      adj.get(e.to)?.push(e.from);
    }
  }

  return adj;
}

/** Build transposed adjacency list (reverse all edges) */
export function getTransposedAdjacencyList(
  graph: GraphState
): Map<string, string[]> {
  const adj = new Map<string, string[]>();

  for (const v of graph.vertices) {
    adj.set(v.id, []);
  }

  for (const e of graph.edges) {
    adj.get(e.to)?.push(e.from);
    if (!graph.directed) {
      adj.get(e.from)?.push(e.to);
    }
  }

  return adj;
}

/** Get vertex label by ID */
export function getVertexLabel(
  graph: GraphState,
  vertexId: string
): string {
  return graph.vertices.find((v) => v.id === vertexId)?.label ?? vertexId;
}

/** Reset vertex counter (useful for testing / reset) */
export function resetVertexCounter(): void {
  vertexCounter = 0;
}
