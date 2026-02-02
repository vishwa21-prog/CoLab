import React from "react";
import { 
  FiMousePointer, FiMove, FiEdit2, FiSquare, FiCircle, FiType, FiMinus 
} from "react-icons/fi";
import { BiHighlight, BiEraser } from "react-icons/bi";

const TopBar = ({ tool, setTool, color, setColor, strokeWidth, setStrokeWidth, scale, setScale }) => {
  const tools = [
    { id: "select", icon: <FiMousePointer size={20} /> },
    { id: "hand", icon: <FiMove size={20} /> },
    { id: "pencil", icon: <FiEdit2 size={20} /> },
    { id: "highlighter", icon: <BiHighlight size={20} /> },
    { id: "eraser", icon: <BiEraser size={20} /> },
    { id: "rectangle", icon: <FiSquare size={20} /> },
    { id: "circle", icon: <FiCircle size={20} /> },
    { id: "line", icon: <FiMinus size={20} style={{transform: 'rotate(-45deg)'}} /> },
    { id: "text", icon: <FiType size={20} /> },
  ];

  const colors = ["#000000", "#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];

  return (
    <div className="top-bar pointer-events-auto">
      {/* 1. Main Tools */}
      <div className="tool-panel">
        {tools.map((t) => (
          <button 
            key={t.id}
            className={`icon-btn ${tool === t.id ? "active" : ""}`}
            onClick={() => setTool(t.id)}
            title={t.id}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* 2. Properties (Color, Thickness, Zoom) */}
      <div className="properties-bar">
        <div style={{fontWeight: 600}}>Color:</div>
        <div className="color-picker-row">
          {colors.map((c) => (
            <div 
              key={c}
              className={`circle-color ${color === c ? "selected" : ""}`}
              style={{background: c}}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div style={{width: 1, height: 20, background: '#ddd'}}></div>

        <div style={{fontWeight: 600}}>Thickness:</div>
        <div style={{display:'flex', gap: 4}}>
           {[3, 5, 8, 12].map(w => (
             <button 
                key={w} 
                className={`timer-btn ${strokeWidth === w ? 'active' : ''}`}
                style={{background: strokeWidth === w ? '#eee' : 'white'}}
                onClick={() => setStrokeWidth(w)}
             >
               {w}px
             </button>
           ))}
        </div>

        <div style={{width: 1, height: 20, background: '#ddd'}}></div>

        <div style={{fontWeight: 600}}>Zoom:</div>
        <button className="timer-btn" onClick={() => setScale(s => Math.max(0.1, s - 0.1))}>-</button>
        <span>{Math.round(scale * 100)}%</span>
        <button className="timer-btn" onClick={() => setScale(s => Math.min(5, s + 0.1))}>+</button>
      </div>
    </div>
  );
};

export default TopBar;