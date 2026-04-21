import {
    CircleDot, Route, Layers
} from 'lucide-react';
import ConcentricCircles from './ConcentricCircles';
import TheBakeryRoute from './TheBakeryRoute';
import ChoiceWithForce from "./ChoiceWithForce";

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
        date: "",
        id: 'choice-with-force',
        label: "TES 2 - Choice with Force",
        description: "Layering Concepts",
        icon: Layers,
        component: ChoiceWithForce
    }
];

export default sessions;