const GAME_CONFIG = {
    canvas: {
        width: 390, // iPhone width
        height: 844, // iPhone height
    },
    player: {
        width: 80,
        height: 80,
        speed: 2, // Slower player speed
        startX: 195 - 30, // Center horizontally
        startY: 700, // Near bottom of screen
        color: '#ff00ff'
    },
    obstacles: {
        spawnRate: 120,
        minGap: 150,
        startingGap: 300,
        baseSpeed: 0.75 // Much slower base speed
    },
    powerUps: {
        spawnRate: 1800, // Less frequent power-ups
        duration: 300
    },
    focusPoints: {
        spawnRate: 180, // Less frequent focus points
        value: 10
    },
    damian: {
        width: 80,
        height: 80,
        speed: 0.5,
        startX: 195 - 40,
        startY: 100,
        sleepTimer: 900, // 15 seconds at 60fps
        awakeTime: 600  // 10 seconds at 60fps
    }
    
}

const ASSET_PATHS = {
    images: {
        player: 'assets/images/nadia.png',
        damian: 'assets/images/damian.png',
    },
    sounds: {
        hit: 'assets/sounds/hit_obstacle.wav',
        start: 'assets/sounds/game_start.ogg',
        powerup: 'assets/sounds/powerup.wav'
    }
};

export { GAME_CONFIG, ASSET_PATHS };
