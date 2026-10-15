import React, { useState } from 'react';
import {
  getApiConfiguration,
  saveApiConfiguration,
} from '../services/ltaService';
import {
  X,
  Server,
  Code,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';

interface BackendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const BackendGuideModal: React.FC<BackendGuideModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const currentConfig = getApiConfiguration();
  const [useBackend, setUseBackend] = useState(currentConfig.useBackend);
  const [endpointUrl, setEndpointUrl] = useState(currentConfig.endpointUrl);
  const [accountKey, setAccountKey] = useState(currentConfig.ltaAccountKey || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const backendCodeSnippet = `// Serverless Function is ready at /api/busarriavl.ts:
// Simply add LTA_ACCOUNT_KEY to your environment variables!

// Endpoint:
// GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
// Headers:
//   AccountKey: process.env.LTA_ACCOUNT_KEY
//   accept: application/json

// Local / Serverless test:
// GET /api/health
// GET /api/busarriavl?BusStopCode=83139`;

  const handleSave = () => {
    saveApiConfiguration({
      useBackend,
      endpointUrl,
      ltaAccountKey: accountKey,
    });
    onConfigChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection to ' + endpointUrl + '?BusStopCode=83139...');

    try {
      const url = `${endpointUrl}${endpointUrl.includes('?') ? '&' : '?'}BusStopCode=83139`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(accountKey ? { AccountKey: accountKey } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.Services || json.BusStopCode) {
          setTestStatus('success');
          setTestMessage('Successfully connected! LTA BusArrival payload received.');
        } else {
          setTestStatus('failed');
          setTestMessage('Server responded with 200, but payload did not contain standard LTA Services array.');
        }
      } else {
        setTestStatus('failed');
        setTestMessage(`Server returned HTTP error ${res.status}: ${res.statusText}`);
      }
    } catch (err: unknown) {
      setTestStatus('failed');
      setTestMessage(
        err instanceof Error
          ? err.message
          : 'Could not reach endpoint. Ensure your server is running and CORS is enabled.'
      );
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(backendCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Backend Connection & LTA DataMall Guide
              </h3>
              <p className="text-xs text-slate-400">
                Configure your server proxy when you are ready to link the live LTA API
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              useBackend
                ? 'bg-sky-950/40 border-sky-800/60 text-sky-200'
                : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
            }`}
          >
            {useBackend ? (
              <Server className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block text-sm">
                {useBackend
                  ? 'Active Mode: Custom Backend Proxy'
                  : 'Active Mode: Realistic Simulated LTA Data Stream'}
              </span>
              <p className="text-xs opacity-85 mt-0.5">
                {useBackend
                  ? 'The frontend will make live GET requests to your proxy route.'
                  : 'Frontend is running fully self-contained with authentic Singapore stops and second-by-second countdown simulations according to official LTA DataMall specifications.'}
              </p>
            </div>
          </div>

          {/* Toggle Control */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/50 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">
                Enable Backend API Connection
              </span>
              <span className="text-slate-400 text-[11px]">
                Toggle on when your backend proxy server is ready to route requests
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUseBackend(!useBackend)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                useBackend ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  useBackend ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Endpoint configuration */}
          {useBackend && (
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Backend Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="/api/busarriavl"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  The frontend will append <code>?BusStopCode=XXXXX</code> to this URL.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Optional Client Header / Secret Key (if needed)
                </label>
                <input
                  type="password"
                  value={accountKey}
                  onChange={(e) => setAccountKey(e.target.value)}
                  placeholder="Leave blank if handled entirely by server"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testStatus === 'testing' ? 'Testing...' : 'Test Backend Connection'}</span>
                </button>

                {testMessage && (
                  <div
                    className={`mt-2 p-2.5 rounded-lg border text-[11px] ${
                      testStatus === 'success'
                        ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/50 border-rose-800 text-rose-300'
                    }`}
                  >
                    {testMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Express backend implementation snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                Ready-to-Use Express Backend Implementation
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
              {backendCodeSnippet}
            </pre>
          </div>

          {/* LTA API Key Link */}
          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/60 flex items-center justify-between text-slate-400">
            <span>Need an official LTA DataMall API Key?</span>
            <a
              href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline"
            >
              <span>LTA DataMall Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
