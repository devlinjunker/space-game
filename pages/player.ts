// Handles player movement, velocity, and world position logic

export interface PlayerState {
    worldPos: { x: number; y: number };
    velocity: { x: number; y: number };
    maxVelocity: number;
}

export function updatePlayer(keys: Record<string, boolean>, state: PlayerState, zoom: number) {
    const thrust = 0.05;
    if (keys['ArrowLeft']) {
        state.velocity.x -= thrust;
    }
    if (keys['ArrowRight']) {
        state.velocity.x += thrust;
    }
    if (keys['ArrowUp']) {
        if (keys['ShiftLeft'] || keys['ShiftRight']) return;
        state.velocity.y -= thrust;
    }
    if (keys['ArrowDown']) {
        if (keys['ShiftLeft'] || keys['ShiftRight']) return;
        state.velocity.y += thrust;
    }
    const spaceFriction = 0.9995;
    state.velocity.x *= spaceFriction;
    state.velocity.y *= spaceFriction;
    state.velocity.x += (Math.random() - 0.5) * 0.02;
    state.velocity.y += (Math.random() - 0.5) * 0.02;
    const speedSq = state.velocity.x * state.velocity.x + state.velocity.y * state.velocity.y;
    if (speedSq > state.maxVelocity * state.maxVelocity) {
        const speed = Math.sqrt(speedSq);
        state.velocity.x = (state.velocity.x / speed) * state.maxVelocity;
        state.velocity.y = (state.velocity.y / speed) * state.maxVelocity;
    }
    state.worldPos.x += state.velocity.x;
    state.worldPos.y += state.velocity.y;
}
