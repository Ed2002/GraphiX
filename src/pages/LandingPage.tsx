import { Link } from 'react-router-dom';

const CHANGELOG = [
  {
    version: 'v1.1.0',
    date: 'March 22, 2026',
    changes: [
      'Added interactive canvas panning and scrolling zoom',
      'Nodes are now fully draggable with preserved positions',
      'Live Adjacency Matrix rendered automatically in the properties panel',
      'MiniMap synchronizes with live coordinates and viewport tracking box',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'March 22, 2026',
    changes: [
      'Dark-mode dashboard layout with Sidebar and integrated output Console',
      'SVG Graph rendering with directed/undirected configurations',
      'Step-by-step algorithms: BFS, DFS, Kosaraju SCC, and Transitive Closures',
      'Graph structural properties panel with active Density calculation',
    ],
  },
];

export function LandingPage() {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-bg-primary text-text-primary selection:bg-accent/30 flex flex-col items-center">
      <div className="w-full max-w-5xl px-8 py-16 space-y-16">
        {/* Hero Section */}
        <header className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent-muted/20 border border-accent/20 mb-2 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
            <svg className="w-10 h-10 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-white to-text-muted pb-2">
              Welcome to GraphiX
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Design, analyze, and visualize interactive graphs in a production-ready environment built for speed and clarity.
            </p>
          </div>
          <div className="pt-6 flex justify-center items-center gap-4">
            <Link to="/app" className="inline-block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-info rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <button className="cursor-pointer relative px-8 py-3.5 bg-bg-elevated hover:bg-bg-secondary ring-1 ring-border-default text-white rounded-lg font-medium transition-all flex items-center gap-2">
                Open Graph Editor
                <svg className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>
            <a href="https://github.com/Ed2002/GraphiX" target="_blank" rel="noopener noreferrer" className="inline-block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <button className="cursor-pointer relative px-8 py-3.5 bg-bg-elevated hover:bg-bg-secondary ring-1 ring-border-default text-white rounded-lg font-medium transition-all flex items-center gap-2">
                <svg className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </button>
            </a>
          </div>
        </header>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border-default/50">
          <FeatureCard
            icon={<svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
            title="Interactive Canvas"
            desc="Node dragging, seamless zoom and map panning backed by an automatic scaled minimap."
          />
          <FeatureCard
            icon={<svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            title="Algorithm Visualization"
            desc="Traverse through BFS, DFS, and strongly connected components with controlled speed steps."
          />
          <FeatureCard
            icon={<svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            title="Real-time Metrics"
            desc="Automatic live adjacency matrices, calculated graph density, and visual history logs."
          />
        </section>

        {/* Changelog */}
        <section className="pt-8 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">Release Log</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border-default to-transparent"></div>
          </div>
          <div className="space-y-6">
            {CHANGELOG.map((log) => (
              <div key={log.version} className="bg-bg-secondary/50 border border-border-default/60 rounded-xl p-6 hover:border-border-default transition-colors">
                <div className="flex items-center gap-4 mb-5 border-b border-border-subtle/50 pb-4">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold tracking-wide">
                    {log.version}
                  </span>
                  <span className="text-sm font-medium text-text-muted">{log.date}</span>
                </div>
                <ul className="space-y-3">
                  {log.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary group">
                      <svg className="w-4 h-4 text-accent/50 group-hover:text-accent transition-colors mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="leading-snug">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 border-t border-border-default/30 flex justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
          <p className="text-sm text-text-muted">
            Developed by <a href="https://www.eduardoduarte.com.br/ " target='_blank'><span className="font-bold"><span className='text-[#002A99]'>Eduardo</span><span className="text-[#013CFF]">Duarte</span></span></a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 bg-bg-secondary/30 rounded-xl border border-border-subtle hover:bg-bg-secondary/60 hover:border-border-default transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-bg-elevated border border-border-default flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-text-primary mb-2 text-lg">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
