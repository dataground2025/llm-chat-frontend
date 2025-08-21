import React, { useState } from 'react';

const TASKS = [
  { value: 'slr-risk', label: 'Sea-Level Rise Risk', years: 1, minYear: 2014, maxYear: 2024 },
  { value: 'urban-area', label: 'Urban Area', years: 1, minYear: 2001, maxYear: 2020 },
  { value: 'urban-area-comprehensive', label: 'Urban Area Comprehensive', years: 2, minYear: 2001, maxYear: 2020 },
  { value: 'population-exposure', label: 'Population Exposure', years: 2, minYear: 2001, maxYear: 2020 },
  { value: 'infrastructure-exposure', label: 'Infrastructure Exposure', years: 1, minYear: 2001, maxYear: 2020 },
];

function MapSidebar({ onAnalyze }) {
  const [task, setTask] = useState(TASKS[0].value);
  const [year1, setYear1] = useState(2020);
  const [year2, setYear2] = useState(2020);
  const [threshold, setThreshold] = useState(2.0);

  const selectedTask = TASKS.find(t => t.value === task);
  const minYear = selectedTask.minYear;
  const maxYear = selectedTask.maxYear;

  const handleAnalyze = () => {
    onAnalyze({
      country: 'Indonesia',
      city: 'Jakarta',
      task,
      year1,
      year2: selectedTask.years === 2 ? year2 : null,
      mapOption: 'OpenStreetMap',
      threshold,
    });
  };

  return (
    <div style={{ width: 300, padding: 20, borderRight: '1px solid #eee', background: '#fafbfc', minHeight: '100vh' }}>
      <h3>Select Analysis Type:</h3>
      <select value={task} onChange={e => setTask(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
        {TASKS.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <h4>Country</h4>
      <select disabled style={{ width: '100%', marginBottom: 16 }}><option>Indonesia</option></select>
      <h4>City</h4>
      <select disabled style={{ width: '100%', marginBottom: 16 }}><option>Jakarta</option></select>
      <h4>Time Period</h4>
      {selectedTask.years === 1 ? (
        <div>
          <label>Year: </label>
          <input type="number" value={year1} onChange={e => setYear1(Number(e.target.value))} min={minYear} max={maxYear} style={{ width: 100 }} />
        </div>
      ) : (
        <div>
          <label>Start Year: </label>
          <input type="number" value={year1} onChange={e => setYear1(Number(e.target.value))} min={minYear} max={maxYear} style={{ width: 100 }} />
          <br />
          <label>End Year: </label>
          <input type="number" value={year2} onChange={e => setYear2(Number(e.target.value))} min={minYear} max={maxYear} style={{ width: 100 }} />
        </div>
      )}
      <h4 style={{ marginTop: 24 }}>Sea Level Threshold (m)</h4>
      <input
        type="range"
        min={0.0}
        max={5.0}
        step={0.1}
        value={threshold}
        onChange={e => setThreshold(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ textAlign: 'right', fontSize: 14 }}>{threshold.toFixed(1)} m</div>
      <h4 style={{ marginTop: 24 }}>Map Option</h4>
      <select disabled style={{ width: '100%', marginBottom: 16 }}><option>OpenStreetMap</option></select>
      <button style={{ marginTop: 20, width: '100%', padding: '10px', fontWeight: 'bold', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={handleAnalyze}>
        Analyze it
      </button>
    </div>
  );
}

export default MapSidebar; 