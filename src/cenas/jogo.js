import Phaser from 'phaser';
import { InventarioUI } from '../ui/inventarioUI';

export class CenaJogo extends Phaser.Scene {
    constructor() {
        super('CenaJogo');
        this.DPR = Math.min(window.devicePixelRatio || 1);
    }

    // Limpa a memoria ao recarregar a cena para evitar vazamentos
    init() {
        this.ferramentaSelecionada = null;
        this.pontoInicialCabo = null;
        this.listaCabos = [];
        this.gridOcupacao = {};
        this.pulsos = [];
        this.popNode = null;
        this.iglus = [];
        this.guiaAtivo = true;
        this.ultimaFalaMascote = ''; 
        this.timerOcio = null; 
        this.timerSucesso = null; 
        this.sucessoAlcancado = 0; 
    }

    create() {
        const fonte = '"Roboto", sans-serif';
        // Cor no fundo do mapa
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "#0E2238";

        // Integracao com o botao Voltar nativo do navegador
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

        // Configuracao do Mapa Tiled
        const mapa = this.make.tilemap({ key: 'mapa-tiled' });
        const tilesetBase = mapa.addTilesetImage('base', 'imagem-base');
        const tilesetDecor = mapa.addTilesetImage('decor', 'imagem-decor');
        const tilesets = [tilesetBase, tilesetDecor];

        // Dimensoes e Posicao do Mapa
        const escalaMapa = 0.2; //  Escala
        const posX = 608; //X
        const posY = 40; //Y

        // Renderizacao das camadas
        const camadaBase = mapa.createLayer('base', tilesets, posX, posY);  //camada 1
        const camadaDecor = mapa.createLayer('decor', tilesets, posX, posY); //camada 2
        const camadaDecor01 = mapa.createLayer('decor 01', tilesets, posX, posY); //camada 3
        const todasCamadas = [camadaBase, camadaDecor, camadaDecor01];

        todasCamadas.forEach((camada, index) => {
            if (camada) {
                camada.setScale(escalaMapa);
                camada.setDepth(index + 1);
            }
        });

        // Zona invisivel para detectar cliques no mapa 
        const fundoMapa = this.add.zone(640, //Y
            360, // Y
            1280, 720); // Tamanho do mapa
        fundoMapa.setDepth(6); // Profundidade
        fundoMapa.setInteractive();

        // Grid de alinhamento (Snap) das construcoes
        const tamanhoBloco = 20; // Tamanho
        this.add.grid(640, 360, 1280, 720, tamanhoBloco, tamanhoBloco, 0x000000, 0, 0xffffff, 0);

        this.graficosPreviewCabo = this.add.graphics();
        this.graficosPreviewCabo.setDepth(6);

        // BOTAO VOLTAR 
        
        const voltarArea = this.add.rectangle(155, //X
            58, //Y
            200, 40, //Tamanho
            0xffffff, 0);
        voltarArea.setDepth(30); // Profundidade
        voltarArea.setInteractive({ useHandCursor: true });

        const textoVoltar = this.add.text(155, 58, 'VOLTAR', {
            fontFamily: fonte,
            fontSize: '22px',
            color: '#FFFFFF', 
            fontStyle: '700'
        }).setOrigin(0.5).setDepth(30).setShadow(1, 1, 'rgba(0, 0, 0, 0.4)', 2).setResolution(this.DPR);

        voltarArea.on('pointerover', () => { textoVoltar.setAlpha(0.7); });
        voltarArea.on('pointerout', () => { textoVoltar.setAlpha(1); });
        
        voltarArea.on('pointerdown', () => {
            if (this.cache.audio.exists('clique')) {
                this.sound.play('clique', { volume: 0.3 });
            }
            window.removeEventListener('popstate', this.eventoVoltarNavegador);
            this.time.delayedCall(100, () => {
                this.scene.start('CenaMenu');
            });
        });

        // PINGUIM MASCOTE
        this.pinguim = this.add.image(110, //X
             650, //Y
              'pinguim_baixo').setDisplaySize(300, 300).setDepth(20); // Tamanho e Profundidade

        this.time.addEvent({
            delay: 1800,
            loop: true,
            callback: () => {
                if (this.pinguim.texture.key === 'pinguim_baixo') {
                    this.pinguim.setTexture('pinguim_cima');
                } else {
                    this.pinguim.setTexture('pinguim_baixo');
                }
            }
        });

        // Balao de fala do mascote. O fundo e desenhado dinamicamente. Profundidade texto: 21, fundo: 20
        this.balaoMascoteBg = this.add.graphics().setDepth(20);
        this.textoMascote = this.add.text(180, 510, '', {
            fontFamily: fonte,
            fontSize: '16px',
            color: '#000000',
            wordWrap: { width: 280 }
        }).setDepth(21).setOrigin(0, 0.5).setResolution(this.DPR).setAlpha(0);

        this.balaoMascoteBg.setAlpha(0);

        // Funcao controladora das falas com animacao de fade-in e fade-out (Duracao: 400ms)
        this.falarPinguim = (texto, isOcio = false) => {
            if (this.ultimaFalaMascote === texto && !isOcio) return; 
            this.ultimaFalaMascote = texto;

            this.tweens.killTweensOf([this.textoMascote, this.balaoMascoteBg]);

            this.tweens.add({
                targets: [this.textoMascote, this.balaoMascoteBg],
                alpha: 0,
                duration: 400, 
                onComplete: () => {
                    const corFundo = isOcio ? 0x1a4574 : 0xffffff; // #1a4574
                    const corTexto = isOcio ? '#FFFFFF' : '#000000';

                    this.textoMascote.setColor(corTexto);
                    this.textoMascote.setText(texto);
                    
                    this.balaoMascoteBg.clear();
                    this.balaoMascoteBg.fillStyle(corFundo, 0.80);

                    const alt = this.textoMascote.height + 30;
                    const yCentro = this.textoMascote.y;

                    // Caixa do balao de fala. Posicao X: 160, Largura fixa: 300, Curvatura: 15
                    this.balaoMascoteBg.fillRoundedRect(160, yCentro - (alt / 2), 300, alt, 15);

                    this.tweens.add({
                        targets: [this.textoMascote, this.balaoMascoteBg],
                        alpha: 1,
                        duration: 400
                    });
                }
            });
        };

        const falasIntro = [
            'Olá! Bem-vindo à Expedição FTTH! Serei seu guia na missão de conectar essa região.',
            'Nessa tecnologia, usamos pulsos de luz viajando por fibras de vidro para enviar dados na velocidade da luz!',
            'Mas sem clientes, não temos rede.',
            'Sua primeira tarefa: Selecione o Iglu no inventário e espalhe-os pelo mapa para começarmos o projeto!'
        ];

        let passo = 0;
        this.falarPinguim(falasIntro[passo]);

        this.eventoIntro = this.time.addEvent({
            delay: 8500, 
            repeat: falasIntro.length - 2,
            callback: () => {
                passo++;
                if (this.iglus.length === 0) {
                    this.falarPinguim(falasIntro[passo]);
                }
            }
        });

        // INVENTARIO - Botoes de interface da barra inferior
        const interfaceInventario = new InventarioUI(this);

        interfaceInventario.criar(
            [
                { nome: 'Poste', chave: 'poste' },
                { nome: 'CEO', chave: 'ceo' },
                { nome: 'CTO', chave: 'cto' },
                { nome: 'POP', chave: 'concentrador' },
                { nome: 'Cabo ASU', chave: 'caboAS' },
                { nome: 'Cabo Drop', chave: 'caboDrop' },
                { nome: 'Iglu', chave: 'iglu' },
                { nome: 'Apagar', chave: 'apagar' }
            ],
            (item) => {
                if (this.timerSucesso) this.timerSucesso.remove(); 

                if (this.ferramentaSelecionada && this.ferramentaSelecionada.nome === item.nome) {
                    this.ferramentaSelecionada = null;

                    if (this.pontoInicialCabo) {
                        this.pontoInicialCabo = null;
                        this.graficosPreviewCabo.clear();
                    }

                    const iglusOn = this.iglus.filter((i) => i.isConectado).length;

                    if (this.iglus.length > 0 && iglusOn === this.iglus.length) {
                        this.falarPinguim('Mãos livres! Se quiser expandir a rede, espalhe mais Iglus e crie novos ramais ligando postes com CTO e CEO!');
                    } else if (this.iglus.length > 0) {
                        this.falarPinguim('Mãos livres! Ferramenta guardada. Selecione o que precisar para continuarmos a montagem.');
                    } else {
                        this.falarPinguim('Mãos livres! Pegue um Iglu no inventário para definirmos nossos primeiros clientes.');
                    }
                    return;
                }

                this.ferramentaSelecionada = item;

                if (this.pontoInicialCabo) {
                    this.pontoInicialCabo = null;
                    this.graficosPreviewCabo.clear();
                }

                // Textos educativos do inventario detalhando componentes FTTH
                let falaEducativa = '';
                switch (item.nome) {
                    case 'POP':
                        falaEducativa = 'POP (Ponto de Presença)! É o cérebro da rede. Aqui ficam os servidores e a OLT, equipamentos que geram a luz para toda a cidade.';
                        break;
                    case 'CEO':
                        falaEducativa = 'CEO (Caixa de Emenda). Ela abriga as fusões de fibra. O cabo ASU principal chega nela e se divide em ramais menores para os bairros!';
                        break;
                    case 'CTO':
                        falaEducativa = 'CTO (Caixa de Terminação). É a última caixa no poste! Dentro há um Splitter (divisor de luz) que envia o sinal final para até 4 Iglus.';
                        break;
                    case 'Poste':
                        falaEducativa = 'Poste! Estrutura vital da rua. Nele fixamos as cordoalhas, passamos os cabos e prendemos as nossas caixas CEO e CTO.';
                        break;
                    case 'Cabo ASU':
                        falaEducativa = 'Cabo ASU (Rede Primária). Ele é robusto e resistente ao clima. Transporta a luz em alta capacidade do POP até as caixas nas ruas.';
                        break;
                    case 'Cabo Drop':
                        falaEducativa = 'Cabo Drop (Rede Secundária). Flexível e leve, é ele que instalamos da CTO, passando pelos postes até entrar no roteador do cliente!';
                        break;
                    case 'Iglu':
                        falaEducativa = 'Iglu! O cliente final. A fibra entra aqui e se conecta a uma ONU (Roteador Óptico) para converter a luz em Wi-Fi!';
                        break;
                    case 'Apagar':
                        falaEducativa = 'Borracha! Clique em equipamentos ou cabos para removê-los. Apagar um poste também destruirá a caixa nele!';
                        break;
                    default:
                        falaEducativa = `${item.nome} selecionado.`;
                }

                this.falarPinguim(falaEducativa);
            }
        );

        this.input.on('pointerdown', () => {
            this.resetarTimerOcio();
        });

        // Clique no grid do mapa para construcao
        fundoMapa.on('pointerdown', (ponteiro) => {
            if (this.timerSucesso) this.timerSucesso.remove();

            if (!this.ferramentaSelecionada) return;

            // REGRA FTTH: A rede comeca pelos iglus
            if (this.iglus.length === 0 && this.ferramentaSelecionada.nome !== 'Iglu') {
                this.falarPinguim('Coloque pelo menos um Iglu no mapa primeiro!');
                return;
            }

            // REGRA FTTH: O POP (Central) deve existir antes da infraestrutura de rua
            if (
                this.iglus.length > 0 &&
                !this.popNode &&
                this.ferramentaSelecionada.nome !== 'POP' &&
                this.ferramentaSelecionada.nome !== 'Iglu'
            ) {
                this.falarPinguim('Instale o POP (Central) antes de construir a infraestrutura nas ruas!');
                return;
            }

            if (this.ferramentaSelecionada.nome === 'POP' && this.popNode) return;

            // REGRA FTTH: CEO e CTO sao aereas, exigem sustentacao (Poste)
            if (
                this.ferramentaSelecionada.nome === 'CEO' ||
                this.ferramentaSelecionada.nome === 'CTO'
            ) {
                this.falarPinguim('As caixas CEO e CTO são aéreas, elas precisam ser fixadas em cima de um Poste!');
                return;
            }

            if (this.ferramentaSelecionada.nome.includes('Cabo')) {
                if (this.pontoInicialCabo) {
                    this.pontoInicialCabo = null;
                    this.graficosPreviewCabo.clear();
                    this.falarPinguim('Lançamento de cabo cancelado.');
                }
                return;
            }

            if (this.ferramentaSelecionada.nome === 'Apagar') return;

            const tileClicado = camadaBase.getTileAtWorldXY(ponteiro.x, ponteiro.y, true);

            if (!tileClicado || tileClicado.index === -1) {
                this.falarPinguim('Atenção técnico! Você só pode construir em cima da área do mapa.');
                return;
            }

            // Calculo de alinhamento com a Grid (Snap)
            let blocoX = Math.floor(ponteiro.x / tamanhoBloco) * tamanhoBloco + (tamanhoBloco / 2);
            let blocoY = Math.floor(ponteiro.y / tamanhoBloco) * tamanhoBloco + (tamanhoBloco / 2);

            // REGRA FTTH: Ponto fixo para o POP (Centro do mapa). Coordenadas X: 600, Y: 280
            if (this.ferramentaSelecionada.nome === 'POP') {
                const centroMapaX = 600;
                const centroMapaY = 280;

                blocoX = Math.floor(centroMapaX / tamanhoBloco) * tamanhoBloco + (tamanhoBloco / 2);
                blocoY = Math.floor(centroMapaY / tamanhoBloco) * tamanhoBloco + (tamanhoBloco / 2);
            }

            // Evita sobreposicao de objetos em um raio de 40 pixels
            let espacoOcupado = false;
            this.children.list.forEach((child) => {
                if (child.tipoEstrutura && ['Iglu', 'Poste', 'POP'].includes(child.tipoEstrutura)) {
                    if (Phaser.Math.Distance.Between(blocoX, blocoY, child.x, child.y) < 40) {
                        espacoOcupado = true;
                    }
                }
            });

            if (espacoOcupado) {
                this.falarPinguim('Espaço ocupado! Se quiser construir aqui, apague o que estiver no caminho.');
                return;
            }

            // tamanho das ferramentas no mapa
            let tamanho = 40; // Tamanho padrao 

            if (this.ferramentaSelecionada.nome === 'Poste' || this.ferramentaSelecionada.nome === 'POP') {
                tamanho = 60; // Poste e POP ficam com 60
            }
            else if (this.ferramentaSelecionada.nome === 'Iglu') {
                tamanho = 38; //  tamanho iglu
            } 

            // Definicao de camadas visuais (Z-Index)
            let profundidade = 10;
            if (this.ferramentaSelecionada.nome === 'Poste') profundidade = 8;
            if (this.ferramentaSelecionada.nome === 'POP') profundidade = 10; 
            if (this.ferramentaSelecionada.nome === 'Iglu') profundidade = 10;

            const construcao = this.add.image(
                blocoX,
                blocoY,
                this.ferramentaSelecionada.chave
            ).setDepth(profundidade);

            construcao.tipoEstrutura = this.ferramentaSelecionada.nome;
            construcao.setDisplaySize(tamanho, tamanho);

            this.animarEncaixe(construcao);

            if (this.ferramentaSelecionada.nome === 'POP') {
                this.popNode = construcao;
                if (this.eventoIntro) this.eventoIntro.remove();
                this.verificarSinalRede();
            }

            if (this.ferramentaSelecionada.nome === 'Iglu') {
                construcao.setTint(0x888888); // #888888 para indicar sem rede
                construcao.isConectado = false;
                
                // Construção do ícone de wifi
                const iconeWifi = this.add.image(blocoX, blocoY - 25, 'wifi')
                    .setDisplaySize(20, 20)
                    .setDepth(12) // Profundidade
                    .setTintFill(0x6e6e6e) // #6e6e6e sinal desligado
                    .setAlpha(0.5);        // meio transparente para indicar sem rede
                
                construcao.iconeWifi = iconeWifi;
                
                this.iglus.push(construcao);

                if (this.eventoIntro) this.eventoIntro.remove();
            }

            this.configurarInteracaoEstrutura(construcao);
            this.atualizarGuia();
        });

        this.resetarTimerOcio();
    }

