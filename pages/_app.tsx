'use client';

import { useEffect, useRef } from 'react';
import { initializeGame } from './gameInit';

export default function PixiGame() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const cleanup = initializeGame(containerRef);
        return cleanup;
    }, []);

    return (
        <div
            ref={containerRef}
            id="game-container"
            style={{
                width: '90vw',
                height: '90vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                background: '#222',
            }}
        />
    );
}
