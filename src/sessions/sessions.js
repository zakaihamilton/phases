import {
    CircleDot, Route, Scale
} from 'lucide-react';
import ConcentricCircles from './ConcentricCircles';
import TheBakeryRoute from './TheBakeryRoute';
import HighStriker from './HighStriker';

const sessions = [
    {
        date: "2026-04-19",
        id: 'concentric-circles',
        label: 'TES 2 - Concentric Circles',
        description: 'Four Phases of Direct Light',
        icon: CircleDot,
        component: ConcentricCircles
    },
    {
        date: "2026-04-20",
        id: 'bakery-route',
        label: 'TES 2 - The Bakery Route',
        description: 'Four Phases with Intention and Choice',
        icon: Route,
        component: TheBakeryRoute
    },
    {
        date: "2026-04-23",
        id: "high-striker",
        label: "TES 2 - High Striker",
        description: "Four Phases of Reflected Light",
        icon: Scale,
        component: HighStriker
    }
];

export default sessions;