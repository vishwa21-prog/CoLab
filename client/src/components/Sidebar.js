import React from "react";
import { FiImage, FiDownload, FiTrash2, FiGrid } from "react-icons/fi";

const Sidebar = ({ username, userColor, bgType, setBgType, onAddSticky, onClear, onExport, onAddImage, onAddTable }) => {
  return (
    <div className="sidebar pointer-events-auto">
      <div className="section-title">Current User</div>
      <div className="user-card">
        <div className="avatar" style={{ background: userColor }}>
            {username.charAt(0).toUpperCase()}
        </div>
        <div style={{fontSize: '14px', fontWeight: 500}}>{username}</div>
      </div>
      <div style={{height: 1, background: '#eee'}}></div>

      <div className="section-title">Insert</div>
      <button className="menu-btn" onClick={onAddTable}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}><FiGrid size={16}/> Table</div>
      </button>

      <div style={{height: 1, background: '#eee'}}></div>

      <div className="section-title">Sticky Notes</div>
      <div className="color-grid">
        <div className="color-swatch" style={{background: '#ffeb3b'}} onClick={() => onAddSticky('#ffeb3b')}></div>
        <div className="color-swatch" style={{background: '#ffc107'}} onClick={() => onAddSticky('#ffc107')}></div>
        <div className="color-swatch" style={{background: '#a7ffeb'}} onClick={() => onAddSticky('#a7ffeb')}></div>
        <div className="color-swatch" style={{background: '#ff8a80'}} onClick={() => onAddSticky('#ff8a80')}></div>
      </div>

      <div style={{height: 1, background: '#eee'}}></div>

      <div className="section-title">Background</div>
      <button className={`menu-btn ${bgType === 'none' ? 'active' : ''}`} onClick={() => setBgType('none')}>Plain</button>
      <button className={`menu-btn ${bgType === 'grid' ? 'active' : ''}`} onClick={() => setBgType('grid')}>Grid</button>
      <button className={`menu-btn ${bgType === 'dots' ? 'active' : ''}`} onClick={() => setBgType('dots')}>Dotted</button>

      <div style={{height: 1, background: '#eee'}}></div>

      <div className="section-title">Media</div>
      <button className="menu-btn" onClick={onAddImage}><div style={{display:'flex', gap:8, alignItems:'center'}}><FiImage size={16}/> Image</div></button>

      <div style={{flex: 1}}></div>
      <button className="action-btn btn-green" onClick={onExport}><FiDownload size={16}/> Export PNG</button>
      <button className="action-btn btn-red" style={{marginTop: 10}} onClick={onClear}><FiTrash2 size={16}/> Clear</button>
    </div>
  );
};
export default Sidebar;