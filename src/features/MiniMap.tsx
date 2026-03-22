import { useMemo } from 'react';
import type { GraphState } from '../types';

interface MiniMapProps {
  graph: GraphState;
}

const MINI_W = 160;
const MINI_H = 120;
const NODE_R = 4;

export function MiniMap({ graph }: MiniMapProps) {
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const count = graph.vertices.length;
    if (count === 0) return map;

    const cx = MINI_W / 2;
    const cy = MINI_H / 2;
    const radius = Math.min(cx, cy) * 0.65;

    if (count === 1) {
      map.set(graph.vertices[0].id, { x: cx, y: cy });
      return map;
    }

    graph.vertices.forEach((v, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      map.set(v.id, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    });

    return map;
  }, [graph.vertices]);

  if (graph.vertices.length === 0) return null;

  return (
    <div className="absolute bottom-12 right-4 z-20">
      <div className="bg-bg-secondary/90 backdrop-blur-sm border border-border-default rounded-lg p-2 shadow-lg">
        <div className="text-[9px] text-text-muted mb-1 text-center uppercase tracking-wider font-medium">
          Mini Map
        </div>
        <svg
          width={MINI_W}
          height={MINI_H}
          viewBox={`0 0 ${MINI_W} ${MINI_H}`}
          className="rounded"
        >
          <rect width={MINI_W} height={MINI_H} fill="var(--color-bg-primary)" rx="4" />

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
                strokeWidth="0.8"
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
                r={NODE_R}
                fill="var(--color-node-default)"
                opacity="0.8"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
