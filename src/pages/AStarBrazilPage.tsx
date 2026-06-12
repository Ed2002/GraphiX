import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Input, Select } from '../components';
import {
  getBrazilGraphData,
  getPathEdges,
  normalizeCityName,
  performAStarScenario,
  type BrazilCity,
  type CongestionSegment,
} from '../utils/aStarBrazil';

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];
const BRAZIL_ZOOM = 4;

function createSegmentKey(from: string, to: string): string {
  const normalizedFrom = normalizeCityName(from);
  const normalizedTo = normalizeCityName(to);
  return [normalizedFrom, normalizedTo].sort().join(':');
}

function parseCongestionFactor(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed <= 1) return null;
  return parsed;
}

interface ScenarioMapProps {
  title: string;
  cities: BrazilCity[];
  path: string[];
  pathColor: string;
  congestionSegments?: CongestionSegment[];
}

function ScenarioMap({
  title,
  cities,
  path,
  pathColor,
  congestionSegments = [],
}: ScenarioMapProps) {
  const cityById = useMemo(
    () => new Map(cities.map((city) => [city.id, city])),
    [cities]
  );

  const pathEdges = useMemo(() => getPathEdges(path), [path]);
  const pathCitySet = useMemo(() => new Set(path), [path]);

  return (
    <div className="rounded-xl border border-border-default bg-bg-secondary/60 p-3">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>

      <div className="h-[360px] overflow-hidden rounded-lg border border-border-subtle">
        <MapContainer
          center={BRAZIL_CENTER}
          zoom={BRAZIL_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {pathEdges.map((edge) => {
            const fromCity = cityById.get(edge.from);
            const toCity = cityById.get(edge.to);
            if (!fromCity || !toCity) return null;

            return (
              <Polyline
                key={`path-${edge.from}-${edge.to}`}
                positions={[
                  [fromCity.latitude, fromCity.longitude],
                  [toCity.latitude, toCity.longitude],
                ]}
                pathOptions={{ color: pathColor, weight: 4 }}
              />
            );
          })}

          {congestionSegments.map((segment) => {
            const fromCity = cityById.get(normalizeCityName(segment.from));
            const toCity = cityById.get(normalizeCityName(segment.to));
            if (!fromCity || !toCity) return null;

            return (
              <Polyline
                key={`traffic-${segment.from}-${segment.to}`}
                positions={[
                  [fromCity.latitude, fromCity.longitude],
                  [toCity.latitude, toCity.longitude],
                ]}
                pathOptions={{ color: '#f97316', weight: 3, dashArray: '8 8' }}
              />
            );
          })}

          {cities.map((city) => (
            <CircleMarker
              key={city.id}
              center={[city.latitude, city.longitude]}
              radius={pathCitySet.has(city.id) ? 7 : 4}
              pathOptions={{
                color: pathCitySet.has(city.id) ? pathColor : '#64748b',
                fillColor: pathCitySet.has(city.id) ? pathColor : '#94a3b8',
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip>{city.label}</Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

interface ScenarioConsoleProps {
  title: string;
  cityLabelById: Map<string, string>;
  path: string[];
  totalCost: number;
  steps: Array<{
    iteration: number;
    current: string;
    open: string[];
    closed: string[];
  }>;
}

function ScenarioConsole({
  title,
  cityLabelById,
  path,
  totalCost,
  steps,
}: ScenarioConsoleProps) {
  const routeText =
    path.length > 0
      ? path.map((cityId) => cityLabelById.get(cityId) ?? cityId).join(' → ')
      : 'Sem rota encontrada para este cenário.';

  return (
    <div className="rounded-xl border border-border-default bg-bg-secondary/60 p-3">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
      <p className="text-xs text-text-secondary">
        <span className="font-medium text-text-primary">Rota:</span> {routeText}
      </p>
      <p className="mt-1 text-xs text-text-secondary">
        <span className="font-medium text-text-primary">Custo total:</span>{' '}
        {Number.isFinite(totalCost) ? `${totalCost.toFixed(2)} km` : 'Infinito'}
      </p>

      <div className="mt-3 max-h-72 overflow-auto rounded-md border border-border-subtle bg-bg-primary/60">
        <table className="w-full text-left text-[11px] text-text-secondary">
          <thead className="sticky top-0 bg-bg-elevated text-text-primary">
            <tr>
              <th className="px-2 py-1.5">Iteração</th>
              <th className="px-2 py-1.5">Atual</th>
              <th className="px-2 py-1.5">Abertos</th>
              <th className="px-2 py-1.5">Fechados</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={`${title}-${step.iteration}`} className="border-t border-border-subtle">
                <td className="px-2 py-1.5">{step.iteration}</td>
                <td className="px-2 py-1.5">
                  {cityLabelById.get(step.current) ?? step.current}
                </td>
                <td className="px-2 py-1.5">
                  {step.open
                    .map((cityId) => cityLabelById.get(cityId) ?? cityId)
                    .join(', ') || '—'}
                </td>
                <td className="px-2 py-1.5">
                  {step.closed
                    .map((cityId) => cityLabelById.get(cityId) ?? cityId)
                    .join(', ') || '—'}
                </td>
              </tr>
            ))}
            {steps.length === 0 && (
              <tr>
                <td className="px-2 py-3 text-center text-text-muted" colSpan={4}>
                  Sem passos para exibir.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AStarBrazilPage() {
  const graphData = getBrazilGraphData();

  const cityOptions = useMemo(
    () =>
      graphData.cities.map((city) => ({
        value: city.id,
        label: city.label,
      })),
    [graphData.cities]
  );

  const cityLabelById = useMemo(
    () => new Map(graphData.cities.map((city) => [city.id, city.label])),
    [graphData.cities]
  );

  const defaultStart = cityOptions.find((option) => option.value === 'sao paulo')?.value
    ?? cityOptions[0]?.value
    ?? '';
  const defaultGoal = cityOptions.find((option) => option.value === 'fortaleza')?.value
    ?? cityOptions[1]?.value
    ?? defaultStart;

  const [startCity, setStartCity] = useState(defaultStart);
  const [goalCity, setGoalCity] = useState(defaultGoal);
  const [segmentFrom, setSegmentFrom] = useState(defaultStart);
  const [segmentTo, setSegmentTo] = useState(defaultGoal);
  const [congestionFactorInput, setCongestionFactorInput] = useState('1.8');
  const [formFeedback, setFormFeedback] = useState('');
  const [congestionSegments, setCongestionSegments] = useState<CongestionSegment[]>([]);

  const normalScenario = useMemo(
    () => performAStarScenario(graphData, startCity, goalCity),
    [graphData, startCity, goalCity]
  );

  const congestionScenario = useMemo(
    () => performAStarScenario(graphData, startCity, goalCity, congestionSegments),
    [graphData, startCity, goalCity, congestionSegments]
  );

  const normalEdgeKeys = useMemo(
    () => new Set(getPathEdges(normalScenario.path).map((edge) => createSegmentKey(edge.from, edge.to))),
    [normalScenario.path]
  );

  const congestionEdgeKeys = useMemo(
    () => new Set(getPathEdges(congestionScenario.path).map((edge) => createSegmentKey(edge.from, edge.to))),
    [congestionScenario.path]
  );

  const routeChanged = normalScenario.path.join('|') !== congestionScenario.path.join('|');
  const forcedEdges = Array.from(congestionEdgeKeys).filter((edgeKey) => !normalEdgeKeys.has(edgeKey));
  const skippedEdges = Array.from(normalEdgeKeys).filter((edgeKey) => !congestionEdgeKeys.has(edgeKey));
  const formatEdge = (edgeKey: string) => {
    const [from, to] = edgeKey.split(':');
    return `${cityLabelById.get(from) ?? from} ↔ ${cityLabelById.get(to) ?? to}`;
  };

  const addCongestionSegment = () => {
    const multiplier = parseCongestionFactor(congestionFactorInput);
    if (!multiplier) {
      setFormFeedback('Informe um multiplicador maior que 1. Exemplo: 1.8');
      return;
    }

    const from = normalizeCityName(segmentFrom);
    const to = normalizeCityName(segmentTo);
    if (!from || !to || from === to) {
      setFormFeedback('Selecione duas capitais diferentes para criar o trecho.');
      return;
    }

    setCongestionSegments((current) => {
      const segmentKey = createSegmentKey(from, to);
      const existingIndex = current.findIndex(
        (segment) => createSegmentKey(segment.from, segment.to) === segmentKey
      );

      if (existingIndex === -1) {
        return [...current, { from, to, multiplier }];
      }

      const updated = [...current];
      updated[existingIndex] = { from, to, multiplier };
      return updated;
    });

    setFormFeedback('');
  };

  const applyTrafficOnNormalPath = () => {
    const multiplier = parseCongestionFactor(congestionFactorInput);
    if (!multiplier) {
      setFormFeedback('Informe um multiplicador maior que 1. Exemplo: 1.8');
      return;
    }

    const normalPathEdges = getPathEdges(normalScenario.path);
    if (normalPathEdges.length === 0) {
      setFormFeedback('Não há rota no cenário normal para aplicar congestionamento.');
      return;
    }

    setCongestionSegments(
      normalPathEdges.map((edge) => ({
        from: edge.from,
        to: edge.to,
        multiplier,
      }))
    );
    setFormFeedback('');
  };

  const removeCongestionSegment = (segment: CongestionSegment) => {
    const segmentKey = createSegmentKey(segment.from, segment.to);
    setCongestionSegments((current) =>
      current.filter((item) => createSegmentKey(item.from, item.to) !== segmentKey)
    );
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-bg-primary px-4 py-6 text-text-primary sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-secondary/60 p-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-xs text-text-secondary hover:text-text-primary"
            >
              Voltar
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Busca A* entre capitais do Brasil</h1>
              <p className="text-xs text-text-muted">
                Mapa com OpenStreetMap + simulação de cenário normal e congestionado.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-xl border border-border-default bg-bg-secondary/60 p-4 lg:grid-cols-4">
          <Select
            label="Origem"
            options={cityOptions}
            value={startCity}
            onChange={(event) => setStartCity(event.target.value)}
          />
          <Select
            label="Destino"
            options={cityOptions}
            value={goalCity}
            onChange={(event) => setGoalCity(event.target.value)}
          />
          <Select
            label="Trecho congestionado (de)"
            options={cityOptions}
            value={segmentFrom}
            onChange={(event) => setSegmentFrom(event.target.value)}
          />
          <Select
            label="Trecho congestionado (para)"
            options={cityOptions}
            value={segmentTo}
            onChange={(event) => setSegmentTo(event.target.value)}
          />
          <Input
            label="Fator de congestionamento"
            value={congestionFactorInput}
            onChange={(event) => setCongestionFactorInput(event.target.value)}
            placeholder="Ex.: 1.8"
          />
          <div className="flex items-end gap-2 lg:col-span-3">
            <Button size="sm" onClick={addCongestionSegment}>
              Adicionar trecho
            </Button>
            <Button size="sm" variant="secondary" onClick={applyTrafficOnNormalPath}>
              Congestionar rota normal
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCongestionSegments([]);
                setFormFeedback('');
              }}
            >
              Limpar congestionamento
            </Button>
          </div>

          {formFeedback && (
            <p className="text-xs text-warning lg:col-span-4">{formFeedback}</p>
          )}

          <div className="rounded-md border border-border-subtle bg-bg-primary/60 p-3 lg:col-span-4">
            <p className="text-xs font-medium text-text-primary">Trechos congestionados ativos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {congestionSegments.map((segment) => {
                const fromLabel = cityLabelById.get(normalizeCityName(segment.from)) ?? segment.from;
                const toLabel = cityLabelById.get(normalizeCityName(segment.to)) ?? segment.to;

                return (
                  <button
                    key={createSegmentKey(segment.from, segment.to)}
                    type="button"
                    onClick={() => removeCongestionSegment(segment)}
                    className="rounded-full border border-warning/40 bg-warning-muted px-3 py-1 text-[11px] text-warning hover:bg-warning/20"
                    title="Remover trecho"
                  >
                    {fromLabel} ↔ {toLabel} (x{segment.multiplier.toFixed(2)})
                  </button>
                );
              })}
              {congestionSegments.length === 0 && (
                <span className="text-xs text-text-muted">
                  Nenhum trecho congestionado configurado.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ScenarioMap
            title="Grafo do cenário normal"
            cities={graphData.cities}
            path={normalScenario.path}
            pathColor="#38bdf8"
          />
          <ScenarioMap
            title="Grafo do cenário com congestionamento"
            cities={graphData.cities}
            path={congestionScenario.path}
            pathColor="#f97316"
            congestionSegments={congestionSegments}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ScenarioConsole
            title="Listas abertas/fechadas — cenário normal"
            cityLabelById={cityLabelById}
            path={normalScenario.path}
            totalCost={normalScenario.totalCost}
            steps={normalScenario.steps}
          />
          <ScenarioConsole
            title="Listas abertas/fechadas — cenário congestionado"
            cityLabelById={cityLabelById}
            path={congestionScenario.path}
            totalCost={congestionScenario.totalCost}
            steps={congestionScenario.steps}
          />
        </div>

        <div className="rounded-xl border border-border-default bg-bg-secondary/60 p-4">
          <h2 className="text-sm font-semibold text-text-primary">Comparação das rotas</h2>
          <p className="mt-2 text-xs text-text-secondary">
            {routeChanged
              ? 'O congestionamento alterou o caminho escolhido pelo A*.'
              : 'O congestionamento não alterou o caminho final neste par origem/destino.'}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            <span className="font-medium text-text-primary">Arestas novas forçadas pelo trânsito:</span>{' '}
            {forcedEdges.length > 0 ? forcedEdges.map(formatEdge).join(' | ') : 'nenhuma'}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            <span className="font-medium text-text-primary">Arestas evitadas por congestionamento:</span>{' '}
            {skippedEdges.length > 0 ? skippedEdges.map(formatEdge).join(' | ') : 'nenhuma'}
          </p>
        </div>
      </div>
    </div>
  );
}
