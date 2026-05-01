import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, AlertTriangle, FunctionSquare } from 'lucide-react';
import { generateProjectionData } from './lib/math';

function App() {
  const [inputs, setInputs] = useState({
    currentAge: 35,
    retirementAge: 65,
    maxAge: 95,
    startingBalance: 100000,
    monthlyContribution: 500,
    annualGrowthRate: 8.0,
    annualInflationRate: 2.0,
    withdrawalRate: 4.0,
  });

  const [useBuggedMath, setUseBuggedMath] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const data = useMemo(() => {
    return generateProjectionData({
      ...inputs,
      annualGrowthRate: inputs.annualGrowthRate / 100,
      annualInflationRate: inputs.annualInflationRate / 100,
      withdrawalRate: inputs.withdrawalRate / 100,
      useBuggedMath
    });
  }, [inputs, useBuggedMath]);

  const maxBalance = Math.max(...data.map(d => d.balance));
  const finalBalance = data[data.length - 1]?.balance || 0;
  
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip-custom">
          <div className="tooltip-label">Age {label}</div>
          <div className="tooltip-item">
            <span>Portfolio Balance:</span>
            <span style={{ color: '#3b82f6' }}>
              ${payload[0].value.toLocaleString()}
            </span>
          </div>
          {payload[1] && payload[1].value > 0 && (
            <div className="tooltip-item">
              <span>Annual Withdrawal:</span>
              <span style={{ color: '#ef4444' }}>
                ${payload[1].value.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1><Calculator size={24} color="#3b82f6" /> Trailora Math Simulator</h1>
        
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${!useBuggedMath ? 'active' : ''}`}
            onClick={() => setUseBuggedMath(false)}
          >
            True Compounding
          </button>
          <button 
            className={`toggle-btn ${useBuggedMath ? 'active' : ''}`}
            onClick={() => setUseBuggedMath(true)}
            style={useBuggedMath ? { background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' } : {}}
          >
            Bugged Math (0.4x)
          </button>
        </div>

        {useBuggedMath && (
          <div style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
            <AlertTriangle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>Simulating the old bug where post-retirement growth was arbitrarily multiplied by 0.4.</span>
          </div>
        )}

        <div className="input-group">
          <label>
            Starting Balance <span>${inputs.startingBalance.toLocaleString()}</span>
          </label>
          <input type="range" name="startingBalance" min="0" max="1000000" step="10000" value={inputs.startingBalance} onChange={handleInputChange} />
          <input type="number" name="startingBalance" value={inputs.startingBalance} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>
            Monthly Contribution <span>${inputs.monthlyContribution.toLocaleString()}</span>
          </label>
          <input type="range" name="monthlyContribution" min="0" max="10000" step="100" value={inputs.monthlyContribution} onChange={handleInputChange} />
          <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>
            Annual Growth Rate <span>{inputs.annualGrowthRate}%</span>
          </label>
          <input type="range" name="annualGrowthRate" min="0" max="15" step="0.5" value={inputs.annualGrowthRate} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>
            Withdrawal Rate <span>{inputs.withdrawalRate}%</span>
          </label>
          <input type="range" name="withdrawalRate" min="1" max="10" step="0.5" value={inputs.withdrawalRate} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>
            Inflation Rate <span>{inputs.annualInflationRate}%</span>
          </label>
          <input type="range" name="annualInflationRate" min="0" max="10" step="0.5" value={inputs.annualInflationRate} onChange={handleInputChange} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Current Age</label>
            <input type="number" name="currentAge" value={inputs.currentAge} onChange={handleInputChange} />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Retire Age</label>
            <input type="number" name="retirementAge" value={inputs.retirementAge} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      <div className="main-stage">
        <h2>Projection Output</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Peak Balance</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>
              ${maxBalance.toLocaleString()}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ending Balance (Age {inputs.maxAge})</div>
            <div className="stat-value" style={{ color: finalBalance === 0 ? '#ef4444' : '#10b981' }}>
              ${finalBalance.toLocaleString()}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Final Year Withdrawal</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              ${data[data.length - 1]?.withdrawal.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="chart-container" style={{ width: '100%', height: '400px', position: 'relative', minHeight: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="age" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickMargin={10}
                minTickGap={20}
              />
              <YAxis 
                yAxisId="left"
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={formatCurrency}
                width={50}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#ef4444" 
                tick={{ fill: '#ef4444', fontSize: 10 }}
                tickFormatter={formatCurrency}
                width={50}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              
              <Line 
                name="Portfolio Balance"
                yAxisId="left"
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1e3a8a', strokeWidth: 2 }}
              />
              <Line 
                name="Annual Withdrawal"
                yAxisId="right"
                type="monotone" 
                dataKey="withdrawal" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: '#ef4444', stroke: '#7f1d1d', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="equations-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FunctionSquare size={20} color="#10b981" /> Computational Flow</h3>
          <div className="equation-grid">
            <div className="equation-card">
              <h4>Phase I: Accumulation [t &lt; Retire Age]</h4>
              <code>B<sub>t</sub> = (B<sub>t-1</sub> + C<sub>m</sub>) × (1 + r<sub>m</sub>)</code>
              <p>Where <code>B</code> is the running balance, <code>C<sub>m</sub></code> is the monthly contribution, and <code>r<sub>m</sub></code> is the baseline monthly growth yield.</p>
            </div>
            <div className="equation-card">
              <h4>Initial Decumulation Target</h4>
              <code>W<sub>0</sub> = B<sub>Retirement</sub> × w<sub>rate</sub></code>
              <p>Calculates the initial Year 1 baseline withdrawal (<code>W<sub>0</sub></code>) as a strict percentage of the exact portfolio balance at retirement.</p>
            </div>
            <div className="equation-card">
              <h4>Phase II: Decumulation [t &ge; Retire Age]</h4>
              <code>B<sub>t</sub> = Max(0, (B<sub>t-1</sub> - W<sub>m</sub>) × (1 + r<sub>eff</sub>))</code>
              <p>Effective Growth Rate (<code>r<sub>eff</sub></code>) is <strong>{useBuggedMath ? 'r_m × 0.4' : 'r_m'}</strong>. <code>Max(0)</code> acts as the absolute depletion floor safeguard.</p>
            </div>
            <div className="equation-card">
              <h4>Inflation Vector Mapping</h4>
              <code>W<sub>year</sub> = W<sub>year-1</sub> × (1 + i)</code>
              <p>Applies compounding inflation (<code>i</code>) annually strictly on the retirement anniversary month to scale the living withdrawal distribution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
