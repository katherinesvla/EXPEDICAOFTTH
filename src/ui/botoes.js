export class BotaoInterativo {
    static adicionarHoverEfeito(alvo) {
        alvo.on('pointerover', () => {
            document.body.style.cursor = 'pointer';
            
            // transição fluida
            alvo.scene.tweens.add({
                targets: alvo,
                alpha: 0.8,
                duration: 150, // Tempo da transição
                ease: 'Sine.easeInOut' // Suavidade na entrada
            });
        });

        alvo.on('pointerout', () => {
            document.body.style.cursor = 'default';
            
            
            alvo.scene.tweens.add({
                targets: alvo,
                alpha: 1,
                duration: 150,
                ease: 'Sine.easeInOut' // Suavidade na saída
            });
        });
    }
}