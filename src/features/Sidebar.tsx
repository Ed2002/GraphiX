import { useState, type FormEvent } from 'react';
import type { GraphState } from '../types';
import { Button, Input, Select } from '../components';

interface SidebarProps {
  graph: GraphState;
  onAddVertex: (label: string) => boolean;
  onRemoveVertex: (id: string) => void;
  onAddEdge: (from: string, to: string) => boolean;
  onRemoveEdge: (from: string, to: string) => void;
  onToggleDirected: () => void;
  onReset: () => void;
}

export function Sidebar({
  graph,
  onAddVertex,
  onRemoveVertex,
  onAddEdge,
  onRemoveEdge,
  onToggleDirected,
  onReset,
}: SidebarProps) {
  const [vertexLabel, setVertexLabel] = useState('');
  const [edgeFrom, setEdgeFrom] = useState('');
  const [edgeTo, setEdgeTo] = useState('');
  const [vertexError, setVertexError] = useState('');
  const [edgeError, setEdgeError] = useState('');

  const vertexOptions = graph.vertices.map((v) => ({
    value: v.id,
    label: v.label,
  }));

  const handleAddVertex = (e: FormEvent) => {
    e.preventDefault();
    setVertexError('');
    if (!vertexLabel.trim()) {
      setVertexError('Vertex label is required');
      return;
    }
    const added = onAddVertex(vertexLabel);
    if (!added) {
      setVertexError('Vertex already exists');
      return;
    }
    setVertexLabel('');
  };

  const handleAddEdge = (e: FormEvent) => {
    e.preventDefault();
    setEdgeError('');
    if (!edgeFrom || !edgeTo) {
      setEdgeError('Select both vertices');
      return;
    }
    if (edgeFrom === edgeTo) {
      setEdgeError('Self-loops not allowed');
      return;
    }
    const added = onAddEdge(edgeFrom, edgeTo);
    if (!added) {
      setEdgeError('Edge already exists');
      return;
    }
    setEdgeFrom('');
    setEdgeTo('');
  };

  return (
    <aside className="w-[var(--sidebar-width)] min-w-[var(--sidebar-width)] h-full bg-bg-secondary border-r border-border-default flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="3" />
              <circle cx="5" cy="19" r="3" />
              <circle cx="19" cy="19" r="3" />
              <line x1="12" y1="8" x2="5" y2="16" />
              <line x1="12" y1="8" x2="19" y2="16" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary leading-tight">GraphiX</h1>
            <p className="text-[10px] text-text-muted tracking-wide uppercase">Graph Visualizer</p>
          </div>
        </div>
      </div>

      {/* Graph Mode Toggle */}
      <div className="px-5 py-3 border-b border-border-default">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Mode</span>
          <button
            onClick={onToggleDirected}
            className={`
              relative w-[120px] h-8 rounded-md border transition-all duration-200 cursor-pointer text-xs font-medium
              ${graph.directed
                ? 'bg-accent-muted border-accent/40 text-accent'
                : 'bg-success-muted border-success/40 text-success'
              }
            `}
          >
            {graph.directed ? '→ Directed' : '— Undirected'}
          </button>
        </div>
      </div>

      {/* Vertices Section */}
      <div className="px-5 py-4 border-b border-border-default">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Vertices
          <span className="ml-1.5 text-text-muted font-normal">({graph.vertices.length})</span>
        </h2>

        <form onSubmit={handleAddVertex} className="flex gap-2 mb-3">
          <div className="flex-1">
            <Input
              placeholder="Vertex label..."
              value={vertexLabel}
              onChange={(e) => {
                setVertexLabel(e.target.value);
                setVertexError('');
              }}
              error={vertexError}
              aria-label="Vertex label"
            />
          </div>
          <Button type="submit" size="sm" className="mt-auto h-[38px]">
            Add
          </Button>
        </form>

        {graph.vertices.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {graph.vertices.map((v) => (
              <div
                key={v.id}
                className="group flex items-center gap-1 px-2.5 py-1 bg-bg-elevated rounded-md border border-border-default text-xs text-text-primary hover:border-danger/50 transition-colors"
              >
                <span>{v.label}</span>
                <button
                  onClick={() => onRemoveVertex(v.id)}
                  className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger transition-opacity ml-0.5 cursor-pointer"
                  aria-label={`Remove vertex ${v.label}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edges Section */}
      <div className="px-5 py-4 border-b border-border-default">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Edges
          <span className="ml-1.5 text-text-muted font-normal">({graph.edges.length})</span>
        </h2>

        <form onSubmit={handleAddEdge} className="space-y-2 mb-3">
          <div className="grid grid-cols-2 gap-2">
            <Select
              label="From"
              options={vertexOptions}
              value={edgeFrom}
              onChange={(e) => {
                setEdgeFrom(e.target.value);
                setEdgeError('');
              }}
              placeholder="Origin"
            />
            <Select
              label="To"
              options={vertexOptions}
              value={edgeTo}
              onChange={(e) => {
                setEdgeTo(e.target.value);
                setEdgeError('');
              }}
              placeholder="Target"
            />
          </div>
          {edgeError && <p className="text-xs text-danger">{edgeError}</p>}
          <Button type="submit" size="sm" fullWidth>
            Add Edge
          </Button>
        </form>

        {graph.edges.length > 0 && (
          <div className="space-y-1">
            {graph.edges.map((e) => {
              const fromLabel = graph.vertices.find((v) => v.id === e.from)?.label ?? e.from;
              const toLabel = graph.vertices.find((v) => v.id === e.to)?.label ?? e.to;
              return (
                <div
                  key={`${e.from}-${e.to}`}
                  className="group flex items-center justify-between px-2.5 py-1.5 bg-bg-elevated rounded-md border border-border-default text-xs"
                >
                  <span className="text-text-primary">
                    {fromLabel}
                    <span className="mx-1.5 text-text-muted">
                      {graph.directed ? '→' : '—'}
                    </span>
                    {toLabel}
                  </span>
                  <button
                    onClick={() => onRemoveEdge(e.from, e.to)}
                    className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger transition-opacity cursor-pointer"
                    aria-label={`Remove edge ${fromLabel} to ${toLabel}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="px-5 py-4 mt-auto">
        <Button variant="danger" size="sm" fullWidth onClick={onReset}>
          Reset Graph
        </Button>
      </div>
    </aside>
  );
}
