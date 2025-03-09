export { GAME_CONFIG, ASSET_PATHS };

const GAME_CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 80,
        height: 80,
        speed: 8,
        startX: 100,
        color: '#ff00ff'
    },
    obstacles: {
        spawnRate: 120,
        minGap: 150,
        startingGap: 300
    },
    powerUps: {
        spawnRate: 300,
        duration: 300
    },
    focusPoints: {
        spawnRate: 60,
        value: 10
    },
    damian: {
        width: 80,
        height: 80,
        speed: 2,
        sleepTimer: 1800,
        awakeTime: 900
    }
};

const ASSET_PATHS = {
    images: {
        player: 'assets/images/nadia.png',
        damian: 'assets/images/damian.png'
    },
    sounds: {
        hit: 'assets/sounds/hit_obstacle.wav',
        start: 'assets/sounds/game_start.ogg',
        powerup: 'assets/sounds/powerup.wav'
    }
};
