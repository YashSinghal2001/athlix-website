import React from "react";

/**
 * Catches uncaught render errors anywhere below it and shows a friendly,
 * generic fallback UI. Technical details (error + component stack) are logged
 * to the internal channel ONLY (console / your monitoring hook) and are NEVER
 * rendered to the user — no stack traces, file paths, or internal messages.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Render the fallback. We intentionally do NOT keep the error object in
    // state, so there's no way for technical detail to reach the DOM.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Internal-only logging. Replace/extend with Sentry, LogRocket, etc.
    // eslint-disable-next-line no-console
    console.error("[ui-error]", error, info?.componentStack);
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error" role="alert">
          <div className="app-error-card">
            <h1>Something went wrong</h1>
            <p>
              We hit an unexpected issue while loading this page. Please refresh
              and try again — your information was not affected.
            </p>
            <button type="button" className="btn btn-primary btn-lg" onClick={this.handleReload}>
              Reload page
            </button>
            <p className="app-error-contact">
              Still need help? Reach us on{" "}
              <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer">WhatsApp</a>.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
