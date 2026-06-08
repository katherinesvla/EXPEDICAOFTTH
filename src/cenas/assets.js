import Phaser from 'phaser';

export class CenaAssets extends Phaser.Scene {

    constructor() {
        super('CenaAssets');
    }

    preload() {     
        // MENU
        this.load.image('telaInicial', 'assets/tela-inicial.png'); // tela inicial
        this.load.image('logo', 'assets/logo.png');// logo EXPEDIÇÃO FTTH
        this.load.image('som', 'assets/som.png'); // ícone de som
        this.load.audio('musica', 'assets/musica.mp3'); // música de fundo
        this.load.audio('clique', 'assets/clique.mp3'); // som de clique dos botões
        
        // SOBRE
        this.load.image('pinguimSobre','assets/pinguimsobre.png');
        this.load.image('pinguimHistoria','assets/pinguimhistoria.png');
        // JOGO
        this.load.image('poste', 'assets/poste.png'); // poste
        this.load.image('ceo', 'assets/ceo.png'); // ceo
        this.load.image('cto', 'assets/cto.png'); // cto
        this.load.image('concentrador', 'assets/concentrador.png'); // concentrador
        
        // NOVOS CABOS
        this.load.image('caboAS', 'assets/caboAS.png'); // cabo as
        this.load.image('caboDrop', 'assets/caboDrop.png'); // cabo drop
        
        this.load.image('iglu', 'assets/iglu.png'); //iglu
        this.load.image('apagar', 'assets/apagar.png'); //borracha
       
        // TELA INICIAL 
        this.load.image('pinguim_baixo', 'assets/pinguim_baixo.png'); // mascote 
        this.load.image('pinguim_cima', 'assets/pinguim_cima.png'); // mascote 
        this.load.image('pinguins', 'assets/pinguins.png'); //pinguins animados da tela inicial

        // Mapa Tiled
        this.load.tilemapTiledJSON('mapa-tiled', 'assets/mapaexpedicao.tmj');
        this.load.image('wifi', 'assets/wifi.png');

        // Imagens PNG do Tiled
        this.load.image('imagem-base', 'assets/256_base.png');
        this.load.image('imagem-decor', 'assets/256_decor.png');

        
    }

    create() {
    // Depois de carregar os assets, inicia a cena do menu
        this.scene.start('CenaMenu');   
    }
}