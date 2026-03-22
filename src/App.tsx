import { useGraph, useAlgorithm } from './hooks';
import { Sidebar, AlgorithmPanel, GraphCanvas, ResultsConsole, MiniMap } from './features';
import './index.css';

function App() {
  const {
    graph,
    addVertex,
    removeVertex,
    addEdge,
    removeEdge,
    toggleDirected,
    resetGraph,
  } = useGraph(true);

  const {
    selectedAlgorithm,
    setSelectedAlgorithm,
    startVertex,
    setStartVertex,
    logs,
    clearLogs,
    animation,
    setSpeed,
    stopAnimation,
    resetAnimation,
    execute,
  } = useAlgorithm(graph);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      {/* Sidebar */}
      <div className="flex flex-col h-full">
        <Sidebar
          graph={graph}
          onAddVertex={addVertex}
          onRemoveVertex={removeVertex}
          onAddEdge={addEdge}
          onRemoveEdge={removeEdge}
          onToggleDirected={toggleDirected}
          onReset={resetGraph}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-bg-secondary border-b border-border-default">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-text-primary">Canvas</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-elevated rounded-full border border-border-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {graph.vertices.length} V
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-elevated rounded-full border border-border-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-info" />
                {graph.edges.length} E
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-node-default)' }} />
              Default
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-node-visiting)' }} />
              Visiting
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--color-node-visited)' }} />
              Visited
            </span>
          </div>
        </div>

        {/* Canvas + Results */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 relative min-h-0 z-0">
            <GraphCanvas graph={graph} animation={animation} />
            <MiniMap graph={graph} />
          </div>
          <div className="relative z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] bg-bg-secondary">
            <ResultsConsole logs={logs} onClear={clearLogs} />
          </div>
        </div>
      </div>

      {/* Right Panel — Algorithm Controls */}
      <div className="w-[280px] min-w-[280px] h-full bg-bg-secondary border-l border-border-default overflow-y-auto">
        <div className="px-5 py-3 border-b border-border-default">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Analysis
          </h2>
        </div>
        <AlgorithmPanel
          graph={graph}
          selectedAlgorithm={selectedAlgorithm}
          onSelectAlgorithm={setSelectedAlgorithm}
          startVertex={startVertex}
          onSelectStartVertex={setStartVertex}
          animation={animation}
          onSetSpeed={setSpeed}
          onExecute={execute}
          onStopAnimation={stopAnimation}
          onResetAnimation={resetAnimation}
        />

        {/* Graph Properties */}
        <div className="px-5 py-4">
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Properties
          </h2>
          <div className="space-y-2">
            <PropertyRow label="Type" value={graph.directed ? 'Directed' : 'Undirected'} />
            <PropertyRow label="Vertices" value={String(graph.vertices.length)} />
            <PropertyRow label="Edges" value={String(graph.edges.length)} />
            <PropertyRow
              label="Density"
              value={
                graph.vertices.length > 1
                  ? `${(
                      (graph.edges.length /
                        (graph.vertices.length *
                          (graph.vertices.length - 1) *
                          (graph.directed ? 1 : 0.5))) *
                      100
                    ).toFixed(1)}%`
                  : '—'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 bg-bg-elevated rounded-md text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}

export default App;
