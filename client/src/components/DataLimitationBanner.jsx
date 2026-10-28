import React, { useState } from 'react';
import { Info, X, MapPin } from 'lucide-react';

export default function DataLimitationBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="pbi-banner warning">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Spatial Analysis Finding from ML Pipeline:</strong>{' '}
          The dataset provides historical daily observations for 10 Mumbai monitoring stations (3,872 days), but 0 observations for the 3 Navi Mumbai stations (Airoli MH017, Mahape MH018, Nerul MH019).
          External coordinates were geocoded for all 13 stations. Random Forest model predictions apply to observed Mumbai records.
        </div>
      </div>
      <button 
        onClick={() => setVisible(false)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
