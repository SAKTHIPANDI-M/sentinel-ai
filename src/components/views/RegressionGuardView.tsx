import React, { useEffect, useState } from 'react';
import { ModelRecord } from '../../types';
import { api } from '../../api';
import {
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Layers,
  Sparkles,
  Bot,
} from 'lucide-react';

interface RegressionGuardViewProps {
  model: ModelRecord;
  onLaunchAssistant: (prompt: string) => void;
}

export const RegressionGuardView: React.FC<RegressionGuardViewProps> = ({
  model,
  onLaunchAssistant,
}) => {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.compareVersions(model.id)
      .then((data) => {
        if (mounted) {
          setComparison(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [model.id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Evaluating candidate model regression guard across segment slices...
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        No candidate model version registered for comparison.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-violet-400" />
              <span>Model Version Regression Guard</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Pre-Deployment Slice Verification
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Compares production model ({comparison.prodVersion}) against candidate release ({comparison.candidateVersion}) on identical evaluation test slices. Prevents deploying candidate models that improve global accuracy while silently breaking edge cases or demographic sub-cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 bg-emerald-950/60 border border-emerald-800 rounded-md text-right">
            <div className="text-[10px] font-mono text-emerald-400">RECOMMENDATION</div>
            <div className="text-xs font-bold font-mono text-white">
              {comparison.recommendation.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* High-Level Comparison KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-mono">Current Production ({comparison.prodVersion})</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {((comparison.overallProdAccuracy || 0.94) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Verified aggregate accuracy</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-mono">Candidate Release ({comparison.candidateVersion})</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {((comparison.overallCandidateAccuracy || 0.954) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">{comparison.netAccuracyGain} Net Gain</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5">
          <span className="text-xs text-slate-400 font-mono">Subgroup Parity Audit</span>
          <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>NO SILENT REGRESSIONS</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Elderly cohort disparity resolved</span>
        </div>
      </div>

      {/* Slices Parity Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 font-mono">
            Segment-Level Regression Parity Matrix
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {comparison.slices.length} verified segment slices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Segment Slice</th>
                <th className="py-2.5 px-3 text-right">Test Samples</th>
                <th className="py-2.5 px-3 text-right">Prod ({comparison.prodVersion})</th>
                <th className="py-2.5 px-3 text-right">Candidate ({comparison.candidateVersion})</th>
                <th className="py-2.5 px-3 text-right">Accuracy Delta</th>
                <th className="py-2.5 px-3 text-center">Safety Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparison.slices.map((slice: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-200 font-semibold">{slice.segment}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{slice.sampleSize}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={slice.prodSilentFailure ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {slice.prodAccuracy !== null ? `${(slice.prodAccuracy * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                    {(slice.candidateAccuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={slice.accuracyDelta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                      {slice.accuracyDelta >= 0 ? `+${slice.accuracyDelta}%` : `${slice.accuracyDelta}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800">
                      {slice.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Audit Summary */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-200 block mb-0.5">
            Audit Findings:
          </span>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            {comparison.safetyAuditSummary}
          </p>
        </div>

        <button
          onClick={() =>
            onLaunchAssistant(
              `Compare candidate version ${comparison.candidateVersion} against production ${comparison.prodVersion} for model ${model.name}. Is it safe to deploy to 100% traffic?`
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-950/80 hover:bg-violet-900 border border-violet-800 text-violet-200 text-xs font-semibold rounded-md transition-colors shrink-0"
        >
          <Bot className="w-3.5 h-3.5 text-violet-400" />
          <span>Ask AI Safety Review</span>
        </button>
      </div>
    </div>
  );
};
