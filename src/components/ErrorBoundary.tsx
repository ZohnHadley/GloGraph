import { Component, type ErrorInfo, type ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Props { children: ReactNode }
interface State { error: Error | null; componentStack: string | null }

/**
 * Catches render/lifecycle errors anywhere below it and shows a readable screen
 * instead of a blank window (e.g. a React #185 infinite-loop, or any thrown
 * render). Local-first: the error is written to the frontend log via the same
 * `log_frontend_error` command main.tsx uses — no telemetry. A Reload button gets
 * the user back without hunting for the process; saved projects are untouched
 * (errors here are in the UI layer, not the on-disk data).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const message = `react-error-boundary: ${error.stack ?? error.message}\n${info.componentStack ?? ''}`;
    console.error(message);
    invoke('log_frontend_error', { message }).catch(() => {});
    this.setState({ componentStack: info.componentStack ?? null });
  }

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="error-boundary">
        <div className="error-boundary__card">
          <h1>Something went wrong</h1>
          <p>GloGraph hit an unexpected error and couldn't render. Your saved projects aren't affected — reloading usually clears it.</p>
          <pre className="error-boundary__msg">{error.message || String(error)}</pre>
          <div className="error-boundary__actions">
            <button className="btn btn--primary btn--sm" onClick={() => location.reload()}>Reload</button>
          </div>
          <details className="error-boundary__more">
            <summary>Technical details</summary>
            <pre>{(error.stack ?? '') + (componentStack ? `\n${componentStack}` : '')}</pre>
          </details>
        </div>
      </div>
    );
  }
}
