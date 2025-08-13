import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: any;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any) {
    console.error('UI ErrorBoundary yakaladı:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-xl">
            <div className="text-2xl font-semibold mb-2">Bir şeyler ters gitti</div>
            <div className="text-sm text-gray-600 mb-4">Sayfayı yenilemeyi deneyin.</div>
            {this.state.error && (
              <pre className="text-left text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64" style={{ whiteSpace: 'pre-wrap' }}>
                {(this.state.error?.stack || this.state.error?.message || String(this.state.error))}
              </pre>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded text-white"
                style={{ background: 'var(--up-primary)' }}
              >
                Sayfayı Yenile
              </button>
              <button
                onClick={() => { try { localStorage.removeItem('uphera_user'); } catch {}; window.location.href = '/login'; }}
                className="px-4 py-2 rounded border"
              >
                Tekrar Giriş Yap
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


