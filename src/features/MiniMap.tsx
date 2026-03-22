import type { GraphState } from '../types';

interface MiniMapProps {
  graph: GraphState;
  positions: Map<string, { x: number; y: number }>;
  pan: { x: number; y: number };
  zoom: number;
}

const MINI_W = 160;
const MINI_H = 120;

export function MiniMap({ graph, positions, pan, zoom }: MiniMapProps) {
  if (graph.vertices.length === 0) return null;

  const canvasWidth = 800;
  const canvasHeight = 600;

  let minX = 0;
  let minY = 0;
  let maxX = canvasWidth;
  let maxY = canvasHeight;

  positions.forEach((pos) => {
    if (pos.x < minX) minX = pos.x;
    if (pos.y < minY) minY = pos.y;
    if (pos.x > maxX) maxX = pos.x;
    if (pos.y > maxY) maxY = pos.y;
  });

  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const w = maxX - minX;
  const h = maxY - minY;

  const vpX = -pan.x / zoom;
  const vpY = -pan.y / zoom;
  const vpW = canvasWidth / zoom;
  const vpH = canvasHeight / zoom;

  return (
    <div className="absolute bottom-12 right-4 z-20">
      <div className="bg-bg-secondary/90 backdrop-blur-sm border border-border-default rounded-lg p-2 shadow-lg">
        <div className="text-[9px] text-text-muted mb-1 text-center uppercase tracking-wider font-medium">
          Mini Map
        </div>
        <svg
          width={MINI_W}
          height={MINI_H}
          viewBox={`${minX} ${minY} ${w} ${h}`}
          className="rounded bg-bg-primary overflow-hidden"
        >
          {/* Edges */}
          {graph.edges.map((edge) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;

            return (
              <line
                key={`mini-${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--color-edge-default)"
                strokeWidth={w * 0.005}
                opacity="0.5"
              />
            );
          })}

          {/* Nodes */}
          {graph.vertices.map((v) => {
            const pos = positions.get(v.id);
            if (!pos) return null;

            return (
              <circle
                key={`mini-${v.id}`}
                cx={pos.x}
                cy={pos.y}
                r={w * 0.015}
                fill="var(--color-node-default)"
                opacity="0.8"
              />
            );
          })}

          {/* Viewport Box */}
          <rect
            x={vpX}
            y={vpY}
            width={vpW}
            height={vpH}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={w * 0.005}
            opacity="0.8"
          />
        </svg>
      </div>
    </div>
  );
}
