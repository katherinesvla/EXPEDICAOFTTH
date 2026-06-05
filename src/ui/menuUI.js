import Phaser from 'phaser';

export class MenuUI {
    constructor(cena) {
        this.cena = cena;
    }

    criar() {

        document.body.style.backgroundImage = "url('assets/tela-inicial.png')";

        // PINGUINS
        const pinguins = this.cena.add.image(1010, 408, 'pinguins');
        pinguins.setDisplaySize(380, 380);
        pinguins.setDepth(1);
        const baseY = pinguins.y;
        const baseScale = pinguins.scale;
        this.cena.tweens.add({ //animação
            targets: pinguins,
            y: 390,
            duration: 7000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        
        // BARRA SUPERIOR
        const barra = this.cena.add.graphics();
        barra.fillStyle(0x4a7aa7,1); // #7db1e2
        barra.fillRoundedRect(55, 30, 1170, 50, 25);
        barra.lineStyle(2, 0xffffff, 0.06);
        barra.strokeRoundedRect(55, 30, 1170, 50, 25);

        const fonte = '"Roboto", sans-serif';

        // MENU SUPERIOR (TUTORIAL, HISTÓRIA, SOBRE)
        const itens = ['TUTORIAL', 'HISTÓRIA', 'SOBRE'];
        let posX = 110;
        let textoTutorial = null; 
        let textoHistoria = null; 
        let textoSobre    = null; 

        itens.forEach((item) => {
            const texto = this.cena.add.text(posX, 55, item, {
                fontFamily: fonte,
                fontSize: '19px',
                color: '#FFFFFF',
                fontStyle: '700'
            });
            texto.setOrigin(0, 0.5);
            texto.setInteractive({ useHandCursor: true });
            
            // Efeitos visuais
            texto.on('pointerover', () => texto.setColor('#D8EEFF'));
            texto.on('pointerout', () => texto.setColor('#FFFFFF'));

            texto.on('pointerdown', () => {
                if (this.cena.cache.audio.exists('clique')) {
                    this.cena.sound.play('clique', { volume: 0.3 });
                }
            });

            if (item === 'TUTORIAL') textoTutorial = texto;
            if (item === 'HISTÓRIA') textoHistoria = texto;
            if (item === 'SOBRE')    textoSobre    = texto;

            posX += 140;
        });

        // BOTÃO DE SOM
        const bgSom = this.cena.add.circle(1200, 55, 20, 0xffffff, 0.9);
        bgSom.setStrokeStyle(2, 0xffffff, 0.25);
        bgSom.setInteractive({ useHandCursor: true });
        
        const iconeSom = this.cena.add.image(1200, 55, 'som').setDisplaySize(25, 25);
        
        if (!this.cena.musica) {
            this.cena.musica = this.cena.sound.add('musica', { loop: true, volume: 0.2 });
            this.cena.musica.play();
        }
        
        bgSom.on('pointerdown', () => {
            if (this.cena.cache.audio.exists('clique')) {
                this.cena.sound.play('clique', { volume: 0.3 });
            }

            if (this.cena.musica.isPlaying) {
                this.cena.musica.pause();
                iconeSom.setAlpha(0.4);
            } else {
                this.cena.musica.resume();
                iconeSom.setAlpha(1.0);
            }
        });

        // LOGO
        const logo = this.cena.add.image(640, 279, 'logo');
        logo.setScale(0.25);
        this.cena.tweens.add({ // animação
            targets: logo,
            y: 263,
            duration: 8000,
            yoyo: true,
            repeat: -1, 
            ease: 'Sine.easeInOut'
        });

        // BOTÃO INICIAR
        const iniciarBg = this.cena.add.graphics();
        iniciarBg.fillStyle(0x13538abb, 1);  // #13538abb
        iniciarBg.fillRoundedRect(510, 375, 260, 50, 25);
        iniciarBg.setAlpha(0.89); 

        // Área invisível apenas para detetar o clique
        const iniciarArea = this.cena.add.rectangle(640, 400, 260, 50, 0xffffff, 0);
        iniciarArea.setInteractive({ useHandCursor: true });

        iniciarArea.on('pointerdown', () => {
            if (this.cena.cache.audio.exists('clique')) {
                this.cena.sound.play('clique', { volume: 0.3 });
            }
            this.cena.tweens.killTweensOf([iniciarBg]);
            iniciarBg.setAlpha(1);
        });
        
        iniciarArea.on('pointerover', () => {
            this.cena.tweens.add({
                targets: iniciarBg,
                alpha: 1,
                duration: 150,
                ease: 'Sine.easeInOut'
            });
        });
        
        iniciarArea.on('pointerout', () => {
            this.cena.tweens.add({
                targets: iniciarBg,
                alpha: 0.89,
                duration: 150,
                ease: 'Sine.easeInOut'
            });
        });

        this.cena.add.text(640, 400, 'INICIAR AVENTURA', {
            fontFamily: fonte,
            fontSize: '24px',
            color: '#FFFFFF',
            fontStyle: '700'
        }).setOrigin(0.5);

        // Retorna todos os botões para a CenaMenu
        return {
            botaoIniciar:  iniciarArea,
            botaoTutorial: textoTutorial,
            botaoHistoria: textoHistoria,
            botaoSobre:    textoSobre
        };
    }
}