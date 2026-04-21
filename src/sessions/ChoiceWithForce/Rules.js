const AVAILABLE_RULES = [
    { id: 'INFINITY', name: 'Infinite Light', desc: 'Activates omnipresent background energy field.' },
    { id: 'IGULIM', name: 'Igulim (Rings)', desc: 'Renders 4 concentric structural boundaries.' },
    { id: 'FILL', name: 'Light Fill', desc: 'Increases inner opacity of concentric boundaries to 100%.' },
    { id: 'RESTRICTION', name: 'Restriction', desc: 'Overrides Fill. Forces inner opacity of boundaries to 0%.' },
    { id: 'ATTRACTION', name: 'Attraction Vector', desc: 'Initiates downward vertical light beam targeting Y:100%.' },
    { id: 'SCREEN', name: 'The Screen', desc: 'Renders barrier at Y:83%. Truncates Attraction vector.' },
    { id: 'REFLECTION', name: 'Reflected Vector', desc: 'If Screen and Attraction collide, initiates upward light vector.' }
];

export default AVAILABLE_RULES;