import Phaser from 'phaser';

// Barra inferior de ferramentas
export class InventarioUI {
    constructor(scene) {
        this.scene = scene;
    }

    criar(ferramentas, onSelectCallback) {
        const fonte = '"Roboto", sans-serif';
        
        const espacamento = 100;
        const startX = 640 - ((ferramentas.length * espacamento) / 2) + (espacamento / 2);
        const yIcone = 640;
        const DPR = this.scene.DPR || 1;

        let iconeSelecionadoAnterior = null;

        ferramentas.forEach((ferramenta, index) => {
            const x = startX + (index * espacamento);

            const bgIcone = this.scene.add.circle(x, yIcone, 42, 0xffffff, 1).setDepth(20); // #ffffff
            bgIcone.setInteractive({ useHandCursor: true });

            let tamanhoIcone = 60; 
            
            this.scene.add.image(x, yIcone, ferramenta.chave).setDisplaySize(tamanhoIcone, tamanhoIcone).setDepth(21);
            const larguraTexto = 80;
            const alturaTexto = 20;

            this.scene.add.text(x, yIcone + 55, ferramenta.nome.toUpperCase(), {
                fontFamily: fonte,
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: '900'
            })
                .setOrigin(0.5)
                .setResolution(DPR)
                .setDepth(21);

            // Lógica de seleção
            bgIcone.on('pointerdown', () => {
                if (this.scene.cache && this.scene.cache.audio && this.scene.cache.audio.exists('clique')) {
                    this.scene.sound.play('clique', { volume: 0.3 });
                }

                if (iconeSelecionadoAnterior === bgIcone) {
                    bgIcone.setStrokeStyle(0);
                    bgIcone.setScale(1);
                    iconeSelecionadoAnterior = null;

                    onSelectCallback(ferramenta);
                    return;
                }

                if (iconeSelecionadoAnterior) {
                    iconeSelecionadoAnterior.setStrokeStyle(0);
                    iconeSelecionadoAnterior.setScale(1);
                }

                bgIcone.setStrokeStyle(4, 0xff751f);  // #ff751f
                bgIcone.setScale(1.1);
                iconeSelecionadoAnterior = bgIcone;

                onSelectCallback(ferramenta);
            });
        });

        return null;
    }
}