import type { AlgorithmType, GraphState, AnimationState } from '../types';
import { Button, Select } from '../components';

interface AlgorithmPanelProps {
  graph: GraphState;
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algorithm: AlgorithmType) => void;
  startVertex: string;
  onSelectStartVertex: (vertexId: string) => void;
  animation: AnimationState;
  onSetSpeed: (speed: number) => void;
  onExecute: () => void;
  onStopAnimation: () => void;
  onResetAnimation: () => void;
}

const ALGORITHM_OPTIONS: { value: AlgorithmType; label: string }[] = [
  { value: 'bfs', label: 'BFS (Breadth-First Search)' },
  { value: 'dfs', label: 'DFS (Depth-First Search)' },
  { value: 'transitive-closure-direct', label: 'Transitive Closure (Direct)' },
  { value: 'transitive-closure-inverse', label: 'Transitive Closure (Inverse)' },
  { value: 'connectivity', label: 'Connectivity Check' },
  { value: 'kosaraju-scc', label: 'Strongly Connected Components' },
  { value: 'coloring', label: 'Graph Coloring' },
];

const SPEED_MARKS = [
  { value: 100, label: 'Fastest' },
  { value: 250, label: 'Fast' },
  { value: 500, label: 'Normal' },
  { value: 1000, label: 'Slow' },
  { value: 2000, label: 'Slowest' },
];

const needsStartVertex = (algo: AlgorithmType) =>
  ['bfs', 'dfs', 'transitive-closure-direct', 'transitive-closure-inverse'].includes(algo);

export function AlgorithmPanel({
  graph,
  selectedAlgorithm,
  onSelectAlgorithm,
  startVertex,
  onSelectStartVertex,
  animation,
  onSetSpeed,
  onExecute,
  onStopAnimation,
  onResetAnimation,
}: AlgorithmPanelProps) {
  const vertexOptions = graph.vertices.map((v) => ({
    value: v.id,
    label: v.label,
  }));

  const currentSpeedLabel =
    SPEED_MARKS.reduce((prev, curr) =>
      Math.abs(curr.value - animation.speed) < Math.abs(prev.value - animation.speed)
        ? curr
        : prev
    ).label;

  return (
    <div className="px-5 py-4 border-b border-border-default">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Algorithms
      </h2>

      <div className="space-y-3">
        <Select
          label="Algorithm"
          options={ALGORITHM_OPTIONS}
          value={selectedAlgorithm}
          onChange={(e) => onSelectAlgorithm(e.target.value as AlgorithmType)}
        />

        {needsStartVertex(selectedAlgorithm) && (
          <Select
            label="Start Vertex"
            options={vertexOptions}
            value={startVertex}
            onChange={(e) => onSelectStartVertex(e.target.value)}
            placeholder="Select vertex..."
          />
        )}

        {/* Speed Control */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-secondary">
              Animation Speed
            </label>
            <span className="text-[10px] text-text-muted">{currentSpeedLabel}</span>
          </div>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={animation.speed}
            onChange={(e) => onSetSpeed(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              bg-bg-elevated
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-accent
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-125
            "
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {animation.isRunning ? (
            <Button variant="danger" size="sm" fullWidth onClick={onStopAnimation}>
              ■ Stop
            </Button>
          ) : (
            <Button
              size="sm"
              fullWidth
              onClick={onExecute}
              disabled={graph.vertices.length === 0}
            >
              ▶ Execute
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetAnimation}
            disabled={animation.traversalOrder.length === 0}
          >
            ↺
          </Button>
        </div>

        {/* Animation Progress */}
        {animation.totalSteps > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>
                Step {animation.currentStep + 1} / {animation.totalSteps}
              </span>
              <span>{animation.isRunning ? 'Running...' : 'Complete'}</span>
            </div>
            <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{
                  width: `${((animation.currentStep + 1) / animation.totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
