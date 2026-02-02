import React, { useRef } from "react";

const Toolbar = ({ tool, setTool, color, setColor, undo, clear, onImageUpload }) => {
  const fileInputRef = useRef(null);

  const btnStyle = (t) => ({
    padding: "10px 15px",
    background: tool === t ? "#e0efff" : "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px"
  });

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: "white", padding: "8px", borderRadius: "12px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)", display: "flex", gap: "8px", zIndex: 100
    }}>
      <button style={btnStyle("hand")} onClick={() => setTool("hand")} title="Pan">✋</button>
      <button style={btnStyle("select")} onClick={() => setTool("select")} title="Select/Move">↖️</button>
      
      <div style={{width: 1, background: "#ddd"}}></div>
      
      <button style={btnStyle("pencil")} onClick={() => setTool("pencil")} title="Pen">🖊️</button>
      <button style={btnStyle("sticky")} onClick={() => setTool("sticky")} title="Sticky Note">🟨</button>
      
      {/* Image Upload Button */}
      <button style={btnStyle("image")} onClick={handleImageClick} title="Upload Image">🖼️</button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{display: "none"}} 
        accept="image/*"
        onChange={onFileChange} 
      />

      <div style={{width: 1, background: "#ddd"}}></div>
      
      <button style={btnStyle("rectangle")} onClick={() => setTool("rectangle")} title="Rectangle">⬜</button>
      <button style={btnStyle("circle")} onClick={() => setTool("circle")} title="Circle">⭕</button>
      <button style={btnStyle("line")} onClick={() => setTool("line")} title="Line">📏</button>
      <button style={btnStyle("text")} onClick={() => setTool("text")} title="Text">📝</button>
      
      <div style={{width: 1, background: "#ddd"}}></div>
      
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <button onClick={clear} style={btnStyle()}>🗑️</button>
    </div>
  );
};

export default Toolbar;