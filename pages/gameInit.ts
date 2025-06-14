// gameInit.ts
// Handles PixiJS game initialization logic extracted from _app.tsx

import { updatePlayer, PlayerState } from './player';
import { spawnAsteroid, updateAsteroids } from './asteroids';
import { ZoomManager } from './zoomManager';

export function initializeGame(containerRef: React.RefObject<HTMLDivElement>) {
    let app: any, player: any, ticker: any;
    let PIXI: any;
    let keys: Record<string, boolean> = {};
    let asteroidSpawnInterval: NodeJS.Timeout;
    const asteroids: any[] = [];
    let paused = false;

    import('pixi.js').then((module) => {
        PIXI = module;

        app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1d1d1d,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Generate a procedural background using PIXI.Graphics
        const bgGraphics = new PIXI.Graphics();
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Example: Draw a simple starfield
        bgGraphics.beginFill(0x1d1d1d);
        bgGraphics.drawRect(0, 0, width, height);
        bgGraphics.endFill();

        // Draw random stars
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 1.5 + 0.5;
            bgGraphics.beginFill(0xffffff, Math.random() * 0.8 + 0.2);
            bgGraphics.drawCircle(x, y, radius);
            bgGraphics.endFill();
        }

        // Convert graphics to texture and use as tiling sprite
        const bgTexture = app.renderer.generateTexture(bgGraphics);
        
        PIXI.Assets.loadBundle('game').then((resources: any) => {
            const background = new PIXI.TilingSprite(
                bgTexture,
                app.screen.width,
                app.screen.height
            );
            app.stage.addChild(background);

            player = new PIXI.Graphics();
            player.beginFill(0x66ccff);
            player.drawCircle(0, 0, 20);
            player.endFill();

            // Center player and background on game init
            let playerState: PlayerState = {
                worldPos: { x: app.screen.width / 2, y: app.screen.height / 2 },
                velocity: { x: 0, y: 0 },
                maxVelocity: 25,
            };
            background.tilePosition.set(
                (app.screen.width - background.width) / 2,
                (app.screen.height - background.height) / 2
            );
            player.x = playerState.worldPos.x;
            player.y = playerState.worldPos.y;

            const zoomManager = new ZoomManager();

            ticker = app.ticker.add(() => {
                if (paused) return;
                const zoom = zoomManager.zoom;
                updatePlayer(keys, playerState, zoom);
                // Deadzone logic (account for zoom)
                const deadzonePercent = 0.5; // 50% of the visible area
                const visibleWidth = app.screen.width / zoom;
                const visibleHeight = app.screen.height / zoom;
                const deadzone = {
                    width: visibleWidth * deadzonePercent,
                    height: visibleHeight * deadzonePercent,
                };
                const deadzoneLeft = (app.screen.width / zoom - deadzone.width) / 2;
                const deadzoneRight = deadzoneLeft + deadzone.width;
                const deadzoneTop = (app.screen.height / zoom - deadzone.height) / 2;
                const deadzoneBottom = deadzoneTop + deadzone.height;
                let bgMoveX = 0, bgMoveY = 0;
                if (playerState.worldPos.x < deadzoneLeft) {
                    bgMoveX = deadzoneLeft - playerState.worldPos.x;
                } else if (playerState.worldPos.x > deadzoneRight) {
                    bgMoveX = deadzoneRight - playerState.worldPos.x;
                }
                if (playerState.worldPos.y < deadzoneTop) {
                    bgMoveY = deadzoneTop - playerState.worldPos.y;
                } else if (playerState.worldPos.y > deadzoneBottom) {
                    bgMoveY = deadzoneBottom - playerState.worldPos.y;
                }
                if (bgMoveX !== 0 || bgMoveY !== 0) {
                    const parallaxFactor = 0.15;
                    background.tilePosition.x += bgMoveX * parallaxFactor;
                    background.tilePosition.y += bgMoveY * parallaxFactor;
                    asteroids.forEach(a => {
                        a.x += bgMoveX;
                        a.y += bgMoveY;
                    });
                    playerState.worldPos.x += bgMoveX;
                    playerState.worldPos.y += bgMoveY;
                }
                player.x = playerState.worldPos.x;
                player.y = playerState.worldPos.y;
            });

            app.ticker.add(() => {
                if (paused) return;
                zoomManager.handleZoom(keys, playerState.worldPos, app);
                zoomManager.updateStageAndBackground(app, background, playerState.worldPos);
            });

            if (containerRef.current) {
                containerRef.current.appendChild(app.view);
            }

            app.stage.addChild(player);

            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            window.addEventListener('resize', onResize);

            asteroidSpawnInterval = setInterval(() => {
                if (!paused) spawnAsteroid(PIXI, app, asteroids, paused);
            }, 1000);

            app.ticker.add(() => {
                updateAsteroids(app, asteroids, paused);
            });
        });
    });

    function onKeyDown(e: KeyboardEvent) {
        if (e.code === 'Escape') {
            paused = !paused;
        } else {
            keys[e.code] = true;
        }
    }
    function onKeyUp(e: KeyboardEvent) {
        keys[e.code] = false;
    }
    function onResize() {
        if (app) app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);
        if (app) {
            app.destroy(true, { children: true });
        }
        clearInterval(asteroidSpawnInterval);
        asteroids.forEach(a => {
            if (app.stage) app.stage.removeChild(a);
        });
    };
}
