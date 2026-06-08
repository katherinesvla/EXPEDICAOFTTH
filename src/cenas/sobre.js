import Phaser from 'phaser';

export class CenaSobre extends Phaser.Scene {
    constructor() {
        super('CenaSobre');
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
        const fonte = '"Roboto", sans-serif'; // Ou 'Coolvetica' se você estiver usando ela aqui também!

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

        // TÍTULO DA PÁGINA
        this.add.text(60, 160, 'SOBRE O JOGO', {
            fontFamily: fonte,
            fontSize: '42px',
            color: '#FFFFFF',
            fontStyle: '900'
        }).setOrigin(0, 0).setResolution(DPR);

        // TEXTO PRINCIPAL SOBRE O PROJETO (Usando \n\n para pular linhas igual ao seu mockup)
        const textoDaHistoria = 
            '“Expedição FTTH” nasce como um projeto de TCC desenvolvido por estudantes de Ciências da Computação com o objetivo de simplificar o aprendizado sobre redes de fibra óptica.\n'+
            'Mais do que um jogo, é uma ferramenta educacional voltada para estudantes do ensino fundamental, aspirantes a técnicos de provedores de internet e entusiastas da tecnologia.\n'+
            'Nossa missão é transformar conceitos complexos de infraestrutura em uma experiência prática, lúdica e acessível, demonstrando que a tecnologia é a ponte que conecta pessoas, mesmo nos lugares mais remotos do mundo.';

        this.add.text(60, 220, textoDaHistoria, { //y maior mais baixo
            fontFamily: fonte,
            fontSize: '18px',
            color: '#FFFFFF',
            align: 'left',
            lineSpacing: 8,
            wordWrap: { width: 660 } //largura
        }).setOrigin(0, 0).setResolution(DPR);

        // CRÉDITOS 
        this.add.text(60, 498, 'Desenvolvido por:', { //y menor mais alto
            fontFamily: fonte,
            fontSize: '18px',
            color: '#7CB6E6', // Cor azulada igual ao mockup
            fontStyle: '700'
        }).setOrigin(0, 0).setResolution(DPR);

        // CRÉDITOS 
        this.add.text(60, 524, 'Katherine Maria Carvalho da Silva\nLetícia Rodrigues de Sousa', {
            fontFamily: fonte,
            fontSize: '18px',
            color: '#FFFFFF',
            lineSpacing: 6
        }).setOrigin(0, 0).setResolution(DPR);

        // MASCOTE
        const pinguim = this.add.image(980, 370, 'pinguimSobre'); 
        pinguim.setScale(0.9); 
    }
}