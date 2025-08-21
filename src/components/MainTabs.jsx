import React, { useState } from 'react';
import ChatPage from './ChatPage';
import MapTab from './MapTab';

const TAB_LIST = [
  { key: 'chat', label: 'AI Assistant' },
  { key: 'map', label: 'Analytics' },
  { key: 'analysis', label: 'Time series' },
];

function MainTabs({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('chat');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPage token={token} onLogout={onLogout} />;
      case 'map':
        return <MapTab />;
      case 'analysis':
        return <div style={{ padding: '2rem' }}>This is Time series Tab.</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', background: '#f7f7f7' }}>
        {TAB_LIST.map(tab => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '1rem 2rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '3px solid #1976d2' : '3px solid transparent',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              background: activeTab === tab.key ? '#fff' : 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div style={{ minHeight: '400px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default MainTabs; 