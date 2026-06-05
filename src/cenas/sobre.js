import Phaser from 'phaser';

export class CenaSobre extends Phaser.Scene {
    constructor() {
        super('CenaSobre');
    }

    create() {
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#0E2238";
        
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
        barra.fillRoundedRect(55, 30, 1170, 50, 25);
        barra.lineStyle(2, 0xffffff, 0.06);
        barra.strokeRoundedRect(55, 30, 1170, 50, 25);
        
        this.add.text(640, 55, 'SOBRE', {
            fontFamily: fonte,
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: '700'
        }).setOrigin(0.5).setDepth(5);

        // VOLTAR
        const voltarArea = this.add.rectangle(135, 56, 140, 36, 0xffffff, 0);
        voltarArea.setInteractive({ useHandCursor: true }).setDepth(10);

        const textoVoltar = this.add.text(135, 56, 'VOLTAR', {
            fontFamily: fonte,
            fontSize: '16px',
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

        // LOGO PEQUENO
        const logo = this.add.image(635, //X
             210, //Y
             'logo');
        logo.setScale(0.18);

       // CARD DE CONTEÚDO
        const card = this.add.graphics();
        card.fillStyle(0x7CB6E6, 0.07); // #7CB6E6 
        card.fillRoundedRect(140, 100, 1000, 600, 20);
        card.lineStyle(1, 0xffffff, 0.08);
        card.strokeRoundedRect(140, 100, 1000, 600, 20); 

        // TEXTO SOBRE O PROJETO DO TCC
        const texto = [
            '"Expedição FTTH" nasce como um projeto de TCC desenvolvido por estudantes de Ciências',
            'da Computação com o objetivo de simplificar o aprendizado sobre redes de fibra óptica.',         
            'Mais do que um jogo, é uma ferramenta educacional voltada para estudantes do ensino',
            'fundamental, aspirantes a técnicos de provedores de internet e entusiastas da tecnologia.',
            'Nossa missão é transformar conceitos complexos de infraestrutura em uma experiência',
            ' prática, lúdica e acessível, demonstrando que a tecnologia é a ponte que',
            ' conecta pessoas, mesmo nos lugares mais remotos do mundo.',
            '',
            
            'Desenvolvido por: Katherine Maria Carvalho da Silva e Letícia Rodrigues de Sousa.'
        ].join('\n');

        this.add.text(640, 445, texto, {
            fontFamily: fonte,
            fontSize: '18px',
            color: '#D8EEFF',
            align: 'center',
            lineSpacing: 12,
            wordWrap: { width: 880 }
        }).setOrigin(0.5).setResolution(DPR);
    }
}