    // Timer de inatividade. Aguarda 30 segundos antes de chamar o jogador
    resetarTimerOcio() {
        if (this.timerOcio) {
            this.timerOcio.remove();
        }

        this.timerOcio = this.time.addEvent({
            delay: 30000, // 30 segundos
            callback: () => {
                if (!this.ferramentaSelecionada && this.listaCabos.length > 0) {
                    this.falarPinguim('Oi, tá aí? Vamos conectar nossa ilha!', true);
                }
            }
        });
    }

    adicionarCabo(tipo, origem, destino) {
        const cor = tipo === 'Cabo ASU' ? 0x424242 : 0x118a51; // #424242 ASU // #118a51 Drop
        const espessura = tipo === 'Cabo ASU' ? 3 : 2;
        
        // Camadas
        const profundidadeLinha = tipo === 'Cabo ASU' ? 7 : 5; //7 para ASU, 5 para Drop
        const profundidadeHitZone = tipo === 'Cabo ASU' ? 7 : 6; //7 para ASU, 6 para Drop

        const linha = this.add.line(
            0, //x inicial
            0, //y inicial
            origem.x, 
            origem.y,
            destino.x,
            destino.y,
            cor
        ).setLineWidth(espessura).setDepth(profundidadeLinha).setOrigin(0, 0);

        const dist = Phaser.Math.Distance.Between(origem.x, origem.y, destino.x, destino.y);
        const angle = Phaser.Math.Angle.Between(origem.x, origem.y, destino.x, destino.y);

        // Hitbox do cabo para apagar
        const hitZone = this.add.rectangle(
            (origem.x + destino.x) / 2,
            (origem.y + destino.y) / 2,
            dist, // Largura = distancia entre os pontos
            15, // Altura fixa = 15 pixels
            0xff0000,
            0
        ).setDepth(profundidadeHitZone).setRotation(angle).setInteractive({ useHandCursor: true });

        hitZone.on('pointerover', () => {
            if (this.ferramentaSelecionada?.nome === 'Apagar') {
                linha.setStrokeStyle(espessura + 2, 0xFF6666); // #FF6666 ícone que vai apagar
            }
        });

        hitZone.on('pointerout', () => {
            linha.setStrokeStyle(espessura, cor);
        });

        hitZone.on('pointerdown', () => {
            if (this.ferramentaSelecionada?.nome === 'Apagar') {
                linha.destroy();
                hitZone.destroy();
                this.listaCabos = this.listaCabos.filter((c) => c.linha !== linha);
                this.verificarSinalRede();
                this.atualizarGuia();
            }
        });

        this.listaCabos.push({ linha, hitZone, tipo, origem, destino });
    }
    // REGRA FTTH: Avalia a rede Drop para impedir loops e sobrecargas no Splitter (1 CTO atende até 4 Iglus)
    verificarLimiteCadeiaDrop(startNode) {
        let queue = [startNode];
        let visitados = new Set([startNode]);
        let qtdCTO = 0;
        let qtdIglu = 0;

        while (queue.length > 0) {
            let atual = queue.shift();

            if (atual.tipoEstrutura === 'CTO') qtdCTO++;
            if (atual.tipoEstrutura === 'Iglu') qtdIglu++;

            this.listaCabos.forEach((c) => {
                if (c.tipo === 'Cabo Drop' || c.mock) {
                    let vizinho = null;
                    if (c.origem === atual) vizinho = c.destino;
                    if (c.destino === atual) vizinho = c.origem;

                    if (vizinho && !visitados.has(vizinho)) {
                        visitados.add(vizinho);
                        queue.push(vizinho);
                    }
                }
            });
        }
        return { ctos: qtdCTO, iglus: qtdIglu };
    }

