import Phaser from 'phaser';
import { CenaAssets  } from './cenas/assets';
import { CenaMenu    } from './cenas/menu';
import { CenaJogo    } from './cenas/jogo';
import { CenaTutorial } from './cenas/tutorial';
import { CenaHistoria } from './cenas/historia';
import { CenaSobre    } from './cenas/sobre';

const DPR = Math.min(window.devicePixelRatio || 1, 3);

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 1280,
    height: 720,
    transparent: true, 
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    resolution: DPR,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [CenaAssets, CenaMenu, CenaJogo, CenaTutorial, CenaHistoria, CenaSobre]
};

export default new Phaser.Game(config);