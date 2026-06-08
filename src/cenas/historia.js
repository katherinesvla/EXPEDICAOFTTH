import Phaser from 'phaser';

export class CenaHistoria extends Phaser.Scene {
    constructor() {
        super('CenaHistoria');
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

        // BOTAO VOLTAR 
        const voltarArea = this.add.rectangle(155, //X
            58, //Y
            200, 40, //Tamanho
            0xffffff, 0);
        voltarArea.setDepth(30); // Profundidade
        voltarArea.setInteractive({ useHandCursor: true });

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

        // TÍTULO DA HISTÓRIA 
        this.add.text(1248, 160, 'Missão no Bosque das Neves', {
            fontFamily: fonte,
            fontSize: '42px',
            color: '#FFFFFF',
            fontStyle: '900'
        }).setOrigin(1, 0).setResolution(DPR);

        // TEXTO DA HISTÓRIA 
        const textoDaHistoria = 
            'O Bosque das Neves não é apenas mais uma vila no Ártico. \n' +
            'É o lar de uma comunidade de pinguins super moderna, totalmente \n' +
            'interconectada por uma rede de fibra óptica de última geração. \n' +
            
            'Mas a Grande Nevasca não trouxe apenas frio; Trouxe um verdadeiro apagão!\n\n' +
            'O vento forte derrubou os postes, o gelo acumulado esmagou\n' +
            'as caixas de emenda e a neve soterrou o provedor central.\n\n' +
           
            'Sem comunicação, os pinguins estão isolados em seus iglus, os vídeos \n' +
            ' de pescaria não carregam e o tédio ameaça tomar conta da vila.\n' +
            'O barco quebra-gelo só conseguiu deixar você e sua maleta de ferramentas.\n' +
            'Agora, a conexão de toda a vila está nas suas mãos!';

        // TEXTO
        this.add.text(1248, 235, textoDaHistoria, {
            fontFamily: fonte,
            fontSize: '18px',
            color: '#FFFFFF',
            align: 'right', 
            lineSpacing: 8,
            wordWrap: { width: 700 }
        }).setOrigin(1, 0).setResolution(DPR);

        // MAPA DA REDE CONECTADA 
        const mapaRede = this.add.image(360, 400, 'mapaHistoria'); 
        mapaRede.setScale(0.4); 
    }
}