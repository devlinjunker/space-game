// Handles asteroid spawning, movement, and removal

export interface Asteroid {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    [key: string]: any;
}

export function spawnAsteroid(PIXI: any, app: any, asteroids: Asteroid[], paused: boolean) {
    if (!app.screen || paused) return;
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number, vx: number, vy: number;
    const speed = 2 + Math.random() * 2;
    const angleVariance = Math.PI / 6;
    const visibleWidth = app.screen.width / (app.stage?.scale?.x || 1);
    const visibleHeight = app.screen.height / (app.stage?.scale?.y || 1);
    if (edge === 0) {
        x = Math.random() * visibleWidth;
        y = -60;
        vx = (Math.random() - 0.7) * 1;
        vy = speed;
    } else if (edge === 1) {
        x = Math.random() * visibleWidth;
        y = visibleHeight + 60;
        vx = (Math.random() - 0.7) * 1;
        vy = -speed;
    } else if (edge === 2) {
        x = -60;
        y = Math.random() * visibleHeight;
        vx = speed;
        vy = (Math.random() - 0.7) * 1;
    } else {
        x = visibleWidth + 60;
        y = Math.random() * visibleHeight;
        vx = -speed;
        vy = (Math.random() - 0.7) * 1;
    }
    const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * angleVariance;
    const mag = Math.sqrt(vx * vx + vy * vy);
    vx = Math.cos(angle) * mag;
    vy = Math.sin(angle) * mag;
    const radius = 18 + Math.random() * 32;
    const asteroid = new PIXI.Graphics();
    asteroid.beginFill(0xaaaaaa);
    const points: { x: number; y: number }[] = [];
    const verts = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < verts; i++) {
        const ang = (i / verts) * Math.PI * 2;
        const r = radius * (0.7 + Math.random() * 0.5);
        points.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    }
    asteroid.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        asteroid.lineTo(points[i].x, points[i].y);
    }
    asteroid.closePath();
    asteroid.endFill();
    asteroid.x = x;
    asteroid.y = y;
    asteroid.vx = vx;
    asteroid.vy = vy;
    asteroid.radius = radius;
    app.stage.addChild(asteroid);
    asteroids.push(asteroid);
}

export function updateAsteroids(app: any, asteroids: Asteroid[], paused: boolean) {
    if (paused) return;
    const visibleWidth = app.screen.width / app.stage.scale.x;
    const visibleHeight = app.screen.height / app.stage.scale.y;
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        if (
            a.x < -2000 || a.x > visibleWidth + 2000 ||
            a.y < -2000 || a.y > visibleHeight + 2000
        ) {
            app.stage.removeChild(a);
            asteroids.splice(i, 1);
        }
    }
}