    configurarInteracaoEstrutura(construcao) {
        construcao.setInteractive({ useHandCursor: true });

        construcao.on('pointerover', () => {
            if (this.ferramentaSelecionada?.nome === 'Apagar') {
                construcao.setTintFill(0xFF6666); // #FF6666 para indicar que vai apagar
            }
        });

        construcao.on('pointerout', () => {
            construcao.clearTint();
            if (construcao.tipoEstrutura === 'Iglu' && !construcao.isConectado) {
                construcao.setTint(0x888888); // #888888
            }
            if (construcao.tipoEstrutura === 'Iglu') this.verificarSinalRede();
        });

        construcao.on('pointerdown', () => {
            if (this.timerSucesso) this.timerSucesso.remove();

            if (this.ferramentaSelecionada?.nome === 'Apagar') {
                construcao.clearTint();

                const removerCabosDoNo = (no) => {
                    this.listaCabos = this.listaCabos.filter((c) => {
                        if (c.origem === no || c.destino === no) {
                            c.linha.destroy();
                            c.hitZone.destroy();
                            return false;
                        }
                        return true;
                    });
                };

                // REGRA FTTH: Ao apagar o Poste, a caixa instalada (CEO/CTO) e seus cabos sao destruidos juntos
                if (construcao.tipoEstrutura === 'Poste' && construcao.caixaAcoplada) {
                    removerCabosDoNo(construcao.caixaAcoplada); 
                    delete this.gridOcupacao[`${construcao.x}-${construcao.y}`];
                    construcao.caixaAcoplada.destroy(); 
                }

                removerCabosDoNo(construcao);

                if (construcao.tipoEstrutura === 'Iglu') {
                    this.iglus = this.iglus.filter((i) => i !== construcao);
                    if (construcao.iconeWifi) construcao.iconeWifi.destroy(); // Remove o icone ao apagar o iglu
                }

                let apagouPOP = false;

                // REGRA FTTH: O POP e a fonte original. Se destruido, toda a comunicacao global eh cortada
                if (construcao.tipoEstrutura === 'POP') {
                    this.popNode = null;
                    apagouPOP = true;
                }

                if (construcao.postePai) construcao.postePai.caixaAcoplada = null;

                if (construcao.tipoEstrutura === 'CEO' || construcao.tipoEstrutura === 'CTO') {
                    if (construcao.postePai) {
                        delete this.gridOcupacao[`${construcao.postePai.x}-${construcao.postePai.y}`];
                    }
                }

                if (this.pontoInicialCabo === construcao) {
                    this.pontoInicialCabo = null;
                    this.graficosPreviewCabo.clear();
                }

                construcao.destroy();
                this.verificarSinalRede();

                if (apagouPOP) {
                    this.falarPinguim('Atenção! Você removeu o Ponto de Presença (POP)! Ele é o ponto inicial da nossa rede, e ao fazer isso você cortou toda a chance de sinal. Vamos ter que começar a distribuição do zero!');
                } else {
                    this.atualizarGuia();
                }
                
                return;
            }

            // REGRA FTTH: Caixas CEO e CTO requerem sustentacao fisica previa (Poste)
            if (
                this.ferramentaSelecionada?.nome === 'CEO' ||
                this.ferramentaSelecionada?.nome === 'CTO'
            ) {
                if (construcao.tipoEstrutura !== 'Poste' || construcao.caixaAcoplada) return;

                const caixa = this.add.image(
                    construcao.x,
                    construcao.y - 30, // Deslocamento de 30 pixels para cima para ficar na ponta do poste
                    this.ferramentaSelecionada.chave
                ).setDepth(15).setDisplaySize(40, 40);

                caixa.tipoEstrutura = this.ferramentaSelecionada.nome;
                caixa.postePai = construcao;
                construcao.caixaAcoplada = caixa;

                this.gridOcupacao[`${construcao.x}-${construcao.y}`] = { equipamento: caixa };

                this.configurarInteracaoEstrutura(caixa);
                this.animarEncaixe(caixa);
                this.verificarSinalRede();
                this.atualizarGuia();
                return;
            }

            if (this.ferramentaSelecionada?.nome.includes('Cabo')) {
                let alvoConexao = construcao.caixaAcoplada || construcao;

                if (!this.pontoInicialCabo) {
                    if (!['POP', 'CEO', 'CTO', 'Poste', 'Iglu'].includes(alvoConexao.tipoEstrutura)) return;

                    // REGRA FTTH: Cabo Drop nao interage com POP nem CEO, apenas camada de distribuicao (CTO -> Iglus)
                    if (this.ferramentaSelecionada.nome === 'Cabo Drop' && ['POP', 'CEO'].includes(alvoConexao.tipoEstrutura)) {
                        this.falarPinguim('O Cabo Drop não encaixa aí! Ele só passa por CTOs, Postes ou Iglus.');
                        return;
                    }
                    
                    // REGRA FTTH: Cabo ASU nao adentra residencia (Iglu), apenas infraestrutura de rua
                    if (this.ferramentaSelecionada.nome === 'Cabo ASU' && alvoConexao.tipoEstrutura === 'Iglu') {
                        this.falarPinguim('O Cabo ASU é rígido demais! Ele fica na rua, não entra no iglu!');
                        return;
                    }

                    this.pontoInicialCabo = alvoConexao;
                    this.animarEncaixe(alvoConexao);
                } else if (this.pontoInicialCabo !== alvoConexao) {
                    const origem = this.pontoInicialCabo;
                    const destino = alvoConexao;

                    if (this.ferramentaSelecionada.nome === 'Cabo Drop') {
                        if (['POP', 'CEO'].includes(origem.tipoEstrutura) || ['POP', 'CEO'].includes(destino.tipoEstrutura)) {
                            this.falarPinguim('Lembre-se: O Cabo Drop começa na CTO e vai até o iglu. Ele não liga no POP nem na CEO!');
                            this.pontoInicialCabo = null;
                            this.graficosPreviewCabo.clear();
                            return;
                        }
                    }

                    if (this.ferramentaSelecionada.nome === 'Cabo ASU') {
                        if (origem.tipoEstrutura === 'Iglu' || destino.tipoEstrutura === 'Iglu') {
                            this.falarPinguim('O Cabo ASU é a rede primária, não pode entrar no iglu!');
                            this.pontoInicialCabo = null;
                            this.graficosPreviewCabo.clear();
                            return;
                        }
                        
                        // REGRA FTTH: Hierarquia exige passagem pela CEO para ramificar antes de chegar na CTO
                        const pulouEtapa = (origem.tipoEstrutura === 'POP' && destino.tipoEstrutura === 'CTO') || 
                                           (origem.tipoEstrutura === 'CTO' && destino.tipoEstrutura === 'POP');
                        if (pulouEtapa) {
                            this.falarPinguim('Regra FTTH: O POP envia o sinal forte para uma CEO dividir primeiro. Não ligue direto na CTO!');
                            this.pontoInicialCabo = null;
                            this.graficosPreviewCabo.clear();
                            return;
                        }

                        // REGRA FTTH: Sinal e unidirecional. CTO finaliza o fluxo do ASU, impedindo retrocesso a outras CEOs
                        const isCEO = origem.tipoEstrutura === 'CEO' || destino.tipoEstrutura === 'CEO';
                        const isCTO = origem.tipoEstrutura === 'CTO' || destino.tipoEstrutura === 'CTO';

                        if (isCEO && isCTO) {
                            const ctoNode = origem.tipoEstrutura === 'CTO' ? origem : destino;
                            
                            const ctoJaTemASU = this.listaCabos.some(c => 
                                c.tipo === 'Cabo ASU' && (c.origem === ctoNode || c.destino === ctoNode)
                            );
                            
                            if (ctoJaTemASU) {
                                this.falarPinguim('Atenção! Uma CTO já conectada à rede não pode enviar o Cabo ASU de volta para outra CEO. O sinal só vai adiante!');
                                this.pontoInicialCabo = null;
                                this.graficosPreviewCabo.clear();
                                return;
                            }
                        }
                    }

                    // Pre-teste de limite do Splitter e Loops de conexao Drop
                    if (this.ferramentaSelecionada.nome === 'Cabo Drop') {
                        const mockCabo = { tipo: 'Cabo Drop', origem, destino, mock: true };
                        this.listaCabos.push(mockCabo);

                        const analiseRede = this.verificarLimiteCadeiaDrop(origem);

                        this.listaCabos.pop();

                        // REGRA FTTH: Multiplos sinais colidem. 1 Iglu conecta em apenas 1 arvore de CTO
                        if (analiseRede.ctos > 1) {
                            this.falarPinguim('Rede em curto! Você não pode ligar o iglu recebendo sinal de duas CTOs diferentes!');
                            this.pontoInicialCabo = null;
                            this.graficosPreviewCabo.clear();
                            return;
                        }

                        // REGRA FTTH: Simulacao da capacidade real de um Splitter 1x4 dentro da CTO
                        if (analiseRede.iglus > 4) {
                            this.falarPinguim('Sinal fraco! O Splitter dentro da CTO só suporta dividir o sinal para 4 Iglus no máximo.');
                            this.pontoInicialCabo = null;
                            this.graficosPreviewCabo.clear();
                            return;
                        }
                    }

                    this.adicionarCabo(this.ferramentaSelecionada.nome, origem, destino);
                    this.pontoInicialCabo = destino;
                    this.graficosPreviewCabo.clear();
                    this.animarEncaixe(destino);
                    this.verificarSinalRede();
                    this.atualizarGuia();
                }
            }
        });
    }

