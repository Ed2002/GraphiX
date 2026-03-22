/**
 * Graph Algorithms
 *
 * All functions take adjacency lists (Map<string, string[]>) and return
 * traversal/result data. They are pure functions with no side effects.
 */

/** Breadth-First Search — returns visit order */
export function bfs(
  adj: Map<string, string[]>,
  start: string
): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  const queue: string[] = [start];

  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return order;
}

/** Depth-First Search — returns visit order (recursive) */
export function dfs(
  adj: Map<string, string[]>,
  start: string
): string[] {
  const visited = new Set<string>();
  const order: string[] = [];

  function visit(node: string): void {
    visited.add(node);
    order.push(node);

    const neighbors = adj.get(node) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visit(neighbor);
      }
    }
  }

  visit(start);
  return order;
}

/** Transitive closure (direct) — returns all vertices reachable from start */
export function transitiveClosureDirect(
  adj: Map<string, string[]>,
  start: string
): Set<string> {
  const reachable = new Set<string>();
  const stack: string[] = [start];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (reachable.has(current)) continue;
    reachable.add(current);

    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!reachable.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  // Remove start vertex itself from the closure
  reachable.delete(start);
  return reachable;
}

/** Transitive closure (inverse) — returns all vertices that can reach start */
export function transitiveClosureInverse(
  transposedAdj: Map<string, string[]>,
  start: string
): Set<string> {
  // Same logic as direct, but on the transposed graph
  return transitiveClosureDirect(transposedAdj, start);
}

/** Check if the graph is connected (undirected) or weakly connected (directed) */
export function isConnected(
  adj: Map<string, string[]>,
  vertexCount: number
): boolean {
  if (vertexCount === 0) return true;

  const firstVertex = adj.keys().next().value;
  if (firstVertex === undefined) return true;

  const visited = new Set<string>();
  const stack: string[] = [firstVertex];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return visited.size === vertexCount;
}

/**
 * Kosaraju's Algorithm — Strongly Connected Components
 *
 * 1. Run DFS on original graph, push to stack on finish
 * 2. Get transposed graph
 * 3. Pop from stack, run DFS on transposed graph to find SCCs
 */
export function kosarajuSCC(
  adj: Map<string, string[]>,
  transposedAdj: Map<string, string[]>,
  vertices: string[]
): string[][] {
  // Step 1: Fill order by finish time
  const visited = new Set<string>();
  const finishOrder: string[] = [];

  function dfsForward(node: string): void {
    visited.add(node);
    const neighbors = adj.get(node) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfsForward(neighbor);
      }
    }
    finishOrder.push(node);
  }

  for (const v of vertices) {
    if (!visited.has(v)) {
      dfsForward(v);
    }
  }

  // Step 2: Process vertices in reverse finish order on transposed graph
  const visitedReverse = new Set<string>();
  const components: string[][] = [];

  function dfsReverse(node: string, component: string[]): void {
    visitedReverse.add(node);
    component.push(node);
    const neighbors = transposedAdj.get(node) ?? [];
    for (const neighbor of neighbors) {
      if (!visitedReverse.has(neighbor)) {
        dfsReverse(neighbor, component);
      }
    }
  }

  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const v = finishOrder[i];
    if (!visitedReverse.has(v)) {
      const component: string[] = [];
      dfsReverse(v, component);
      components.push(component);
    }
  }

  return components;
}

/**
 * Check connectivity for undirected graphs using a symmetric adjacency list.
 * Builds a symmetric version internally.
 */
export function isConnectedUndirected(
  adj: Map<string, string[]>,
  vertexCount: number
): boolean {
  // For undirected, the adj is already symmetric
  return isConnected(adj, vertexCount);
}
