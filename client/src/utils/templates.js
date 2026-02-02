export const getTemplate = (type) => {
    const id = Date.now().toString();
    
    if (type === "brainstorming") {
        return [
            { id: id + "1", type: "text", x: 0, y: -100, text: "Brainstorming Topic", color: "black" },
            { id: id + "2", type: "sticky", x: -150, y: 0, width: 200, height: 200, text: "Idea 1", color: "#ffeb3b" },
            { id: id + "3", type: "sticky", x: 100, y: 0, width: 200, height: 200, text: "Idea 2", color: "#a7ffeb" },
        ];
    }
    
    if (type === "swot") {
        return [
            { id: id + "1", type: "line", x: 0, y: -300, width: 0, height: 600, color: "#ccc", strokeWidth: 2 },
            { id: id + "2", type: "line", x: -400, y: 0, width: 800, height: 0, color: "#ccc", strokeWidth: 2 },
            { id: id + "3", type: "text", x: -300, y: -250, text: "STRENGTHS", color: "black" },
            { id: id + "4", type: "text", x: 100, y: -250, text: "WEAKNESSES", color: "black" },
            { id: id + "5", type: "text", x: -300, y: 50, text: "OPPORTUNITIES", color: "black" },
            { id: id + "6", type: "text", x: 100, y: 50, text: "THREATS", color: "black" },
        ];
    }
    
    return [];
};