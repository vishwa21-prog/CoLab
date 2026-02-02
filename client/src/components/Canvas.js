import React, { useLayoutEffect, useRef, useState } from "react";
import { drawElement } from "../utils/draw";

const Canvas = ({ 
  elements, onAddElement, tool, color, strokeWidth, socket, 
  panOffset, setPanOffset, scale, setScale, username 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gridSize = 50 * scale;
    const offsetX = panOffset.x % gridSize;
    const offsetY = panOffset.y % gridSize;

    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#ddd";
    for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    elements.forEach((el) => drawElement(ctx, el));
    if (currentElement) drawElement(ctx, currentElement);

    ctx.restore();
  }, [elements, panOffset, scale, currentElement]);

  const getCoords = (e) => ({
    x: (e.clientX - panOffset.x) / scale,
    y: (e.clientY - panOffset.y) / scale
  });

  const handleMouseDown = (e) => {
    const { x, y } = getCoords(e);

    if (tool === "hand" || e.button === 1) return;

    setIsDrawing(true);
    const id = Date.now().toString();

    if (tool === "pencil" || tool === "highlighter") {
      setCurrentElement({ 
        id, type: tool, points: [{ x, y }], color, strokeWidth, username 
      });
    } 
    else if (["rectangle", "circle", "line", "arrow"].includes(tool)) {
      setCurrentElement({ 
        id, type: tool, x, y, width: 0, height: 0, color, strokeWidth, username 
      });
    }
    else if (tool === "text") {
        const text = prompt("Enter text:");
        if (text) {
            onAddElement({ id, type: "text", x, y, text, color, username });
        }
        setIsDrawing(false);
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCoords(e);
    socket.emit("cursor-move", { x, y, userId: socket.id, username });

    // Handle Panning
    if (tool === "hand" && e.buttons === 1) {
        const newOffset = { x: panOffset.x + e.movementX, y: panOffset.y + e.movementY };
        setPanOffset(newOffset);
        if (window.isPresenting) socket.emit("presenter-move", { ...newOffset, scale });
        return;
    }

    if (!isDrawing || !currentElement) return;

    if (tool === "pencil" || tool === "highlighter") {
      setCurrentElement((prev) => ({
        ...prev,
        points: [...prev.points, { x, y }]
      }));
    } 
    else if (["rectangle", "circle", "line", "arrow"].includes(tool)) {
      setCurrentElement((prev) => ({
        ...prev,
        width: x - prev.x, 
        height: y - prev.y 
      }));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentElement) {
      onAddElement(currentElement);
      setCurrentElement(null);
    }
    setIsDrawing(false);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(scale + delta, 0.1), 5);
        setScale(newScale);
        if (window.isPresenting) socket.emit("presenter-move", { ...panOffset, scale: newScale });
    } else {
        const newOffset = { x: panOffset.x - e.deltaX, y: panOffset.y - e.deltaY };
        setPanOffset(newOffset);
        if (window.isPresenting) socket.emit("presenter-move", { ...newOffset, scale });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ display: "block", touchAction: "none" }}
    />
  );
};

export default Canvas;