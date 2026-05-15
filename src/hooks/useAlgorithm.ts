import { useState, useCallback, useRef, useEffect } from 'react';
import type { AlgorithmType, AlgorithmResult, AnimationState, GraphState, ConsoleEntry } from '../types';
import {
  getAdjacencyList,
  getTransposedAdjacencyList,
  getVertexLabel,
  bfs,
  dfs,
  transitiveClosureDirect,
  transitiveClosureInverse,
  isConnected,
  kosarajuSCC,
} from '../utils';
import { coloring } from '../utils/algorithms';

const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  'bfs': 'BFS (Breadth-First Search)',
  'dfs': 'DFS (Depth-First Search)',
  'transitive-closure-direct': 'Transitive Closure (Direct)',
  'transitive-closure-inverse': 'Transitive Closure (Inverse)',
  'connectivity': 'Connectivity Check',
  'kosaraju-scc': 'Strongly Connected Components',
  'coloring': 'Graph Coloring',
};


let entryIdCounter = 0;
function createEntry(message: string, level: ConsoleEntry['level']): ConsoleEntry {
  entryIdCounter += 1;
  return { id: `log-${entryIdCounter}`, message, level, timestamp: Date.now() };
}

export function useAlgorithm(graph: GraphState) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bfs');
  const [startVertex, setStartVertex] = useState<string>('');
  const [results, setResults] = useState<AlgorithmResult[]>([]);
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);

  const [animation, setAnimation] = useState<AnimationState>({
    isRunning: false,
    currentStep: -1,
    totalSteps: 0,
    speed: 500,
    traversalOrder: [],
    visitedSet: new Set(),
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((message: string, level: ConsoleEntry['level'] = 'info') => {
    setLogs((prev) => [...prev, createEntry(message, level)]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAnimation((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setAnimation((prev) => ({ ...prev, speed }));
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();
    setAnimation({
      isRunning: false,
      currentStep: -1,
      totalSteps: 0,
      speed: animation.speed,
      traversalOrder: [],
      visitedSet: new Set(),
      coloringMap: new Map(),
      coloringOrder: []
    });
  }, [stopAnimation, animation.speed]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const runAnimation = useCallback((order: string[], speed: number) => {
    stopAnimation();

    if (order.length === 0) return;

    setAnimation({
      isRunning: true,
      currentStep: 0,
      totalSteps: order.length,
      speed,
      traversalOrder: order,
      visitedSet: new Set([order[0]]),
    });

    let step = 0;

    intervalRef.current = setInterval(() => {
      step += 1;

      if (step >= order.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setAnimation((prev) => ({
          ...prev,
          isRunning: false,
          currentStep: order.length - 1,
        }));
        return;
      }

      setAnimation((prev) => {
        const newVisited = new Set(prev.visitedSet);
        newVisited.add(order[step]);
        return {
          ...prev,
          currentStep: step,
          visitedSet: newVisited,
        };
      });
    }, speed);
  }, [stopAnimation]);

  const runColoringAnimation = useCallback(
    (coloringResult: Map<string, number>, speed: number) => {
      stopAnimation();

      const coloringOrder = Array.from(coloringResult.keys());

      if (coloringOrder.length === 0) return;

      const firstVertex = coloringOrder[0];
      const firstColor = coloringResult.get(firstVertex);

      const initialColoringMap = new Map<string, number>();

      if (firstColor !== undefined) {
        initialColoringMap.set(firstVertex, firstColor);
      }

      setAnimation({
        isRunning: true,
        currentStep: 0,
        totalSteps: coloringOrder.length,
        speed,
        traversalOrder: coloringOrder,
        visitedSet: new Set([firstVertex]),
        coloringMap: initialColoringMap,
        coloringOrder,
      });

      let step = 0;

      intervalRef.current = setInterval(() => {
        step += 1;

        if (step >= coloringOrder.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);

          intervalRef.current = null;

          setAnimation((prev) => ({
            ...prev,
            isRunning: false,
            currentStep: coloringOrder.length - 1,
          }));

          return;
        }

        const currentVertex = coloringOrder[step];
        const currentColor = coloringResult.get(currentVertex);

        setAnimation((prev) => {
          const newVisited = new Set(prev.visitedSet);
          const newColoringMap = new Map(prev.coloringMap ?? []);

          newVisited.add(currentVertex);

          if (currentColor !== undefined) {
            newColoringMap.set(currentVertex, currentColor);
          }

          return {
            ...prev,
            currentStep: step,
            visitedSet: newVisited,
            coloringMap: newColoringMap,
          };
        });
      }, speed);
    },
    [stopAnimation]
  );

  const execute = useCallback(() => {
    const adj = getAdjacencyList(graph);
    const transAdj = getTransposedAdjacencyList(graph);
    const vertexIds = graph.vertices.map((v) => v.id);

    console.log("adj", adj);

    const needsStart = ['bfs', 'dfs', 'transitive-closure-direct', 'transitive-closure-inverse'].includes(selectedAlgorithm);

    if (needsStart && !startVertex) {
      addLog('⚠️ Please select a start vertex.', 'warning');
      return;
    }

    if (graph.vertices.length === 0) {
      addLog('⚠️ Graph is empty. Add vertices first.', 'warning');
      return;
    }

    const label = getVertexLabel(graph, startVertex);
    addLog(`▶ Running ${ALGORITHM_LABELS[selectedAlgorithm]}${needsStart ? ` from "${label}"` : ''}...`, 'info');

    let result: AlgorithmResult;

    switch (selectedAlgorithm) {
      case 'bfs': {
        const order = bfs(adj, startVertex);
        const labels = order.map((id) => getVertexLabel(graph, id));
        addLog(`✓ BFS order: ${labels.join(' → ')}`, 'success');
        result = { algorithm: 'bfs', startVertex, traversalOrder: order, result: labels.join(' → '), timestamp: Date.now() };
        runAnimation(order, animation.speed);
        break;
      }

      case 'dfs': {
        const order = dfs(adj, startVertex);
        const labels = order.map((id) => getVertexLabel(graph, id));
        addLog(`✓ DFS order: ${labels.join(' → ')}`, 'success');
        result = { algorithm: 'dfs', startVertex, traversalOrder: order, result: labels.join(' → '), timestamp: Date.now() };
        runAnimation(order, animation.speed);
        break;
      }

      case 'transitive-closure-direct': {
        const closure = transitiveClosureDirect(adj, startVertex);
        const labels = [...closure].map((id) => getVertexLabel(graph, id));
        addLog(
          labels.length > 0
            ? `✓ Reachable from "${label}": {${labels.join(', ')}}`
            : `✓ No vertices reachable from "${label}"`,
          'success'
        );
        result = { algorithm: 'transitive-closure-direct', startVertex, traversalOrder: [...closure], result: closure, timestamp: Date.now() };
        runAnimation([startVertex, ...closure], animation.speed);
        break;
      }

      case 'transitive-closure-inverse': {
        const closure = transitiveClosureInverse(transAdj, startVertex);
        const labels = [...closure].map((id) => getVertexLabel(graph, id));
        addLog(
          labels.length > 0
            ? `✓ Vertices that reach "${label}": {${labels.join(', ')}}`
            : `✓ No vertices can reach "${label}"`,
          'success'
        );
        result = { algorithm: 'transitive-closure-inverse', startVertex, traversalOrder: [...closure], result: closure, timestamp: Date.now() };
        runAnimation([startVertex, ...closure], animation.speed);
        break;
      }

      case 'connectivity': {
        // For undirected: simple connectivity. For directed: check weak connectivity (on undirected version)
        let connected: boolean;
        if (graph.directed) {
          // Build undirected version for weak connectivity
          const undirAdj = new Map<string, string[]>();
          for (const v of vertexIds) undirAdj.set(v, []);
          for (const e of graph.edges) {
            undirAdj.get(e.from)?.push(e.to);
            undirAdj.get(e.to)?.push(e.from);
          }
          connected = isConnected(undirAdj, graph.vertices.length);
        } else {
          connected = isConnected(adj, graph.vertices.length);
        }
        addLog(
          connected
            ? '✓ Graph is connected'
            : '✗ Graph is NOT connected',
          connected ? 'success' : 'warning'
        );
        result = { algorithm: 'connectivity', startVertex: '', traversalOrder: [], result: connected, timestamp: Date.now() };
        break;
      }

      case 'kosaraju-scc': {
        if (!graph.directed) {
          addLog('⚠️ Kosaraju SCC requires a directed graph.', 'warning');
          return;
        }
        const components = kosarajuSCC(adj, transAdj, vertexIds);
        const labeledComponents = components.map(
          (comp) => comp.map((id) => getVertexLabel(graph, id))
        );
        addLog(`✓ Found ${components.length} SCC(s):`, 'success');
        labeledComponents.forEach((comp, i) => {
          addLog(`   Component ${i + 1}: {${comp.join(', ')}}`, 'info');
        });
        result = { algorithm: 'kosaraju-scc', startVertex: '', traversalOrder: vertexIds, result: labeledComponents, timestamp: Date.now() };
        break;
      }

      case 'coloring': {
        const resultado = coloring(adj);

        const labels = Array.from(resultado.entries()).map(([vertexId, color]) => {
          const vertexLabel = getVertexLabel(graph, vertexId);
          return `${vertexLabel}: cor ${color}`;
        });

        addLog(`✓ Coloring result: ${labels.join(' | ')}`, 'success');

        result = {
          algorithm: 'coloring',
          startVertex: '',
          traversalOrder: Array.from(resultado.keys()),
          result: labels.join(' | '),
          timestamp: Date.now(),
        };

        runColoringAnimation(resultado, animation.speed);

        break;
      }
    }

    setResults((prev) => [result, ...prev]);
  }, [graph, selectedAlgorithm, startVertex, addLog, runAnimation, runColoringAnimation, animation.speed]);

  return {
    selectedAlgorithm,
    setSelectedAlgorithm,
    startVertex,
    setStartVertex,
    results,
    logs,
    addLog,
    clearLogs,
    animation,
    setSpeed,
    stopAnimation,
    resetAnimation,
    execute,
  };
}
