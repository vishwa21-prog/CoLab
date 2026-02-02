// client/src/utils/math.js

const distanceToSegment = (p, a, b) => {
  const l2 = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  if (l2 === 0) return Math.sqrt(Math.pow(p.x - a.x, 2) + Math.pow(p.y - a.y, 2));
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(Math.pow(p.x - (a.x + t * (b.x - a.x)), 2) + Math.pow(p.y - (a.y + t * (b.y - a.y)), 2));
};

export const resizePoints = (points, oldBox, newBox) => {
    // Avoid division by zero
    if (oldBox.width === 0 || oldBox.height === 0) return points;

    const scaleX = newBox.width / oldBox.width;
    const scaleY = newBox.height / oldBox.height;

    return points.map(p => ({
        x: newBox.x + (p.x - oldBox.x) * scaleX,
        y: newBox.y + (p.y - oldBox.y) * scaleY
    }));
};

export const isWithinElement = (x, y, element) => {
  const { type, x: x1, y: y1, width, height, points } = element;

  // Box Shapes
  if (["rectangle", "image", "sticky", "text", "table"].includes(type)) {
    const minX = Math.min(x1, x1 + width);
    const maxX = Math.max(x1, x1 + width);
    const minY = Math.min(y1, y1 + height);
    const maxY = Math.max(y1, y1 + height);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }

  // Line
  if (type === "line") {
    const a = { x: x1, y: y1 };
    const b = { x: x1 + width, y: y1 + height };
    const c = { x, y };
    const offset = distanceToSegment(c, a, b);
    return offset < 10; // Increased tolerance to 10px
  }

  // Pencil and Highlighter
  if (["pencil", "highlighter"].includes(type)) {
    // First, check bounding box for performance
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs) - 10;
    const maxX = Math.max(...xs) + 10;
    const minY = Math.min(...ys) - 10;
    const maxY = Math.max(...ys) + 10;

    if (x < minX || x > maxX || y < minY || y > maxY) return false;

    // Detailed check
    return points.some((point, i) => {
      if (i === 0) return false;
      const prev = points[i - 1];
      return distanceToSegment({ x, y }, prev, point) < 10; // Easier to grab
    });
  }

  // Circle
  if (type === "circle") {
    const radiusX = Math.abs(width) / 2;
    const radiusY = Math.abs(height) / 2;
    const centerX = x1 + width / 2;
    const centerY = y1 + height / 2;
    const normalized = Math.pow(x - centerX, 2) / Math.pow(radiusX, 2) + Math.pow(y - centerY, 2) / Math.pow(radiusY, 2);
    return normalized <= 1;
  }

  return false;
};


export const isInsideBox = (x1, y1, x2, y2, element) => {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    const elX = element.x + (element.width || 0) / 2;
    const elY = element.y + (element.height || 0) / 2;

    if (element.type === "pencil" || element.type === "highlighter") {
        return element.points[0].x >= minX && element.points[0].x <= maxX &&
               element.points[0].y >= minY && element.points[0].y <= maxY;
    }

    return elX >= minX && elX <= maxX && elY >= minY && elY <= maxY;
};

export const getCoords = (e, panOffset, scale) => ({
  x: (e.clientX - panOffset.x) / scale,
  y: (e.clientY - panOffset.y) / scale
});

export const getResizeHandle = (x, y, element) => {
    let { x: ex, y: ey, width, height, type, points } = element;
    
    if (["pencil", "highlighter"].includes(type)) {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        ex = Math.min(...xs); ey = Math.min(...ys);
        width = Math.max(...xs) - ex; height = Math.max(...ys) - ey;
    }

    const minX = Math.min(ex, ex + width);
    const minY = Math.min(ey, ey + height);
    const w = Math.abs(width);
    const h = Math.abs(height);
    const threshold = 10;

    if (Math.abs(x - minX) < threshold && Math.abs(y - minY) < threshold) return "tl";
    if (Math.abs(x - (minX + w)) < threshold && Math.abs(y - minY) < threshold) return "tr";
    if (Math.abs(x - minX) < threshold && Math.abs(y - (minY + h)) < threshold) return "bl";
    if (Math.abs(x - (minX + w)) < threshold && Math.abs(y - (minY + h)) < threshold) return "br";

    return null;
};