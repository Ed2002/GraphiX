import capitalsData from '../../assets/capitais.json';
import roadDistancesData from '../../assets/distancias_capitais.json';
import straightLineData from '../../assets/distancias_em_linha_reta_de_capitais.json';

export interface BrazilCity {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface CongestionSegment {
  from: string;
  to: string;
  multiplier: number;
}

export interface AStarStep {
  iteration: number;
  current: string;
  open: string[];
  closed: string[];
}

export interface AStarScenarioResult {
  success: boolean;
  path: string[];
  totalCost: number;
  steps: AStarStep[];
}

interface StraightLineFile {
  distancias: Record<string, Record<string, number>>;
}

const CITY_COORDINATES: Record<string, Omit<BrazilCity, 'id'>> = {
  aracaju: { label: 'Aracaju', latitude: -10.9472, longitude: -37.0731 },
  belem: { label: 'Belém', latitude: -1.4558, longitude: -48.4902 },
  'belo horizonte': { label: 'Belo Horizonte', latitude: -19.9167, longitude: -43.9345 },
  'boa vista': { label: 'Boa Vista', latitude: 2.8235, longitude: -60.6758 },
  brasilia: { label: 'Brasília', latitude: -15.7939, longitude: -47.8828 },
  'campo grande': { label: 'Campo Grande', latitude: -20.4697, longitude: -54.6201 },
  cuiaba: { label: 'Cuiabá', latitude: -15.6014, longitude: -56.0979 },
  curitiba: { label: 'Curitiba', latitude: -25.4284, longitude: -49.2733 },
  florianopolis: { label: 'Florianópolis', latitude: -27.5949, longitude: -48.5482 },
  fortaleza: { label: 'Fortaleza', latitude: -3.7319, longitude: -38.5267 },
  goiania: { label: 'Goiânia', latitude: -16.6864, longitude: -49.2643 },
  'joao pessoa': { label: 'João Pessoa', latitude: -7.1195, longitude: -34.845 },
  macapa: { label: 'Macapá', latitude: 0.0349, longitude: -51.0694 },
  maceio: { label: 'Maceió', latitude: -9.6498, longitude: -35.7089 },
  manaus: { label: 'Manaus', latitude: -3.119, longitude: -60.0217 },
  natal: { label: 'Natal', latitude: -5.7945, longitude: -35.211 },
  palmas: { label: 'Palmas', latitude: -10.2491, longitude: -48.3243 },
  'porto alegre': { label: 'Porto Alegre', latitude: -30.0346, longitude: -51.2177 },
  'porto velho': { label: 'Porto Velho', latitude: -8.7608, longitude: -63.8999 },
  recife: { label: 'Recife', latitude: -8.0476, longitude: -34.877 },
  'rio branco': { label: 'Rio Branco', latitude: -9.9754, longitude: -67.8249 },
  'rio de janeiro': { label: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  salvador: { label: 'Salvador', latitude: -12.9777, longitude: -38.5016 },
  'sao luis': { label: 'São Luís', latitude: -2.5391, longitude: -44.2829 },
  'sao paulo': { label: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
  teresina: { label: 'Teresina', latitude: -5.0892, longitude: -42.8019 },
  vitoria: { label: 'Vitória', latitude: -20.3155, longitude: -40.3128 },
};

export interface BrazilGraphData {
  cities: BrazilCity[];
  adjacency: Map<string, Map<string, number>>;
  straightLine: Map<string, Map<string, number>>;
}

export function normalizeCityName(cityName: string): string {
  return cityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function createEmptyAdjacency(cities: Iterable<string>): Map<string, Map<string, number>> {
  const adjacency = new Map<string, Map<string, number>>();
  for (const cityId of cities) {
    adjacency.set(cityId, new Map<string, number>());
  }
  return adjacency;
}

function setShortestDistance(
  adjacency: Map<string, Map<string, number>>,
  from: string,
  to: string,
  distance: number
): void {
  const fromNeighbors = adjacency.get(from);
  if (!fromNeighbors) return;

  const currentDistance = fromNeighbors.get(to);
  if (currentDistance === undefined || distance < currentDistance) {
    fromNeighbors.set(to, distance);
  }
}

function cloneAdjacency(
  adjacency: Map<string, Map<string, number>>
): Map<string, Map<string, number>> {
  const cloned = new Map<string, Map<string, number>>();
  for (const [city, neighbors] of adjacency.entries()) {
    cloned.set(city, new Map(neighbors));
  }
  return cloned;
}

function buildBrazilGraphData(): BrazilGraphData {
  const straightLine = straightLineData as StraightLineFile;
  const roadDistances = roadDistancesData as Record<string, number>;
  const capitals = capitalsData as string[];

  const allCityIds = new Set<string>();

  for (const city of capitals) {
    allCityIds.add(normalizeCityName(city));
  }

  for (const key of Object.keys(roadDistances)) {
    const [fromRaw, toRaw] = key.split(':');
    if (!fromRaw || !toRaw) continue;
    allCityIds.add(normalizeCityName(fromRaw));
    allCityIds.add(normalizeCityName(toRaw));
  }

  for (const [fromRaw, toDistances] of Object.entries(straightLine.distancias)) {
    const fromId = normalizeCityName(fromRaw);
    allCityIds.add(fromId);
    for (const toRaw of Object.keys(toDistances)) {
      allCityIds.add(normalizeCityName(toRaw));
    }
  }

  const adjacency = createEmptyAdjacency(allCityIds);
  const straightLineMap = createEmptyAdjacency(allCityIds);

  for (const [key, distance] of Object.entries(roadDistances)) {
    const [fromRaw, toRaw] = key.split(':');
    if (!fromRaw || !toRaw || !Number.isFinite(distance)) continue;

    const from = normalizeCityName(fromRaw);
    const to = normalizeCityName(toRaw);
    if (from === to) continue;

    setShortestDistance(adjacency, from, to, distance);
    setShortestDistance(adjacency, to, from, distance);
  }

  for (const [fromRaw, toDistances] of Object.entries(straightLine.distancias)) {
    const from = normalizeCityName(fromRaw);
    for (const [toRaw, distance] of Object.entries(toDistances)) {
      if (!Number.isFinite(distance)) continue;
      const to = normalizeCityName(toRaw);
      setShortestDistance(straightLineMap, from, to, distance);
    }
  }

  const cities: BrazilCity[] = Array.from(allCityIds)
    .map((cityId) => {
      const coords = CITY_COORDINATES[cityId];
      if (!coords) return null;

      return {
        id: cityId,
        label: coords.label,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    })
    .filter((city): city is BrazilCity => city !== null)
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));

  return {
    cities,
    adjacency,
    straightLine: straightLineMap,
  };
}

const BRAZIL_GRAPH_DATA = buildBrazilGraphData();

export function getBrazilGraphData(): BrazilGraphData {
  return BRAZIL_GRAPH_DATA;
}

function getHeuristicDistance(
  straightLine: Map<string, Map<string, number>>,
  from: string,
  goal: string
): number {
  return straightLine.get(from)?.get(goal) ?? 0;
}

function getEdgeCost(
  graph: Map<string, Map<string, number>>,
  from: string,
  to: string
): number {
  return graph.get(from)?.get(to) ?? Number.POSITIVE_INFINITY;
}

function buildPath(cameFrom: Map<string, string>, goal: string): string[] {
  const path: string[] = [goal];
  let current = goal;

  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.unshift(current);
  }

  return path;
}

function calculatePathCost(
  graph: Map<string, Map<string, number>>,
  path: string[]
): number {
  if (path.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    total += getEdgeCost(graph, path[i], path[i + 1]);
  }
  return total;
}

function chooseLowestFScore(openSet: Set<string>, fScore: Map<string, number>): string {
  let bestCity: string | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const city of openSet) {
    const score = fScore.get(city) ?? Number.POSITIVE_INFINITY;
    if (score < bestScore) {
      bestCity = city;
      bestScore = score;
    }
  }

  return bestCity ?? '';
}

function createAdjustedGraph(
  adjacency: Map<string, Map<string, number>>,
  congestionSegments: CongestionSegment[]
): Map<string, Map<string, number>> {
  const adjusted = cloneAdjacency(adjacency);

  for (const segment of congestionSegments) {
    if (!Number.isFinite(segment.multiplier) || segment.multiplier <= 0) continue;

    const from = normalizeCityName(segment.from);
    const to = normalizeCityName(segment.to);
    if (from === to) continue;

    const baseDistance = adjusted.get(from)?.get(to);
    if (baseDistance === undefined) continue;

    const newDistance = Number((baseDistance * segment.multiplier).toFixed(2));
    adjusted.get(from)?.set(to, newDistance);
    adjusted.get(to)?.set(from, newDistance);
  }

  return adjusted;
}

export function performAStarScenario(
  graphData: BrazilGraphData,
  start: string,
  goal: string,
  congestionSegments: CongestionSegment[] = []
): AStarScenarioResult {
  const startId = normalizeCityName(start);
  const goalId = normalizeCityName(goal);
  const graph = createAdjustedGraph(graphData.adjacency, congestionSegments);

  if (!graph.has(startId) || !graph.has(goalId)) {
    return { success: false, path: [], totalCost: Number.POSITIVE_INFINITY, steps: [] };
  }

  if (startId === goalId) {
    return { success: true, path: [startId], totalCost: 0, steps: [] };
  }

  const openSet = new Set<string>([startId]);
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[startId, 0]]);
  const fScore = new Map<string, number>([
    [startId, getHeuristicDistance(graphData.straightLine, startId, goalId)],
  ]);

  const steps: AStarStep[] = [];
  let iteration = 0;

  while (openSet.size > 0) {
    iteration += 1;
    const current = chooseLowestFScore(openSet, fScore);
    if (!current) break;

    openSet.delete(current);
    closedSet.add(current);

    if (current === goalId) {
      steps.push({
        iteration,
        current,
        open: Array.from(openSet).sort((left, right) => {
          const leftScore = fScore.get(left) ?? Number.POSITIVE_INFINITY;
          const rightScore = fScore.get(right) ?? Number.POSITIVE_INFINITY;
          return leftScore - rightScore;
        }),
        closed: Array.from(closedSet),
      });

      const path = buildPath(cameFrom, goalId);
      return {
        success: true,
        path,
        totalCost: calculatePathCost(graph, path),
        steps,
      };
    }

    const neighbors = graph.get(current);
    if (!neighbors) continue;

    for (const [neighbor, edgeDistance] of neighbors.entries()) {
      if (closedSet.has(neighbor)) continue;

      const tentativeGScore = (gScore.get(current) ?? Number.POSITIVE_INFINITY) + edgeDistance;
      const currentGScore = gScore.get(neighbor) ?? Number.POSITIVE_INFINITY;

      if (tentativeGScore >= currentGScore) continue;

      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(
        neighbor,
        tentativeGScore + getHeuristicDistance(graphData.straightLine, neighbor, goalId)
      );
      openSet.add(neighbor);
    }

    steps.push({
      iteration,
      current,
      open: Array.from(openSet).sort((left, right) => {
        const leftScore = fScore.get(left) ?? Number.POSITIVE_INFINITY;
        const rightScore = fScore.get(right) ?? Number.POSITIVE_INFINITY;
        return leftScore - rightScore;
      }),
      closed: Array.from(closedSet),
    });
  }

  return {
    success: false,
    path: [],
    totalCost: Number.POSITIVE_INFINITY,
    steps,
  };
}

export interface PathEdge {
  from: string;
  to: string;
}

export function getPathEdges(path: string[]): PathEdge[] {
  const edges: PathEdge[] = [];

  for (let index = 0; index < path.length - 1; index += 1) {
    edges.push({ from: path[index], to: path[index + 1] });
  }

  return edges;
}

