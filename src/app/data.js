export const MAPPED_DATA = [
    {
        phase: "Phase 0: The Root (Nature)", sub: [
            { id: "0.0", name: "Energy", color: "#94a3b8", borderCSS: "10px solid #94a3b8", glow: "0 0 50px #94a3b8", pulse: true },
            { id: "0.1", name: "Still", color: "#a7a895", borderCSS: "8px solid #a7a895", glow: "0 0 30px #a7a895" },
            { id: "0.2", name: "Vegetative", color: "#879cb5", borderCSS: "8px solid #879cb5", glow: "0 0 30px #879cb5" },
            { id: "0.3", name: "Animate", color: "#a68f9e", borderCSS: "8px solid #a68f9e", glow: "0 0 30px #a68f9e" },
            { id: "0.4", name: "Speaking", color: "#81aaa6", borderCSS: "10px dashed #81aaa6", glow: "0 0 30px #81aaa6" }
        ]
    },
    {
        phase: "Phase 1: Humanity", sub: [
            { id: "1.0", name: "Tribes", color: "#e2ae4d", borderCSS: "10px solid #e2ae4d", glow: "0 0 40px #e2ae4d" },
            { id: "1.1", name: "Nations", color: "#f59e0b", borderCSS: "8px solid #f59e0b", glow: "0 0 40px #f59e0b" },
            { id: "1.2", name: "Business", color: "#cf993a", borderCSS: "12px dotted #cf993a", glow: "0 0 40px #cf993a" },
            { id: "1.3", name: "Religion & Mysticism", color: "#f48c16", borderCSS: "8px solid #f48c16", glow: "0 0 40px #f48c16" },
            { id: "1.4", name: "Theology & Philosophy", color: "#cad04d", borderCSS: "10px dashed #cad04d", glow: "0 0 40px #cad04d" }
        ]
    },
    {
        phase: "Phase 2: Society", sub: [
            { id: "2.1", name: "Connection", color: "#6189c7", borderCSS: "8px solid #6189c7", glow: "0 0 40px #6189c7" },
            { id: "2.2", name: "Participation", color: "#3b82f6", borderCSS: "10px solid #3b82f6", glow: "0 0 40px #3b82f6" },
            { id: "2.3", name: "Communication", color: "#5f76d2", borderCSS: "12px dotted #5f76d2", glow: "0 0 40px #5f76d2" },
            { id: "2.4", name: "Alignment", color: "#36a0d7", borderCSS: "12px solid #36a0d7", glow: "0 0 40px #36a0d7" }
        ]
    },
    {
        phase: "Phase 3: Group", sub: [
            { id: "3.1", name: "Intention", color: "#f05638", borderCSS: "10px solid #f05638", glow: "0 0 40px #f05638" },
            { id: "3.2", name: "Ownership", color: "#ca5067", borderCSS: "10px solid #ca5067", bg: "rgba(202, 80, 103, 0.05)", glow: "0 0 40px #ca5067" },
            { id: "3.3", name: "Accountability", color: "#ef4444", borderCSS: "28px dashed #ef4444", bg: "rgba(239, 68, 68, 0.3)", glow: "0 0 60px #ef4444" },
            { id: "3.4", name: "Anticipation", color: "#c58d49", borderCSS: "12px solid #c58d49", glow: "0 0 60px #c58d49" }
        ]
    },
    {
        phase: "Phase 4: Individual", sub: [
            { id: "4.1", name: "Doubts", color: "#4dbd42", borderCSS: "8px solid #4dbd42", bg: "rgba(77, 189, 66, 0.03)" },
            { id: "4.2", name: "Responsibility", color: "#27b77c", borderCSS: "16px double #27b77c", glow: "0 0 50px #27b77c" },
            { id: "4.3", name: "Vulnerability", color: "#4ba64c", borderCSS: "10px solid rgba(75, 166, 76, 0.3)", bg: "rgba(75, 166, 76, 0.05)", glow: "0 0 40px rgba(75, 166, 76, 0.2)" },
            { id: "4.4", name: "Elevation", color: "#22c55e", borderCSS: "24px solid #22c55e", bg: "rgba(34, 197, 94, 0.15)", glow: "0 0 200px 100px rgba(34, 197, 94, 0.8)" }
        ]
    },
    {
        phase: "Restriction", sub: [
            { id: "5.0", name: "Crossing the Barrier", color: "#ffffff", borderCSS: "10px solid #ffffff", glow: "0 0 60px #ffffff", pulse: true }
        ]
    }
];

export const FLAT_DATA = [];
MAPPED_DATA.forEach((phase, pIdx) => {
    phase.sub.forEach((sub, sIdx) => {
        FLAT_DATA.push({ ...sub, pIdx, sIdx, phaseName: phase.phase });
    });
});