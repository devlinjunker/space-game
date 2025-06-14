// zoomManager.ts
// Handles zoom state and logic for the PixiJS game

export class ZoomManager {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    zoomStep: number;

    constructor(initialZoom = 1, minZoom = 0.3, maxZoom = 1, zoomStep = 0.004) {
        this.zoom = initialZoom;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.zoomStep = zoomStep;
    }

        handleZoom(keys: Record<string, boolean>, playerPosition: { x: number, y: number }, app: any) {
            if (keys['ShiftLeft'] || keys['ShiftRight']) {
                if (keys['ArrowUp']) {
                    this.zoom = Math.min(this.maxZoom, this.zoom + this.zoomStep);
                }
                if (keys['ArrowDown']) {
                    this.zoom = Math.max(this.minZoom, this.zoom - this.zoomStep);
                }
            }

            // Center the stage pivot on the player position to zoom around the player
            if (app && playerPosition) {
                app.stage.pivot.set(playerPosition.x, playerPosition.y);
                // Move the stage so the player stays centered on the screen
                app.stage.position.set(app.screen.width / 2, app.screen.height / 2);
            }

            return this.zoom;
        }

        updateStageAndBackground(app: any, background: any) {
            app.stage.scale.set(this.zoom, this.zoom);

            // Ensure background always fills the visible stage, accounting for pivot and scaling
            background.width = app.screen.width / this.zoom;
            background.height = app.screen.height / this.zoom;

            // Position background so it always covers the visible area after pivoting
            background.x = app.stage.pivot.x - (app.screen.width / (2 * this.zoom));
            background.y = app.stage.pivot.y - (app.screen.height / (2 * this.zoom));

            // If using tiling, tileScale should be 1 to avoid stretching
            if (background.tileScale) {
                background.tileScale.set(1, 1);
            }
        }
}
