import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AnalysisErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Analysis rendering error caught by boundary:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto space-y-6 py-8">
          <div className="bg-white rounded-[2rem] border border-red-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">Unable to Render Analysis</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                An unexpected UI rendering error occurred. Please click below to reload the analysis view.
              </p>
              {this.state.error?.message && (
                <p className="text-[11px] font-mono text-slate-400 max-w-md mx-auto truncate pt-1">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Analysis</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AnalysisErrorBoundary;
