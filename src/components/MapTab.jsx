import React, { useState } from 'react';
import MapSidebar from './MapSidebar';
import MapDisplay from './MapDisplay';
import UrbanAreaCharts from './UrbanAreaCharts';
import UrbanAreaComprehensiveCharts from './UrbanAreaComprehensiveCharts';

function MapTab() {
  const [params, setParams] = useState(null);

  const handleAnalyze = (selectedParams) => {
    setParams(selectedParams);
  };

  return (
    <div style={{ display: 'flex' }}>
      <MapSidebar onAnalyze={handleAnalyze} />
      <div style={{ flex: 1, padding: '2rem' }}>
        <MapDisplay params={params} />
        {params && params.task === 'urban-area' && (
          <UrbanAreaCharts year={params.year1} />
        )}
        {params && params.task === 'urban-area-comprehensive' && (
          <UrbanAreaComprehensiveCharts startYear={params.year1} endYear={params.year2} />
        )}
      </div>
    </div>
  );
}

export default MapTab; 