    // Propaga e analisa o caminho fisico entre os modulos FTTH (Do POP ao Iglu)
    verificarSinalRede() {
        const ceosAtivos = new Set();
        const ctosAtivas = new Set();
        const iglusAtivos = new Set();
        const cabosAtivos = new Set();

        if (this.pulsos) {
            this.pulsos.forEach((p) => {
                if (p.tween) p.tween.stop();
                if (p.dot) p.dot.destroy();
            });
        }

        this.pulsos = [];

        if (this.popNode) {
            const tracarCaminhos = (startNodes, tipoCabo, tiposDestino) => {
                let destinosAlcancados = new Set();
                let queue = [];

                startNodes.forEach(node => queue.push({ current: node, path: [] }));
                let visitados = new Set();
                startNodes.forEach(n => visitados.add(n.postePai ? n.postePai : n));

                while (queue.length > 0) {
                    let { current, path } = queue.shift();
                    const currentBase = current.postePai ? current.postePai : current;

                    this.listaCabos.forEach((c) => {
                        if (c.tipo === tipoCabo) {
                            let vizinhoBase = null;
                            let nodeRealVizinho = null;

                            const origemBase = c.origem.postePai ? c.origem.postePai : c.origem;
                            const destinoBase = c.destino.postePai ? c.destino.postePai : c.destino;

                            if (origemBase === currentBase) {
                                vizinhoBase = destinoBase;
                                nodeRealVizinho = c.destino;
                            } else if (destinoBase === currentBase) {
                                vizinhoBase = origemBase;
                                nodeRealVizinho = c.origem;
                            }

                            if (vizinhoBase && !visitados.has(vizinhoBase)) {
                                let direcaoSinal = {
                                    start: origemBase === currentBase ? c.origem : c.destino,
                                    end: nodeRealVizinho
                                };

                                let novoPath = [...path, { cabo: c, direcaoSinal: direcaoSinal }];
                                let encontrouDestino = false;

                                if (tiposDestino.includes(vizinhoBase.tipoEstrutura)) {
                                    destinosAlcancados.add(vizinhoBase);
                                    encontrouDestino = true;
                                } else if (vizinhoBase.caixaAcoplada && tiposDestino.includes(vizinhoBase.caixaAcoplada.tipoEstrutura)) {
                                    destinosAlcancados.add(vizinhoBase.caixaAcoplada);
                                    encontrouDestino = true;
                                }

                                if (encontrouDestino) {
                                    novoPath.forEach(p => {
                                        cabosAtivos.add(p.cabo);
                                        p.cabo.direcaoSinal = p.direcaoSinal;
                                    });
                                }

                                if (['Poste', 'CEO', 'CTO', 'Iglu'].includes(vizinhoBase.tipoEstrutura)) {
                                    visitados.add(vizinhoBase);
                                    queue.push({ current: vizinhoBase, path: novoPath });
                                }
                            }
                        }
                    });
                }
                return Array.from(destinosAlcancados);
            };

            // Cascata do sinal FTTH
            const ceosEncontrados = tracarCaminhos([this.popNode], 'Cabo ASU', ['CEO']);
            ceosEncontrados.forEach(ceo => ceosAtivos.add(ceo));

            if (ceosAtivos.size > 0) {
                const ctosEncontradas = tracarCaminhos(Array.from(ceosAtivos), 'Cabo ASU', ['CTO']);
                ctosEncontradas.forEach(cto => ctosAtivas.add(cto));
            }

            if (ctosAtivas.size > 0) {
                const iglusEncontrados = tracarCaminhos(Array.from(ctosAtivas), 'Cabo Drop', ['Iglu']);
                iglusEncontrados.forEach(iglu => iglusAtivos.add(iglu));
            }
        }

        // Renderizacao dos feixes de luz percorrendo o trajeto ativo
        cabosAtivos.forEach((c) => {
            const dotCor = c.tipo === 'Cabo ASU' ? 0xFFFF00 : 0x118a51;  // #FFFF00 ASU #118a51 Drop 
            const start = c.direcaoSinal.start;
            const end = c.direcaoSinal.end;

            // Camadas das particulas de luz. Luz Primaria (ASU): 13. Luz Secundaria (Drop): 7
            const profundidadeDot = c.tipo === 'Cabo ASU' ? 13 : 7;

            // Tamanho da bolinha de luz: Raio 4
            const dot = this.add.circle(start.x, start.y, 4, dotCor).setDepth(profundidadeDot);
            const dist = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);

            // Controle de velocidade das particulas (Menor = Mais rapido). Luz ASU=30, Luz Drop=20
            const velocidadePulsos = c.tipo === 'Cabo ASU' ? 30 : 20;

            const tween = this.tweens.add({
                targets: dot,
                x: end.x,
                y: end.y,
                duration: dist * velocidadePulsos,
                repeat: -1,
                ease: 'Linear'
            });

            this.pulsos.push({ dot, tween });
        });

