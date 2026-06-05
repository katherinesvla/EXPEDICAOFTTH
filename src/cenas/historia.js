import Phaser from 'phaser';

export class CenaHistoria extends Phaser.Scene {
    constructor() {
        super('CenaHistoria');
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

        this.add.text(640, 55, 'HISTÓRIA', {
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

         // CARD DE CONTEÚDO
        const card = this.add.graphics();
        card.fillStyle(0x7CB6E6, 0.07); // #7CB6E6 
        card.fillRoundedRect(140, 100, 1000, 600, 20);
        card.lineStyle(1, 0xffffff, 0.08);
        card.strokeRoundedRect(140, 100, 1000, 600, 20); 

        // TÍTULO DA HISTÓRIA
        this.add.text(640, 189, 'A Missão no Bosque das Neves', {
            fontFamily: fonte,
            fontSize: '28px',
            color: '#D8EEFF',
            fontStyle: '700'
        }).setOrigin(0.5).setResolution(DPR);

        // TEXTO DA HISTÓRIA LÚDICA
        const texto = [
            'O Bosque das Neves não é apenas mais uma vila no Ártico.',
            'É o lar de uma comunidade de pinguins super moderna, totalmente',
            'interconectada por uma rede de fibra óptica de última geração.',
            '',
            'Mas a Grande Nevasca não trouxe apenas frio; trouxe um verdadeiro apagão!',
            'O vento forte derrubou os postes, o gelo acumulado esmagou as',
            'caixas de emenda e a neve soterrou o provedor central.',
            'Sem comunicação, os pinguins estão isolados em seus iglus, os vídeos',
            'de pescaria não carregam e o tédio ameaça tomar conta da vila.',
            '',
            'O barco quebra-gelo só conseguiu deixar você e sua maleta de ferramentas.',
            'Agora, a conexão de toda a vila está nas suas mãos!'
        ].join('\n');

        this.add.text(640, 430, texto, {
            fontFamily: fonte,
            fontSize: '18px',
            color: '#D8EEFF',
            align: 'center',
            lineSpacing: 12,
            wordWrap: { width: 880 }
        }).setOrigin(0.5).setResolution(DPR);
    }
}