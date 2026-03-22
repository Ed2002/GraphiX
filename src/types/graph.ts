// ─── Graph Data Types ───────────────────────────────────

export interface Vertex {
  id: string;
  label: string;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GraphState {
  vertices: Vertex[];
  edges: Edge[];
  directed: boolean;
}

// ─── Algorithm Types ────────────────────────────────────

export type AlgorithmType =
  | 'bfs'
  | 'dfs'
  | 'transitive-closure-direct'
  | 'transitive-closure-inverse'
  | 'connectivity'
  | 'kosaraju-scc';

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  startVertex: string;
  traversalOrder: string[];
  result: string | string[][] | boolean | Set<string>;
  timestamp: number;
}

// ─── Node Visual State ──────────────────────────────────

export type NodeState = 'default' | 'selected' | 'visiting' | 'visited' | 'unvisited';

// ─── Animation State ────────────────────────────────────

export interface AnimationState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number; // ms per step
  traversalOrder: string[];
  visitedSet: Set<string>;
}

// ─── Console Log Entry ──────────────────────────────────

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface ConsoleEntry {
  id: string;
  message: string;
  level: LogLevel;
  timestamp: number;
}
