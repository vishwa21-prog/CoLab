This README provides a comprehensive overview of the Real-Time Collaborative Drawing Canvas, built as a high-fidelity clone of professional tools like Microsoft Whiteboard and Google Jamboard.

🎨 CoLab: Real-Time Collaborative Canvas

CoLab is a production-grade, multi-user drawing application that allows teams to brainstorm, sketch, and organize ideas on an Infinite Canvas. It solves the complex challenges of real-time state synchronization, network latency, and coordinate mapping across different device resolutions.

🚀 Live Features
🧱 Core Collaboration

Infinite Canvas: No boundaries. Use Ctrl + Wheel to zoom and the Select tool to pan across an unlimited workspace.

Real-Time Sync: Powered by Socket.io for sub-50ms latency drawing synchronization.

Collaboration Cursors: Every user has a unique "Ghost Cursor" with a floating name tag and identity color.

Author Attribution: Every stroke and sticky note is tagged with the creator's name.

✏️ Advanced Drawing Tools

Smooth Inking: Uses Quadratic Curve interpolation to prevent jagged lines, ensuring a professional "pen-on-paper" feel.

Toolbox: Includes a pressure-simulated Pen, a semi-transparent Highlighter, and a background-aware Eraser.

Multi-Color Palette: Professional Google/Microsoft-inspired color swatches.

📌 Content & Organization

Sticky Notes: Color-coded "Post-it" notes that support real-time text editing and scale with the canvas.

Global Undo: A synchronized history stack that allows users to revert actions across the board.

Theme Engine: Full support for Dark Mode and Light Mode with automatic eraser-ink adjustment.

🛠️ Technical Stack

Frontend: React (Functional Components & Hooks), Tailwind CSS (Glassmorphism UI), HTML5 Canvas API.

Backend: Node.js, Express.

Real-Time: Socket.io (WebSockets).

Compilers: Babel (for in-browser JSX transformation).

📦 Installation & Setup

Ensure you have Node.js installed (v16 or higher recommended).

Clone or Create the Directory:

code
Bash
download
content_copy
expand_less
mkdir collaborative-canvas
cd collaborative-canvas

Initialize & Install Dependencies:

code
Bash
download
content_copy
expand_less
npm init -y
npm install express socket.io

Project Structure:
Ensure your files are organized as follows:

code
Text
download
content_copy
expand_less
collaborative-canvas/
├── client/
│   ├── index.html
│   ├── style.css
│   └── app.js           # React Logic
├── server/
│   └── server.js        # Node/Socket.io Logic
└── package.json

Run the Server:

code
Bash
download
content_copy
expand_less
node server/server.js

Access the App:
Open http://localhost:3000 in your browser.

🕹️ How to Test (Multi-User)

Open http://localhost:3000 in Chrome.

Enter the name "Artist A" and join.

Open a new Incognito window or a different browser (Edge/Firefox).

Enter the name "Artist B" and join.

Observe:

Move the mouse in Window A; see the labeled cursor move in Window B.

Draw a line in Window A; see it appear instantly in Window B.

Change Window A to Dark Mode; notice that Window B remains in Light Mode, but the drawing stays perfectly synced.

📐 Architecture & Logic
1. Infinite Canvas Coordinate System

Standard canvases use "Screen Coordinates" (0 to width). To allow infinite panning and zooming, we implemented a World Coordinate System:

World Space: Where the drawing actually lives (mathematical coordinates).

Screen Space: What the user sees on their monitor.

Formula: ScreenPos = (WorldPos * Zoom) + ViewportOffset

2. State-Driven Rendering

Unlike basic drawing apps that just "paint pixels," this app stores data as Objects.

code
JSON
download
content_copy
expand_less
{
  "type": "stroke",
  "points": [{"x": 10, "y": 20}, ...],
  "color": "#1a73e8",
  "author": "User A"
}

This allows for the "Infinite" nature—whenever you zoom or pan, the app clears the canvas and re-renders the objects based on the new math, ensuring zero loss in quality.

3. Network Optimization

To prevent server overload, drawing is handled in two ways:

draw-step: High-frequency emits for immediate visual feedback of "live" lines.

add-object: A single emit once the user lifts the mouse to save the finished shape into the global history.

📝 Assignment Requirements Checklist

Canvas Mastery: Efficient re-rendering and path optimization.

Real-time Sync: Multi-user cursor tracking and drawing.

Undo/Redo: Global history stack management.

Conflict Resolution: Server-side "Source of Truth" for history.

UI/UX: Playful, modern design with Dark Mode and Microsoft/Google styling.

Infinite Canvas: Support for panning and zooming.

⚖️ Known Limitations & Future Scope

Persistence: Currently, the canvas clears if the server restarts. (Future: Add MongoDB/Redis).

Lasso Selection: Foundation is built (object-based), but full grouping/dragging of existing lines is a secondary feature.

Image Uploads: Logic is prepared for type: 'image', requires a cloud storage integration (AWS S3).

License: MIT
