import React, { useLayoutEffect, useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { FiX } from "react-icons/fi";
import { drawElement, drawSelection } from "./utils/draw";
import { isWithinElement, getCoords, getResizeHandle, isInsideBox, resizePoints } from "./utils/math";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import "./App.css";

const socket = io("https://colab-server-kgxw.onrender.com", { 
    transports: ["websocket"] 
});

const randColor = () => {
    const palette = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];
    return palette[Math.floor(Math.random() * palette.length)];
};

function App() {
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);
  
  // User info
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [myColor] = useState(randColor()); 

  // Main board state
  const [items, setItems] = useState([]);
  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(3);
  const [action, setAction] = useState("none"); // moving, resizing, drawing
  const [selected, setSelected] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [bgStyle, setBgStyle] = useState("grid");
  const [peers, setPeers] = useState({}); // other users cursors

  // UI toggles
  const [editingItem, setEditingItem] = useState(null); 
  const [selectBox, setSelectBox] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tableDims, setTableDims] = useState({ rows: 3, cols: 3 });
  const [menu, setMenu] = useState(null); // right click

  // Dragging temps
  const [drawing, setDrawing] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null); 

  // Setup sockets
  useEffect(() => {
    socket.on("load-canvas", (data) => setItems(data));
    socket.on("add-element", (newItem) => setItems((prev) => [...prev, newItem]));
    socket.on("update-element", (updated) => setItems(prev => prev.map(item => item.id === updated.id ? updated : item)));
    socket.on("delete-element", (id) => setItems(prev => prev.filter(item => item.id !== id)));
    socket.on("cursor-move", (data) => setPeers(prev => ({ ...prev, [data.id]: data })));
    socket.on("clear", () => setItems([]));
    
    return () => socket.off();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
      const onKeyDown = (e) => {
          if ((e.key === "Delete" || e.key === "Backspace") && selected && !editingItem) {
              const id = selected.id;
              setItems(prev => prev.filter(i => i.id !== id));
              socket.emit("delete-element", id);
              setSelected(null);
          }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, editingItem]);

  const joinRoom = (e) => {
      e.preventDefault();
      if (inputName.trim()) {
          setName(inputName);
          setJoined(true);
      }
  };

  // --- Actions ---

  const addTable = () => {
      const { rows, cols } = tableDims;
      const cx = (window.innerWidth/2 - offset.x) / zoom;
      const cy = (window.innerHeight/2 - offset.y) / zoom;
      
      const newItem = {
          id: Date.now().toString(), type: "table",
          x: cx - 150, y: cy - 100, width: 100 * cols, height: 40 * rows,
          rows, cols, data: Array(rows).fill("").map(() => Array(cols).fill("")),
          lastEditedBy: name 
      };
      setItems(prev => [...prev, newItem]);
      socket.emit("add-element", newItem);
      setModalOpen(false);
      setTool("select");
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const cx = (window.innerWidth / 2 - offset.x) / zoom;
        const cy = (window.innerHeight / 2 - offset.y) / zoom;
        let w = img.width; let h = img.height;
        if (w > 500) { h = (500/w) * h; w = 500; }
        
        const newItem = { 
            id: Date.now().toString(), type: "image", 
            x: cx - w/2, y: cy - h/2, width: w, height: h, src: e.target.result,
            lastEditedBy: name 
        };
        setItems(prev => [...prev, newItem]);
        socket.emit("add-element", newItem);
      };
    };
    reader.readAsDataURL(file);
  };

  const addSticky = (noteColor) => {
      const cx = (window.innerWidth/2 - offset.x) / zoom;
      const cy = (window.innerHeight/2 - offset.y) / zoom;
      const newItem = { 
          id: Date.now().toString(), type: "sticky", 
          x: cx, y: cy, width: 200, height: 200, text: "Double click", color: noteColor,
          lastEditedBy: name 
      };
      setItems(prev => [...prev, newItem]);
      socket.emit("add-element", newItem);
      setTool("select");
  };

  // --- Drawing Loop ---
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw BG
    ctx.save();
    ctx.fillStyle = bgStyle === "none" ? "#ffffff" : "#f9f9f9";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    const size = 50 * zoom;
    const ox = offset.x % size;
    const oy = offset.y % size;

    if (bgStyle === "grid") {
        ctx.beginPath(); ctx.lineWidth = 0.5; ctx.strokeStyle = "#e0e0e0";
        for (let x = ox; x < canvas.width; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = oy; y < canvas.height; y += size) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();
    } 
    else if (bgStyle === "dots") { 
        ctx.fillStyle = "#cbd5e1"; 
        for (let x = ox; x < canvas.width; x += size) {
            for (let y = oy; y < canvas.height; y += size) {
                ctx.beginPath(); ctx.arc(x, y, 1.5 * zoom, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
    ctx.restore();

    // Draw Items
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    items.forEach(item => {
      if (editingItem && item.id === editingItem.id && item.type !== "table") return; 
      drawElement(ctx, item);
      if (selected && item.id === selected.id) drawSelection(ctx, item);
    });
    
    // Draw current action
    if (action === "drawing" && drawing) drawElement(ctx, drawing);
    ctx.restore();

    // Selection Box
    if (selectBox) {
        ctx.save();
        ctx.fillStyle = "rgba(59, 130, 246, 0.1)"; ctx.strokeStyle = "#3b82f6";
        const { x1, y1, x2, y2 } = selectBox;
        const minX = Math.min(x1, x2), minY = Math.min(y1, y2), w = Math.abs(x1-x2), h = Math.abs(y1-y2);
        ctx.fillRect(minX, minY, w, h); ctx.strokeRect(minX, minY, w, h);
        ctx.restore();
    }
  }, [items, offset, zoom, selected, drawing, action, bgStyle, editingItem, selectBox]);


  // --- Mouse Logic ---
  const onDown = (e) => {
    if (!joined || editingItem) return; 
    if (menu) setMenu(null); // close menu

    const { x, y } = getCoords(e, offset, zoom);
    
    // Panning / Eraser
    if (tool === "hand" || e.button === 1) { setAction("panning"); return; }
    if (tool === "eraser") { setAction("erasing"); return; }

    if (tool === "select") {
        if (selected) {
            const handle = getResizeHandle(x, y, selected);
            if (handle) {
                setDragStart({ x, y }); 
                const copy = JSON.parse(JSON.stringify(selected));
                if (selected.img) copy.img = selected.img; // keep image cache
                setSnapshot(copy);
                setDragStart(prev => ({ ...prev, handle }));
                setAction("resizing"); 
                return;
            }
        }
        
        const found = items.slice().reverse().find(i => isWithinElement(x, y, i));
        if (found) {
            setSelected(found);
            setDragStart({ x, y }); 
            const copy = JSON.parse(JSON.stringify(found));
            if (found.img) copy.img = found.img;
            setSnapshot(copy);
            setAction("moving");
        } else {
            setSelected(null);
            setSelectBox({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
            setAction("selecting");
        }
        return;
    }

    if (tool === "text") {
        const id = Date.now().toString();
        const ctx = canvasRef.current.getContext("2d");
        ctx.font = "24px 'Inter', sans-serif";
        const txt = "Type here";
        const metrics = ctx.measureText(txt);
        const newItem = { 
            id, type: "text", x, y, text: txt, color, width: metrics.width, height: 30,
            lastEditedBy: name 
        };
        setItems(prev => [...prev, newItem]);
        setTool("select"); 
        return;
    }

    // New drawing
    const id = Date.now().toString();
    setAction("drawing");
    if (["pencil", "highlighter"].includes(tool)) {
        setDrawing({ id, type: tool, points: [{x, y}], color, strokeWidth: tool === "highlighter" ? 15 : width, lastEditedBy: name });
    } else {
        setDrawing({ id, type: tool, x, y, width: 0, height: 0, color, strokeWidth: width, lastEditedBy: name });
    }
  };

  const onMove = (e) => {
    if (!joined) return;
    const { x, y } = getCoords(e, offset, zoom);
    
    socket.emit("cursor-move", { id: socket.id, x, y, color: myColor, username: name });

    if (action === "panning") {
       setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
       return;
    }

    if (action === "resizing" && snapshot) {
        const { handle } = dragStart;
        const start = snapshot;
        let nx = start.x, ny = start.y, nw = start.width, nh = start.height;
        
        if (handle.includes("l")) { nw = start.width + (start.x - x); nx = x; }
        if (handle.includes("r")) { nw = x - start.x + start.width; } 
        if (handle.includes("t")) { nh = start.height + (start.y - y); ny = y; }
        if (handle.includes("b")) { nh = y - start.y + start.height; }

        const updated = { 
            ...selected, x: nx, y: ny, width: nw, height: nh, 
            lastEditedBy: name 
        };
        if (snapshot.img) updated.img = snapshot.img;
        if (["pencil", "highlighter"].includes(updated.type)) updated.points = resizePoints(start.points, start, updated);

        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        setSelected(updated);
    }
    else if (action === "moving" && snapshot) {
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;
        const updated = { 
            ...snapshot, x: snapshot.x + dx, y: snapshot.y + dy,
            lastEditedBy: name
        };
        if (snapshot.img) updated.img = snapshot.img;
        if (["pencil", "highlighter"].includes(updated.type)) updated.points = snapshot.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
        
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        setSelected(updated);
    }
    else if (action === "drawing") {
        if (["pencil", "highlighter"].includes(tool)) setDrawing(prev => ({ ...prev, points: [...prev.points, {x, y}] }));
        else setDrawing(prev => ({ ...prev, width: x - prev.x, height: y - prev.y }));
    }
    else if (action === "selecting") {
        setSelectBox(prev => ({ ...prev, x2: e.clientX, y2: e.clientY }));
    }
    else if (action === "erasing") {
        const hit = items.slice().reverse().find(i => isWithinElement(x, y, i));
        if (hit) {
            setItems(prev => prev.filter(i => i.id !== hit.id));
            socket.emit("delete-element", hit.id);
        }
    }
  };

  const onUp = () => {
    if (action === "selecting" && selectBox) {
        // calc box logic
        const sbX1 = (Math.min(selectBox.x1, selectBox.x2) - offset.x) / zoom;
        const sbY1 = (Math.min(selectBox.y1, selectBox.y2) - offset.y) / zoom;
        const sbX2 = (Math.max(selectBox.x1, selectBox.x2) - offset.x) / zoom;
        const sbY2 = (Math.max(selectBox.y1, selectBox.y2) - offset.y) / zoom;
        
        const found = items.find(i => isInsideBox(sbX1, sbY1, sbX2, sbY2, i));
        if (found) setSelected(found);
        setSelectBox(null);
    }
    else if ((action === "moving" || action === "resizing") && selected) {
        socket.emit("update-element", selected);
    }
    else if (action === "drawing" && drawing) {
        setItems(prev => [...prev, drawing]); 
        socket.emit("add-element", drawing);
    }
    
    setAction("none"); 
    setDrawing(null);
    setSnapshot(null);
  };

  const onRightClick = (e) => {
      e.preventDefault();
      const { x, y } = getCoords(e, offset, zoom);
      const hit = items.slice().reverse().find(i => isWithinElement(x, y, i));
      
      if (hit) {
          setMenu({
              x: e.clientX,
              y: e.clientY,
              info: `Last edited by: ${hit.lastEditedBy || "Unknown"}`
          });
      } else {
          setMenu(null);
      }
  };

  const onDoubleClick = (e) => {
      const { x, y } = getCoords(e, offset, zoom);
      const hit = items.slice().reverse().find(i => isWithinElement(x, y, i));
      
      if (hit) {
          if (["text", "sticky"].includes(hit.type)) {
              setEditingItem(hit);
              setTool("select");
          } else if (hit.type === "table") {
               const relX = x - hit.x;
               const relY = y - hit.y;
               const col = Math.floor(relX / (hit.width / hit.cols));
               const row = Math.floor(relY / (hit.height / hit.rows));
               if(col >= 0 && col < hit.cols && row >= 0 && row < hit.rows) {
                   const cellText = prompt("Edit Cell:", hit.data[row][col]);
                   if (cellText !== null) {
                       const newData = [...hit.data];
                       newData[row] = [...newData[row]];
                       newData[row][col] = cellText;
                       const updated = { 
                           ...hit, data: newData, 
                           lastEditedBy: name 
                       };
                       setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
                       socket.emit("update-element", updated);
                   }
               }
          }
      }
  };

  const onTextBlur = (e) => {
      const val = e.target.value;
      if (editingItem.text === "" && val === "") {
          setItems(prev => prev.filter(i => i.id !== editingItem.id));
      } else {
          const ctx = canvasRef.current.getContext("2d");
          ctx.font = "24px 'Inter', sans-serif";
          const m = ctx.measureText(val);
          const updated = { 
              ...editingItem, text: val, width: m.width, height: 30,
              lastEditedBy: name 
          };
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          socket.emit("update-element", updated);
      }
      setEditingItem(null);
  };

  return (
    <div className="App">
      {!joined && (
          <div className="login-screen">
              <div className="login-card">
                  <h2>Join Whiteboard</h2>
                  <form onSubmit={joinRoom}>
                      <input type="text" placeholder="Enter a nickname..." value={inputName} onChange={(e) => setInputName(e.target.value)} autoFocus />
                      <button type="submit" className="login-btn">Start Collaborating</button>
                  </form>
              </div>
          </div>
      )}

      {joined && (
        <div className="ui-layer">
          <Sidebar 
              username={name} userColor={myColor} bgType={bgStyle} setBgType={setBgStyle} 
              onAddSticky={addSticky} onClear={() => { setItems([]); socket.emit("clear"); }}
              onAddImage={() => uploadRef.current.click()}
              onAddTable={() => setModalOpen(true)}
              onExport={saveImage}
          />
          <TopBar tool={tool} setTool={setTool} color={color} setColor={setColor} strokeWidth={width} setStrokeWidth={setWidth} scale={zoom} setScale={setZoom} />
        </div>
      )}

      <input type="file" ref={uploadRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { uploadImage(f); e.target.value = null; } }} />

      {modalOpen && (
          <div className="modal-overlay">
              <div className="modal-box">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
                      <h3>Create Table</h3>
                      <FiX style={{cursor:'pointer'}} onClick={() => setModalOpen(false)}/>
                  </div>
                  <div style={{marginBottom:10}}>
                      <label>Rows: </label>
                      <input type="number" min="1" max="10" value={tableDims.rows} onChange={(e) => setTableDims(prev => ({...prev, rows: parseInt(e.target.value)}))} />
                  </div>
                  <div style={{marginBottom:20}}>
                      <label>Columns: </label>
                      <input type="number" min="1" max="10" value={tableDims.cols} onChange={(e) => setTableDims(prev => ({...prev, cols: parseInt(e.target.value)}))} />
                  </div>
                  <button className="start-btn" onClick={addTable}>Insert Table</button>
              </div>
          </div>
      )}

      {Object.values(peers).map(p => {
         if (p.id === socket.id) return null; 
         return (
            <div key={p.id} style={{
              position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 5,
              transform: `translate(${p.x * zoom + offset.x}px, ${p.y * zoom + offset.y}px)`,
              transition: "transform 0.1s linear" 
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={p.color || "black"} stroke="white" strokeWidth="2" style={{filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))'}}>
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              </svg>
              <div style={{
                  position: "absolute", left: 14, top: 14,
                  background: p.color || 'black', color: 'white', 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                  whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                  {p.username || "Guest"}
              </div>
            </div>
         );
      })}

      {menu && (
          <div style={{
              position: "fixed", top: menu.y, left: menu.x,
              background: "white", padding: "8px 12px", borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0",
              zIndex: 6000, fontSize: "13px", fontWeight: "500", color: "#334155"
          }}>
              {menu.info}
          </div>
      )}

      {editingItem && editingItem.type !== "table" && (
        <textarea
            autoFocus
            className="text-edit-overlay"
            style={{
                position: "absolute",
                left: editingItem.x * zoom + offset.x,
                top: editingItem.y * zoom + offset.y,
                fontSize: 24 * zoom + "px",
                color: editingItem.type === "sticky" ? "black" : editingItem.color,
                border: "1px dashed #3b82f6",
                background: "rgba(255,255,255,0.8)",
                outline: "none", resize: "none", overflow: "hidden", zIndex: 1000,
                minWidth: "150px", minHeight: "40px",
                width: editingItem.width ? editingItem.width * zoom : "auto",
                height: editingItem.height ? editingItem.height * zoom : "auto",
            }}
            defaultValue={editingItem.text}
            onBlur={onTextBlur}
        />
      )}

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onDoubleClick={onDoubleClick}
        onContextMenu={onRightClick}
        style={{ cursor: tool === "hand" ? "grab" : "default" }}
      />
    </div>
  );
}

export default App;