// client/src/utils/draw.js

// ... wrapText helper ...
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    // ... (Keep existing wrapText) ...
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    words.forEach((word) => {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, x, currentY);
            line = word + " ";
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, x, currentY);
};


export const drawElement = (ctx, element) => {
  const { type, x, y, width, height, points, text, color, strokeWidth, src, rows, cols, data } = element;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // --- TABLE (New) ---
  if (type === "table") {
      ctx.fillStyle = "white";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      
      const rowHeight = height / rows;
      const colWidth = width / cols;

      // Draw Grid Lines
      ctx.beginPath();
      // Horizontal
      for(let i=0; i<=rows; i++) {
          ctx.moveTo(x, y + (i * rowHeight));
          ctx.lineTo(x + width, y + (i * rowHeight));
      }
      // Vertical
      for(let i=0; i<=cols; i++) {
          ctx.moveTo(x + (i * colWidth), y);
          ctx.lineTo(x + (i * colWidth), y + height);
      }
      ctx.stroke();

      // Draw Text in Cells
      ctx.fillStyle = "black";
      ctx.font = "14px 'Inter', sans-serif";
      if(data && data.length) {
          data.forEach((row, rIndex) => {
              row.forEach((cellText, cIndex) => {
                  if(cellText) {
                    // Simple centering
                    const cx = x + (cIndex * colWidth) + 5;
                    const cy = y + (rIndex * rowHeight) + 20;
                    ctx.fillText(cellText, cx, cy, colWidth - 10);
                  }
              });
          });
      }
  }

  // Sticky Logic Reminder:
  else if (type === "sticky") {
    // ... (same as before) ...
    ctx.fillStyle = color || "#fff740";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#333"; // Default text color for display
    ctx.font = "16px 'Inter', sans-serif";
    wrapText(ctx, text || "", x + 15, y + 30, width - 30, 24);
  }
  
  // Highlighter
  else if (type === "highlighter") {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 15;
      ctx.beginPath();
      if (points && points.length) {
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach(p => ctx.lineTo(p.x, p.y));
      }
      ctx.stroke();
  }

  // Standard Shapes
  else if (type === "pencil") {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      if (points && points.length) {
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach(p => ctx.lineTo(p.x, p.y));
      }
      ctx.stroke();
  }
  else if (["rectangle", "circle", "line", "text", "image"].includes(type)) {
     // ... (Paste your existing standard shape logic here) ...
     // Re-implementing briefly for completeness in this snippet:
     ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = strokeWidth;
     if (type === "rectangle") ctx.strokeRect(x, y, width, height);
     else if (type === "circle") {
         ctx.beginPath();
         ctx.ellipse(x + width/2, y + height/2, Math.abs(width)/2, Math.abs(height)/2, 0, 0, 2 * Math.PI);
         ctx.stroke();
     }
     else if (type === "line") { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + width, y + height); ctx.stroke(); }
     else if (type === "text") { ctx.font = "24px 'Inter', sans-serif"; ctx.fillText(text, x, y); }
     // --- IMAGES ---
  else if (type === "image") {
    // 1. Create the image object if it doesn't exist
    if (!element.img) {
        const img = new Image();
        img.src = src;
        // Optimization: When loaded, we just set the property. 
        // The next render loop will pick it up.
        img.onload = () => { element.img = img; }; 
        element.img = img; 
    }
    
    // 2. Draw it if ready
    if (element.img && element.img.complete && element.img.naturalWidth !== 0) {
        ctx.drawImage(element.img, x, y, width, height);
    } else {
        // 3. Placeholder while loading
        ctx.save();
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = "#888";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Loading Image...", x + width/2, y + height/2);
        ctx.restore();
    }
  }
  }

  ctx.restore();
};

export const drawSelection = (ctx, element) => {
    // ... (Keep existing drawSelection) ...
    const { x, y, width, height, type, points } = element;
    ctx.save();
    ctx.strokeStyle = "#3b82f6"; 
    ctx.lineWidth = 2; 
    ctx.setLineDash([6, 4]);

    let minX = x, minY = y, w = width, h = height;

    if (type === "pencil" || type === "highlighter") {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        minX = Math.min(...xs); minY = Math.min(...ys);
        w = Math.max(...xs) - minX; h = Math.max(...ys) - minY;
    } else if (type === "table") {
        minX = x; minY = y; w = width; h = height;
    } else {
        minX = Math.min(x, x + width); minY = Math.min(y, y + height);
        w = Math.abs(width); h = Math.abs(height);
    }

    const padding = 8;
    ctx.strokeRect(minX - padding, minY - padding, w + padding*2, h + padding*2);
    
    // Draw Handles (Corners)
    ctx.fillStyle = "white"; ctx.setLineDash([]);
    const handleSize = 8;
    const drawHandle = (hx, hy) => {
        ctx.fillRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
        ctx.strokeRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
    };
    drawHandle(minX - padding, minY - padding);
    drawHandle(minX + w + padding, minY - padding);
    drawHandle(minX + w + padding, minY + h + padding);
    drawHandle(minX - padding, minY + h + padding);

    ctx.restore();
};