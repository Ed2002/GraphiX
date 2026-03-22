import { useEffect, useRef } from 'react';
import type { ConsoleEntry } from '../types';
import { Button } from '../components';

interface ResultsConsoleProps {
  logs: ConsoleEntry[];
  onClear: () => void;
}

const LEVEL_STYLES: Record<ConsoleEntry['level'], string> = {
  info: 'text-text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
};

export function ResultsConsole({ logs, onClear }: ResultsConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-[var(--console-height)] min-h-[var(--console-height)] bg-bg-secondary border-t border-border-default flex flex-col">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-danger opacity-70" />
            <div className="w-2 h-2 rounded-full bg-warning opacity-70" />
            <div className="w-2 h-2 rounded-full bg-success opacity-70" />
          </div>
          <h3 className="text-xs font-medium text-text-secondary">Console</h3>
          <span className="text-[10px] text-text-muted">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={logs.length === 0}>
          Clear
        </Button>
      </div>

      {/* Console Body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs space-y-0.5"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-xs">
              Execute an algorithm to see results here
            </p>
          </div>
        ) : (
          logs.map((entry) => (
            <div
              key={entry.id}
              className={`flex gap-2 py-0.5 ${LEVEL_STYLES[entry.level]}`}
              style={{ animation: 'fade-in 0.2s ease-out' }}
            >
              <span className="text-text-muted opacity-50 select-none shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span className="whitespace-pre-wrap">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
