import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { readonly label: string; readonly children: ReactNode; readonly resetKey?: string | null };
type State = { readonly error: Error | null; readonly key: string | null | undefined };

/**
 * The presentation layer throws on contract violations (a wrong number is worse than none).
 * This shows that failure honestly instead of blanking the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, key: this.props.resetKey };

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Shown in the UI; no logging service exists (local-only app).
  }

  override render() {
    if (this.state.error !== null) {
      return (
        <div className="notice notice-error" role="alert">
          <strong>{this.props.label} could not be displayed.</strong> {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
