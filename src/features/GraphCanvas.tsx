import { useMemo } from 'react';
import type { GraphState, AnimationState } from '../types';

interface GraphCanvasProps {
  graph: GraphState;
  animation: AnimationState;
}

interface NodePosition {
  x: number;
  y: number;
}

function computePositions(
  vertices: GraphState['vertices'],
  width: number,
  height: number
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const count = vertices.length;

  if (count === 0) return positions;

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) * 0.65;

  if (count === 1) {
    positions.set(vertices[0].id, { x: cx, y: cy });
    return positions;
  }

  vertices.forEach((v, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.set(v.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  return positions;
}

function getNodeColor(vertexId: string, animation: AnimationState): string {
  if (animation.traversalOrder.length === 0) return 'var(--color-node-default)';

  const currentVertexId = animation.traversalOrder[animation.currentStep];

  if (vertexId === currentVertexId) return 'var(--color-node-visiting)';
  if (animation.visitedSet.has(vertexId)) return 'var(--color-node-visited)';

  // If animation has started, unvisited nodes in the traversal get dim color
  if (animation.traversalOrder.includes(vertexId)) return 'var(--color-node-unvisited)';

  return 'var(--color-node-default)';
}

function getNodeGlow(vertexId: string, animation: AnimationState): string {
  if (animation.traversalOrder.length === 0) return 'none';

  const currentVertexId = animation.traversalOrder[animation.currentStep];
  if (vertexId === currentVertexId) {
    return '0 0 16px 4px rgba(251, 191, 36, 0.4)';
  }
  return 'none';
}

const NODE_RADIUS = 24;
const ARROW_SIZE = 10;
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;

export function GraphCanvas({ graph, animation }: GraphCanvasProps) {
  const positions = useMemo(
    () => computePositions(graph.vertices, SVG_WIDTH, SVG_HEIGHT),
    [graph.vertices]
  );

  const markerId = 'arrowhead';
  const markerHighlightId = 'arrowhead-highlight';

  return (
    <div className="flex-1 flex flex-col bg-bg-primary relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-text-muted) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Empty state */}
      {graph.vertices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-secondary border border-border-default flex items-center justify-center">
              <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="5" cy="19" r="2.5" />
                <circle cx="19" cy="19" r="2.5" />
                <line x1="12" y1="7.5" x2="5" y2="16.5" />
                <line x1="12" y1="7.5" x2="19" y2="16.5" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-text-secondary mb-1">No graph yet</h3>
            <p className="text-xs text-text-muted">Add vertices from the sidebar to get started</p>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-full relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Arrow marker for directed edges */}
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-edge-default)" />
          </marker>
          <marker
            id={markerHighlightId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-edge-highlight)" />
          </marker>

          {/* Node glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {graph.edges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) return null;

          // Shorten line to stop at node boundary
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;

          const offsetFrom = NODE_RADIUS / dist;
          const offsetTo = (NODE_RADIUS + (graph.directed ? ARROW_SIZE : 0)) / dist;

          const x1 = from.x + dx * offsetFrom;
          const y1 = from.y + dy * offsetFrom;
          const x2 = to.x - dx * offsetTo;
          const y2 = to.y - dy * offsetTo;

          // Determine if this edge is highlighted
          const isHighlighted =
            animation.visitedSet.has(edge.from) && animation.visitedSet.has(edge.to);

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHighlighted ? 'var(--color-edge-highlight)' : 'var(--color-edge-default)'}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              opacity={isHighlighted ? 1 : 0.6}
              markerEnd={graph.directed ? `url(#${isHighlighted ? markerHighlightId : markerId})` : undefined}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s, opacity 0.3s' }}
            />
          );
        })}

        {/* Nodes */}
        {graph.vertices.map((vertex) => {
          const pos = positions.get(vertex.id);
          if (!pos) return null;

          const fill = getNodeColor(vertex.id, animation);
          const glow = getNodeGlow(vertex.id, animation);
          const isVisiting =
            animation.traversalOrder[animation.currentStep] === vertex.id;

          return (
            <g key={vertex.id}>
              {/* Outer glow ring */}
              {isVisiting && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS + 6}
                  fill="none"
                  stroke="var(--color-node-visiting)"
                  strokeWidth="2"
                  opacity="0.4"
                  style={{
                    animation: 'node-visit 0.6s ease-in-out',
                  }}
                />
              )}

              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_RADIUS}
                fill={fill}
                stroke={fill}
                strokeWidth="2"
                opacity="0.9"
                filter={isVisiting ? 'url(#glow)' : undefined}
                style={{
                  transition: 'fill 0.3s, opacity 0.3s',
                  filter: glow !== 'none' ? `drop-shadow(${glow})` : undefined,
                }}
              />

              {/* Label */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="12"
                fontWeight="600"
                fontFamily="var(--font-sans)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {vertex.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Graph info bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-bg-secondary/80 backdrop-blur-sm border-t border-border-subtle text-[10px] text-text-muted">
        <span>{graph.vertices.length} vertices · {graph.edges.length} edges</span>
        <span>{graph.directed ? 'Directed' : 'Undirected'} Graph</span>
      </div>
    </div>
  );
}