        // Alterna a coloracao visual indicando se a residencia tem internet ativa e controla o icone Wi-Fi
        this.iglus.forEach((iglu) => {
            if (iglusAtivos.has(iglu)) {
                iglu.clearTint();
                iglu.isConectado = true;
                if (iglu.iconeWifi) {
                    iglu.iconeWifi.clearTint(); 
                    iglu.iconeWifi.setAlpha(1); 
                }
            } else {
                iglu.setTint(0x888888); // #888888
                iglu.isConectado = false;
                if (iglu.iconeWifi) {
                    iglu.iconeWifi.setTintFill(0x6e6e6e); // #6e6e6e
                    iglu.iconeWifi.setAlpha(0.5);     
                }
            }
        });
    }

    atualizarGuia() {
        if (!this.guiaAtivo) return;
        if (this.iglus.length === 0) return;

        if (!this.popNode) {
            this.falarPinguim('Ótimo! Agora instale a central: o lugar ideal para o POP é bem no meio do mapa para espalhar bem o sinal.');
            return;
        }

        const qtdCEO = Object.values(this.gridOcupacao).filter(
            (g) => g.equipamento && g.equipamento.tipoEstrutura === 'CEO'
        ).length;

        if (qtdCEO === 0) {
            this.falarPinguim('A Central (POP) está pronta! Construa o caminho espalhando postes vazios pela rua e instale as caixas CEO neles.');
            return;
        }

        const popLigadoCEO = this.listaCabos.some(
            (c) =>
                c.tipo === 'Cabo ASU' &&
                (
                    (c.origem.tipoEstrutura === 'POP' && c.destino.tipoEstrutura === 'CEO') ||
                    (c.origem.tipoEstrutura === 'CEO' && c.destino.tipoEstrutura === 'POP') ||
                    c.origem.tipoEstrutura === 'Poste' ||
                    c.destino.tipoEstrutura === 'Poste'
                )
        );

        if (!popLigadoCEO) {
            this.falarPinguim('A CEO precisa de luz! Use o Cabo ASU resistente para ligar a central POP até as suas novas CEOs.');
            return;
        }

        const qtdCTO = Object.values(this.gridOcupacao).filter(
            (g) => g.equipamento && g.equipamento.tipoEstrutura === 'CTO'
        ).length;

        if (qtdCTO === 0) {
            this.falarPinguim('Sinal na CEO! Agora instale mais postes na rua dos clientes e coloque as caixas de CTO neles.');
            return;
        }

        const ceoLigadaCTO = this.listaCabos.some(
            (c) =>
                c.tipo === 'Cabo ASU' &&
                (
                    (c.origem.tipoEstrutura === 'CEO' && c.destino.tipoEstrutura === 'CTO') ||
                    (c.origem.tipoEstrutura === 'CTO' && c.destino.tipoEstrutura === 'CEO') ||
                    c.origem.tipoEstrutura === 'Poste' ||
                    c.destino.tipoEstrutura === 'Poste'
                )
        );

        if (!ceoLigadaCTO) {
            this.falarPinguim('Quase lá! Use o Cabo ASU para ramificar o sinal da CEO até as CTOs perto dos iglus.');
            return;
        }

        const iglusOn = this.iglus.filter((i) => i.isConectado).length;

        if (iglusOn === 0) {
            this.falarPinguim('O sinal chegou na rua! Pegue o Cabo Drop (fio fino) e ligue a CTO até os Iglus usando os postes.');
        } else if (iglusOn > 0 && iglusOn < this.iglus.length) {
            this.falarPinguim('Luz na fibra! Já temos pinguins conectados curtindo a internet, mas repare que ainda há iglus sem sinal! Faça mais conexões para conectar toda nossa ilha');
        } else {
            if (this.ferramentaSelecionada && this.ferramentaSelecionada.nome === 'Poste') {
                this.falarPinguim('Boa! Posicione os postes em locais estratégicos. Eles podem servir só de passagem para os cabos ou receber novas caixas.');
            } else if (this.sucessoAlcancado !== this.iglus.length) {
                this.sucessoAlcancado = this.iglus.length; 
                this.falarPinguim('Incrível! Missão Cumprida! A rede FTTH está operando e todos os clientes têm internet super rápida!');
                
                // Mensagem de delay apos conexao total bem sucedida
                if (this.timerSucesso) this.timerSucesso.remove();
                this.timerSucesso = this.time.delayedCall(6500, //Espera 6500ms
                    () => { 
                    this.falarPinguim('Quer expandir? Coloque mais Iglus no mapa e crie novas ramificações conectadas ao nosso POP.');
                });
            }
        }
    }

    // Feedback visual para clique de assentamento no grid
    animarEncaixe(alvo) {
        const escalaOriginal = alvo.scale;

        this.tweens.add({
            targets: alvo,
            scale: escalaOriginal * 1.05,
            yoyo: true,
            duration: 100,
            ease: 'Sine.easeInOut'
        });
    }
}