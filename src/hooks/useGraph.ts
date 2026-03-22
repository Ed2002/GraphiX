import { useState, useCallback } from 'react';
import type { GraphState } from '../types';
import {
  createGraph,
  addVertex as addVertexFn,
  removeVertex as removeVertexFn,
  addEdge as addEdgeFn,
  removeEdge as removeEdgeFn,
  toggleDirected as toggleDirectedFn,
  resetVertexCounter,
} from '../utils';

export function useGraph(initialDirected = true) {
  const [graph, setGraph] = useState<GraphState>(() =>
    createGraph(initialDirected)
  );

  const addVertex = useCallback((label: string): boolean => {
    let added = false;
    setGraph((prev) => {
      const next = addVertexFn(prev, label);
      added = next !== prev;
      return next;
    });
    return added;
  }, []);

  const removeVertex = useCallback((vertexId: string) => {
    setGraph((prev) => removeVertexFn(prev, vertexId));
  }, []);

  const addEdge = useCallback((from: string, to: string): boolean => {
    let added = false;
    setGraph((prev) => {
      const next = addEdgeFn(prev, from, to);
      added = next !== prev;
      return next;
    });
    return added;
  }, []);

  const removeEdge = useCallback((from: string, to: string) => {
    setGraph((prev) => removeEdgeFn(prev, from, to));
  }, []);

  const toggleDirected = useCallback(() => {
    setGraph((prev) => toggleDirectedFn(prev));
  }, []);

  const resetGraph = useCallback(() => {
    resetVertexCounter();
    setGraph(createGraph(graph.directed));
  }, [graph.directed]);

  return {
    graph,
    addVertex,
    removeVertex,
    addEdge,
    removeEdge,
    toggleDirected,
    resetGraph,
  };
}
