export const MAPPED_DATA = [
    {
        phase: "0", title: "The Root (Nature)", sub: [
            { id: "0.0", name: "Energy", color: "#94a3b8", pulse: true },
            { id: "0.1", name: "Still", color: "#a7a895" },
            { id: "0.2", name: "Vegetative", color: "#879cb5" },
            { id: "0.3", name: "Animate", color: "#a68f9e" },
            { id: "0.4", name: "Speaking", color: "#81aaa6" }
        ]
    },
    {
        phase: "1", title: "Humanity", sub: [
            { id: "1.0", name: "Tribes", color: "#e2ae4d" },
            { id: "1.1", name: "Nations", color: "#f59e0b" },
            { id: "1.2", name: "Business", color: "#cf993a" },
            { id: "1.3", name: "Religion & Mysticism", color: "#f48c16" },
            { id: "1.4", name: "Theology & Philosophy", color: "#cad04d" }
        ]
    },
    {
        phase: "2", title: "Society", sub: [
            { id: "2.0", name: "Study", color: "#7da1d9" },
            { id: "2.1", name: "Connection", color: "#6189c7" },
            { id: "2.2", name: "Participation", color: "#3b82f6" },
            { id: "2.3", name: "Communication", color: "#5f76d2" },
            { id: "2.4", name: "Alignment", color: "#36a0d7" }
        ]
    },
    {
        phase: "3", title: "Group", sub: [
            { id: "3.0", name: "Interaction", color: "#f87171" },
            { id: "3.1", name: "Intention", color: "#f05638" },
            { id: "3.2", name: "Ownership", color: "#ca5067" },
            { id: "3.3", name: "Accountability", color: "#ef4444" },
            { id: "3.4", name: "Anticipation", color: "#c58d49" }
        ]
    },
    {
        phase: "4", title: "Individual", sub: [
            { id: "4.0", name: "Faith", color: "#4ade80" },
            { id: "4.1", name: "Doubts", color: "#4dbd42" },
            { id: "4.2", name: "Responsibility", color: "#27b77c" },
            { id: "4.3", name: "Vulnerability", color: "#4ba64c" },
            { id: "4.4", name: "Elevation", color: "#22c55e" }
        ]
    },
    {
        phase: "5", title: "Restriction", sub: [
            { id: "5.0", name: "Crossing the Barrier", color: "#ffffff", pulse: true }
        ]
    }
];

export const FLAT_DATA = [];
MAPPED_DATA.forEach((phase, pIdx) => {
    phase.sub.forEach((sub, sIdx) => {
        FLAT_DATA.push({ ...sub, pIdx, sIdx, phaseNumber: phase.phase, phaseTitle: phase.title });
    });
});