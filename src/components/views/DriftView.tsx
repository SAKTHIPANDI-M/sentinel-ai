import React, { useState } from 'react';
import { FeatureDriftResult, ModelRecord } from '../../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Sliders,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface DriftViewProps {
  model: ModelRecord;
  driftResults: FeatureDriftResult[];
  onLaunchAssistant: (prompt: string) => void;
}

export const DriftView: React.FC<DriftViewProps> = ({
  model,
  driftResults,
  onLaunchAssistant,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureDriftResult>(
    driftResults.find((d) => d.hasDrifted) || driftResults[0]
  );

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'medium':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'low':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Statistical Data &amp; Prediction Drift Monitor</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              PSI &amp; Wasserstein Methods
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Continuous evaluation of input feature distributions and output predictions against calibrated baseline datasets. Population Stability Index (PSI &gt; 0.25) and Wasserstein distances flag upstream data ingestion anomalies before silent degradation harms production outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-right">
            <div className="text-[10px] font-mono text-slate-400">DRIFTED FEATURES</div>
            <div className="text-lg font-bold font-mono text-amber-400">
              {driftResults.filter((d) => d.hasDrifted).length} / {driftResults.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Drift Cards List & Distribution Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Feature Drift Selector Table */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
            Monitored Feature Dimensions
          </h3>

          <div className="flex flex-col gap-2">
            {driftResults.map((d) => {
              const isSelected = selectedFeature.featureName === d.featureName;
              return (
                <div
                  key={d.featureName}
                  onClick={() => setSelectedFeature(d)}
                  className={`cursor-pointer p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-md'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-white font-mono">
                      {d.featureName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getSeverityBadge(
                        d.severity
                      )}`}
                    >
                      {d.severity === 'none' ? 'Nominal' : `${d.severity} Drift`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span>
                      {d.driftMetric}: <strong className="text-slate-200">{d.driftScore}</strong>
                    </span>
                    <span>
                      Threshold: <span className="text-slate-400">{d.threshold}</span>
                    </span>
                    <span>
                      Missing Δ: <span className="text-slate-300">{(d.missingValueRateChange * 100).toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Feature Distribution Histogram vs Baseline */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-lg p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Distribution Shift Comparison (Baseline vs Current)
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5">
                  Feature: {selectedFeature.featureName}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">
                  {selectedFeature.driftMetric} Score
                </div>
                <div
                  className={`text-xl font-bold font-mono ${
                    selectedFeature.hasDrifted ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedFeature.driftScore}
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedFeature.referenceDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="bin" stroke="#4B5563" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis
                    stroke="#4B5563"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="baselineShare"
                    name="Reference Baseline Share"
                    fill="#475569"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="currentShare"
                    name="Current Observed Share"
                    fill={selectedFeature.hasDrifted ? '#F59E0B' : '#06B6D4'}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Root Cause Note */}
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg mt-4 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>Drift Diagnosis &amp; Root Cause Explanation:</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedFeature.explanation}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-4">
            <span className="text-[11px] text-slate-400 font-mono">
              Baseline: {model.referenceDataset}
            </span>
            <button
              onClick={() =>
                onLaunchAssistant(
                  `Analyze the distribution shift for feature ${selectedFeature.featureName} on model ${model.name}. The PSI score is ${selectedFeature.driftScore}. What upstream ingestion pipeline or data source caused this, and how can we mitigate it?`
                )
              }
              className="px-3 py-1.5 bg-violet-950/60 hover:bg-violet-900/60 border border-violet-800 text-violet-300 text-xs font-semibold rounded-md transition-colors"
            >
              Ask AI to Diagnose Drift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
