import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';

// Calculate bbox area in km² (approximate, for Jakarta bbox)
const JAKARTA_BBOX_AREA_KM2 = 662; // You can adjust this value as needed

function UrbanExpansionCharts({ year1, year2 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year1 || !year2) return;
    setError(null);
    fetch(`https://web-production-f8e1.up.railway.app/gee/urban-expansion-stats?start_year=${year1}&end_year=${year2}`)
      .then(res => {
        if (!res.ok) throw new Error('Invalid year range or server error');
        return res.json();
      })
      .then(json => {
        const chartData = json.years.map((year, i) => ({
          year,
          total_urban_area: json.total_urban_area[i],
          urban_area_in_risk: json.urban_area_in_risk[i],
          urban_area_in_risk_yoy_pct: json.urban_area_in_risk_yoy_pct[i],
          pop_in_urban_risk: json.pop_in_urban_risk[i],
          pop_in_urban_risk_yoy_pct: json.pop_in_urban_risk_yoy_pct[i],
        }));
        setData(chartData);
      })
      .catch(err => setError(err.message));
  }, [year1, year2]);

  // Summary statistics
  let summary = null;
  if (data && data.length > 0) {
    const maxYear = data[data.length - 1].year;
    const totalUrbanAreaMaxYear = data[data.length - 1].total_urban_area;
    const avgGrowthRate = data.length > 1
      ? (data.slice(1).reduce((sum, d) => sum + (d.urban_area_in_risk_yoy_pct || 0), 0) / (data.length - 1))
      : 0;
    const urbanizationPct = JAKARTA_BBOX_AREA_KM2 > 0 ? (totalUrbanAreaMaxYear / JAKARTA_BBOX_AREA_KM2) * 100 : 0;
    summary = (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, background: '#181c24', color: '#fff', padding: '24px 16px', borderRadius: 8 }}>
        <div>
          <div style={{ fontSize: 16, opacity: 0.8 }}>Urban Area ({maxYear})</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{totalUrbanAreaMaxYear ? totalUrbanAreaMaxYear.toFixed(1) : '-'} km²</div>
        </div>
        <div>
          <div style={{ fontSize: 16, opacity: 0.8 }}>Average Growth Rate</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{avgGrowthRate.toFixed(1)}%</div>
        </div>
        <div>
          <div style={{ fontSize: 16, opacity: 0.8 }}>Urbanization % (Total Urban Area)</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{urbanizationPct.toFixed(1)}%</div>
        </div>
      </div>
    );
  }

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!data) return <div>Loading urban expansion stats...</div>;

  return (
    <div style={{ marginTop: 32 }}>
      {summary}
      <h3>Urban Area in Risk Area (km²)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: 'Area (km²)', angle: -90, position: 'insideLeft' }} domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="urban_area_in_risk" stroke="#1976d2" name="Urban Area in Risk (km²)" />
        </LineChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: 32 }}>Urban Area in Risk Area YoY Growth (%)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: 'Growth (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="urban_area_in_risk_yoy_pct" fill="#1976d2" name="YoY Urban Area in Risk (%)" />
        </BarChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: 32 }}>Population in Urban Area and Risk Area (people)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: 'Population (people)', angle: -90, position: 'insideLeft' }} domain={['dataMin - 1000', 'dataMax + 1000']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pop_in_urban_risk" stroke="#e53935" name="Population in Urban+Risk" />
        </LineChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: 32 }}>Population in Urban Area and Risk Area YoY Growth (%)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis label={{ value: 'Growth (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="pop_in_urban_risk_yoy_pct" fill="#e53935" name="YoY Pop in Urban+Risk (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UrbanExpansionCharts; 