import {
    CircleDot, Route
} from 'lucide-react';
import ConcentricCircles from './ConcentricCircles';
import TheBakeryRoute from './TheBakeryRoute';

const sessions = [
    {
        date: "2026-04-19",
        id: 'concentric-circles',
        label: 'Concentric Circles',
        description: 'Four Phases of Direct Light',
        icon: CircleDot,
        component: ConcentricCircles
    },
    {
        date: "2026-04-20",
        id: 'bakery-route',
        label: 'The Bakery Route',
        description: 'Four Phases with Intention and Choice',
        icon: Route,
        component: TheBakeryRoute
    },
];

export default sessions;