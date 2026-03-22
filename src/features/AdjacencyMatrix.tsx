import type { GraphState } from '../types';
import { getAdjacencyList } from '../utils';

interface AdjacencyMatrixProps {
  graph: GraphState;
}

export function AdjacencyMatrix({ graph }: AdjacencyMatrixProps) {
  if (graph.vertices.length === 0) {
    return (
      <div className="text-xs text-text-muted text-center py-4 bg-bg-elevated rounded-md border border-border-default">
        Add vertices to view the adjacency matrix
      </div>
    );
  }

  const adjList = getAdjacencyList(graph);
  
  const size = graph.vertices.length;
  const matrix: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  const vIndex = new Map(graph.vertices.map((v, i) => [v.id, i]));
  
  graph.vertices.forEach((v, i) => {
    const neighbors = adjList.get(v.id) || [];
    neighbors.forEach((neighborId) => {
      const j = vIndex.get(neighborId);
      if (j !== undefined) {
        matrix[i][j] = 1;
      }
    });
  });

  return (
    <div className="overflow-x-auto rounded-md border border-border-default bg-bg-elevated max-h-[300px] overflow-y-auto custom-scrollbar">
      <table className="w-full text-xs text-center border-collapse">
        <thead className="bg-bg-secondary sticky top-0 z-20">
          <tr>
            <th className="p-1.5 border-b border-r border-border-default sticky left-0 z-30 bg-bg-secondary w-8 shadow-[1px_0_0_var(--color-border-default)]">
              {/* Empty top-left cell */}
            </th>
            {graph.vertices.map((v) => (
              <th 
                key={`col-${v.id}`} 
                className="p-1.5 border-b border-border-default font-semibold text-text-primary min-w-[32px] truncate max-w-[64px]"
                title={v.label}
              >
                {v.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {graph.vertices.map((v, i) => (
            <tr key={`row-${v.id}`} className="hover:bg-bg-hover transition-colors">
              <th 
                className="p-1.5 border-r border-border-default bg-bg-secondary sticky left-0 z-10 font-semibold text-text-primary max-w-[64px] truncate shadow-[1px_0_0_var(--color-border-default)]"
                title={v.label}
              >
                {v.label}
              </th>
              {matrix[i].map((val, j) => {
                const isEdge = val === 1;
                return (
                  <td 
                    key={`cell-${i}-${j}`} 
                    className={`
                      p-1.5 border-b border-border-subtle
                      ${isEdge ? 'text-accent font-bold bg-accent-muted/30' : 'text-text-muted/40 font-normal'}
                    `}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
