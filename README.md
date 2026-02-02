# 🎨 CoLab: Real-Time Collaborative Canvas

**CoLab** is a high-performance, multi-user drawing application designed for seamless team collaboration. Inspired by industry leaders like Microsoft Whiteboard and Google Jamboard, it features an **Infinite Canvas**, real-time synchronization, and a suite of professional brainstorming tools.

## 🚀 Live Demo
**[View CoLab on Vercel](https://co-lab-git-main-vishwa21-progs-projects.vercel.app/)**

> **⚠️ Technical Note on Deployment:**
> Vercel operates on a **Serverless Architecture**, which is optimized for static sites and APIs but does not natively support persistent, stateful WebSocket connections (Socket.io) required for real-time sync. 
> 
> **If real-time drawing or cursor tracking is not syncing on the Vercel link:** This is due to the lack of a persistent Node.js backend on the serverless edge. For the full collaborative experience, please **run the project locally** using the instructions below.

---

## 🌟 Core Features

### **🧱 Collaboration & Canvas**
*   **🌐 Infinite Canvas**: Draw, write, and organize without boundaries. Hold `Ctrl + Scroll` to zoom and use the `Select` tool to pan.
*   **👥 Real-Time Multi-User Sync**: Multiple users can edit simultaneously with ultra-low latency.
*   **👀 Collaboration Cursors**: See exactly where others are working with labeled "Ghost Cursors" and identity colors.
*   **🖊️ Author Attribution**: Every sticky note and stroke tracks the user who created it.

### **✏️ Drawing & Input Tools**
*   **🖊️ Smooth Pen & Highlighter**: Advanced Quadratic Curve interpolation for smooth, professional inking.
*   **🧽 Context-Aware Eraser**: Automatically adjusts its "ink" to match the current background theme (Dark/Light).
*   **📌 Sticky Notes**: Add color-coded "Post-its" that scale perfectly with the infinite canvas.
*   **🌈 Pro Palette**: A curated selection of Google/Microsoft-themed colors.

### **⚙️ Productivity Tools**
*   **📋 Template Gallery**: Access recommended layouts for Brainstorming, Daily Stand-ups, and Moodboards.
*   **🌙 Theme Engine**: High-contrast Dark Mode and clean Light Mode support.
*   **🔄 Global Undo**: Revert actions across the board with a synchronized history stack.

---

## 🛠️ Technical Stack

*   **Frontend**: React.js, Tailwind CSS (Glassmorphism & Material Design), HTML5 Canvas API.
*   **Backend**: Node.js, Express.
*   **Real-Time Engine**: Socket.io (WebSockets).
*   **Architecture**: State-Driven Vector Rendering (supports infinite zoom/pan without quality loss).

---

## 📦 Local Setup (Recommended for Full Features)

To experience the full real-time synchronization, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone [your-repo-link]
   cd collaborative-canvas
   ```

2. **Install Dependencies**:
   ```bash
   npm install express socket.io
   ```

3. **Start the Server**:
   ```bash
   node server/server.js
   ```

4. **Launch**:
   Open **`http://localhost:3000`** in multiple browser tabs to test the real-time collaboration.

---

## 📐 Implementation Logic

### **Coordinate Mapping (The Offset Fix)**
To solve the common "pointer offset" issue, CoLab uses professional coordinate mapping. Every mouse event is calculated relative to the canvas's `BoundingClientRect` and then transformed into **World Space** based on the current `zoom` and `pan` offset. This ensures that no matter your zoom level, your pen always draws exactly where your cursor points.

### **State Persistence**
Unlike basic drawing apps that lose data on refresh, CoLab maintains a `canvasObjects` array on the server. When a new user joins, the server emits an `init-state` event, sending the entire drawing history to the new client so everyone sees the same "Source of Truth."

---

## 📝 Assignment Requirements Checklist

- [x] **Canvas Mastery**: Smooth path optimization and efficient redraws.
- [x] **Real-time Sync**: Collaborative cursors and live drawing steps.
- [x] **Undo/Redo**: Global history management via Socket events.
- [x] **Infinite Canvas**: Support for viewport panning and zooming.
- [x] **Advanced Features**: Sticky notes, Author labels, and Dark Mode.
- [x] **Documentation**: Comprehensive README and Architecture notes.

---
**Author**: Keerthi
**Project**: CoLab
**License**: MIT
