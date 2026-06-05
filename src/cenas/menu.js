import Phaser from 'phaser';
import { MenuUI } from '../ui/menuUI';

export class CenaMenu extends Phaser.Scene {
    constructor() {
        super('CenaMenu');
    }

    create() {
        // FUNDO DINÂMICO 

        const interfaceMenu = new MenuUI(this);
        const { botaoIniciar, botaoTutorial, botaoHistoria, botaoSobre } = interfaceMenu.criar();

        // Alterado aqui: Resposta instantânea, igual aos outros!
        botaoIniciar.on('pointerdown', () => {
            this.scene.start('CenaJogo');
        });

        botaoTutorial.on('pointerdown', () => {
            this.scene.start('CenaTutorial');
        });

        botaoHistoria.on('pointerdown', () => {
            this.scene.start('CenaHistoria');
        });

        botaoSobre.on('pointerdown', () => {
            this.scene.start('CenaSobre');
        });
    }
}