import Phaser from 'phaser';

export class CenaTutorial extends Phaser.Scene {
    constructor() {
        super('CenaTutorial');
        this.youtubeDiv = null;
    }

    create() {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#2B5A84";
    
        window.history.pushState({ cena: this.scene.key }, '');
        this.eventoVoltarNavegador = () => {
            if (this.cache.audio.exists('clique')) {
                this.sound.play('clique', { volume: 0.3 });
            }
            this.scene.start('CenaMenu');
        };
        window.addEventListener('popstate', this.eventoVoltarNavegador);
        this.events.on('shutdown', () => {
            window.removeEventListener('popstate', this.eventoVoltarNavegador);
        });

        const DPR = Math.min(window.devicePixelRatio || 1);
        const fonte = '"Roboto", sans-serif';

        // BARRA SUPERIOR
        const barra = this.add.graphics();
        barra.fillStyle(0x7CB6E6, 0.12); // #7CB6E6
        barra.fillRoundedRect(55, 30, 160, 50, 25);
        barra.lineStyle(2, 0xffffff, 0.06);
        barra.strokeRoundedRect(55, 30, 160, 50, 25);


        // VOLTAR
        const voltarArea = this.add.rectangle(135, 56, 140, 36, 0xffffff, 0);
        voltarArea.setInteractive({ useHandCursor: true }).setDepth(10);

        const textoVoltar = this.add.text(135, 56, 'VOLTAR', {
            fontFamily: fonte,
            fontSize: '18px',
            color: '#FFFFFF',
            fontStyle: '700'
        }).setOrigin(0.5).setDepth(10);

        voltarArea.on('pointerover', () => {
            textoVoltar.setAlpha(0.7); 
        });
        
        voltarArea.on('pointerout', () => {
            textoVoltar.setAlpha(1); 
        });
        
        voltarArea.on('pointerdown', () => {
            if (this.cache.audio.exists('clique')) {
                this.sound.play('clique', { volume: 0.3 });
            }
            window.removeEventListener('popstate', this.eventoVoltarNavegador); 
            
            this.time.delayedCall(100, () => {
                this.scene.start('CenaMenu');
            });
        });  
      
        // TEXTO ABAIXO DO VÍDEO
        const texto = [
            'Preparamos um vídeo especial no qual nós, os desenvolvedores,',
            ' ensinamos o passo a passo de como jogar "Expedição FTTH".',

            'Clique no vídeo acima para assistir ao guia completo ',
            'no YouTube e tornar-se um mestre da fibra óptica!'
        ].join('\n');

        this.add.text(640 // X 
        , 599 //Y
        , texto, { 
        fontFamily: fonte,
        fontSize: '18px',     
        color: '#FFFFFF',     
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 800 }
        }).setOrigin(0.5).setResolution(DPR);

        // IFRAME DO YOUTUBE
        this.criarYoutube();

        // LIMPA O IFRAME E O BLUR
        this.events.on('shutdown', () => this.removerYoutube());
        this.events.on('destroy',  () => this.removerYoutube());
    }

    criarYoutube() {
        const canvas = document.querySelector('#app canvas');
        if (!canvas) return;

        const rect   = canvas.getBoundingClientRect();
        const scaleX = rect.width  / 1280;
        const scaleY = rect.height / 720;

        // Coordenadas no espaço do jogo
        const gX = 297, gY = 137, gW = 686, gH = 384;

        this.youtubeDiv = document.createElement('div');
        this.youtubeDiv.id = 'youtube-overlay';
        this.youtubeDiv.style.cssText = `
            position: fixed;
            left:   ${rect.left + gX * scaleX}px;
            top:    ${rect.top  + gY * scaleY}px;
            width:  ${gW * scaleX}px;
            height: ${gH * scaleY}px;
            z-index: 10;
            border-radius: 12px;
            overflow: hidden;
            `
        ;

        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/2DKzTCIrw9k?rel=0&modestbranding=1';
        iframe.style.cssText = 'width:100%;height:100%;border:none;';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        this.youtubeDiv.appendChild(iframe);
        document.body.appendChild(this.youtubeDiv);
    }

    removerYoutube() {
        if (this.youtubeDiv) {
            this.youtubeDiv.remove();
            this.youtubeDiv = null;
        }
    
    }
}