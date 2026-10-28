import React from 'react';
import { 
  Wind, 
  Cpu, 
  Download, 
  Filter, 
  Moon, 
  RefreshCw, 
  Sun, 
  ExternalLink 
} from 'lucide-react';
import { getExportUrl } from '../services/api';

const POWER_BI_URL = "https://app.powerbi.com/view?r=eyJrIjoiZmVhYzA4MzgtZDlhNC00NmMzLWI4NzItNDVlNWViMTkzNWYwIiwidCI6ImQxZjE0MzQ4LWYxYjUtNGEwOS1hYzk5LTdlYmYyMTNjYmM4MSIsImMiOjEwfQ%3D%3D";

export default function Header({ 
  filters, 
  isDarkMode, 
  toggleTheme, 
  onRefresh, 
  onToggleSidebar, 
  onOpenPredictor,
  sidebarOpen,
  isRefreshing
}) {
  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-icon">
          <Wind size={20} className="pulse-icon" />
        </div>
        <div className="brand-text">
          <div className="title-row">
            <h1>Mumbai Air Quality Analytics</h1>
            <span className="live-pill">
              <span className="live-dot"></span>
              ML Powered
            </span>
          </div>
          <div className="meta-row">
            <span>2018–2020 Monitoring</span>
            <span className="bullet">•</span>
            <span>Project I012 · I026 · I034</span>
            <span className="bullet">•</span>
            <span>MERN Stack</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* Task 3: PBI Dashboard button redirecting to external link */}
        <a 
          href={POWER_BI_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-pbi"
          title="Open Official Power BI Report"
        >
          <ExternalLink size={14} />
          <span>PBI Dashboard</span>
        </a>

        {/* Live ML Predictor Modal Trigger */}
        <button 
          className="btn btn-ml"
          onClick={onOpenPredictor}
          title="Open Live Random Forest ML Predictor"
        >
          <Cpu size={15} />
          <span>Live ML Predictor</span>
        </button>

        {/* Export Data */}
        <a 
          href={getExportUrl(filters)} 
          download="mumbai_aqi_filtered.csv"
          className="btn btn-secondary"
          title="Export Filtered CSV Data"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </a>

        {/* Refresh */}
        <button 
          className="btn btn-secondary"
          onClick={onRefresh}
          title="Refresh Data"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
          <span>{isRefreshing ? 'Loading…' : 'Refresh'}</span>
        </button>

        {/* Filters Sidebar Toggle */}
        <button 
          className={`btn ${sidebarOpen ? 'btn-active' : 'btn-secondary'}`}
          onClick={onToggleSidebar}
          title="Toggle Filters"
        >
          <Filter size={14} />
          <span>Filters</span>
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-icon"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
