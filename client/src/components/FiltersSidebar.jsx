import React from 'react';
import { RotateCcw, X, SlidersHorizontal, Check } from 'lucide-react';

const CATEGORY_COLORS = {
  'Good': '#10b981',
  'Satisfactory': '#0ea5e9',
  'Moderate': '#f59e0b',
  'Poor': '#8b5cf6',
  'Very Poor': '#ec4899',
  'Severe': '#ef4444'
};

export default function FiltersSidebar({
  filterOptions,
  selectedFilters,
  onFilterChange,
  onResetFilters,
  isOpen,
  onClose
}) {
  const {
    years = [2018, 2019, 2020],
    categories = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
    stations = [],
    seasons = ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon']
  } = filterOptions || {};

  const handleYearChange = (yr) => {
    onFilterChange('year', yr);
  };

  const handleCategoryChange = (cat) => {
    onFilterChange('category', selectedFilters.category === cat ? 'All' : cat);
  };

  const handleStationChange = (st) => {
    onFilterChange('station', selectedFilters.station === st ? 'All' : st);
  };

  const handleSeasonChange = (s) => {
    onFilterChange('season', selectedFilters.season === s ? 'All' : s);
  };

  return (
    <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} className="accent-icon" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Filter Data</h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Reset All Filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          <button 
            className="btn btn-icon btn-sm"
            onClick={onClose}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Year Chips */}
        <div className="filter-group">
          <label className="filter-label">Monitoring Year</label>
          <div className="chip-grid">
            <button
              type="button"
              className={`filter-chip ${(!selectedFilters.year || selectedFilters.year === 'All') ? 'active' : ''}`}
              onClick={() => handleYearChange('All')}
            >
              All Years
            </button>
            {years.map(yr => (
              <button
                key={yr}
                type="button"
                className={`filter-chip ${String(selectedFilters.year) === String(yr) ? 'active' : ''}`}
                onClick={() => handleYearChange(String(yr))}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* AQI Category Pills */}
        <div className="filter-group">
          <label className="filter-label">Air Quality Severity</label>
          <div className="category-pill-grid">
            <button
              type="button"
              className={`cat-pill ${(!selectedFilters.category || selectedFilters.category === 'All') ? 'active' : ''}`}
              onClick={() => onFilterChange('category', 'All')}
            >
              All Levels
            </button>
            {categories.map(cat => {
              const isSelected = selectedFilters.category === cat;
              const color = CATEGORY_COLORS[cat] || '#3b82f6';
              return (
                <button
                  key={cat}
                  type="button"
                  className={`cat-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    borderColor: isSelected ? color : 'var(--card-border)',
                    backgroundColor: isSelected ? `${color}25` : 'transparent',
                    color: isSelected ? color : 'var(--text-main)'
                  }}
                >
                  <span className="dot" style={{ backgroundColor: color }}></span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Season Chips */}
        <div className="filter-group">
          <label className="filter-label">Meteorological Season</label>
          <div className="chip-grid">
            <button
              type="button"
              className={`filter-chip ${(!selectedFilters.season || selectedFilters.season === 'All') ? 'active' : ''}`}
              onClick={() => onFilterChange('season', 'All')}
            >
              All Seasons
            </button>
            {seasons.map(s => (
              <button
                key={s}
                type="button"
                className={`filter-chip ${selectedFilters.season === s ? 'active' : ''}`}
                onClick={() => handleSeasonChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Monitoring Station Selector */}
        <div className="filter-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="filter-label" style={{ marginBottom: 0 }}>Station ({stations.length})</label>
            {selectedFilters.station && selectedFilters.station !== 'All' && (
              <span 
                style={{ fontSize: '0.7rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => onFilterChange('station', 'All')}
              >
                Clear
              </span>
            )}
          </div>
          <div className="station-list">
            <div 
              className={`station-item ${(!selectedFilters.station || selectedFilters.station === 'All') ? 'selected' : ''}`}
              onClick={() => onFilterChange('station', 'All')}
            >
              <span>All Stations Combined</span>
              {(!selectedFilters.station || selectedFilters.station === 'All') && <Check size={14} />}
            </div>
            {stations.map(st => {
              const isSelected = selectedFilters.station === st;
              return (
                <div 
                  key={st}
                  className={`station-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleStationChange(st)}
                  title={st}
                >
                  <span>{st.split(',')[0]}</span>
                  {isSelected && <Check size={14} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
