class Prato {
    constructor(rotulo) {
        this.rotulo = rotulo; // Sequência de 6 caracteres
        this.lavado = false;
        this.proximo = null;
    }
}

class PilhaDePratos {
    constructor(id, maxEmpilhamento = 3) {
        this.topo = null;
        this.totalEmpilhados = 0;
        this.totalLavados = 0;
        this.maxEmpilhamento = maxEmpilhamento;
        this.id = id;
    }

    adicionarPrato(rotulo) {
        if (this.totalEmpilhados >= this.maxEmpilhamento) {
            return false; // Não adicionar prato se a pilha estiver cheia
        }

        const novoPrato = new Prato(rotulo);
        novoPrato.proximo = this.topo;
        this.topo = novoPrato;
        this.totalEmpilhados++;
        atualizarTela();
        return true;
    }

    removerPrato() {
        if (this.topo === null) return null;
        const pratoRemovido = this.topo;
        this.topo = this.topo.proximo;
        this.totalEmpilhados--;
        return pratoRemovido;
    }

    lavarPrato(rotulo) {
        let pratoAtual = this.topo;
        let pratoAnterior = null;
        while (pratoAtual !== null) {
            if (pratoAtual.rotulo === rotulo && !pratoAtual.lavado) {
                pratoAtual.lavado = true;
                this.totalLavados++;
                this.totalEmpilhados--;
                // Remove o prato da pilha
                if (pratoAnterior === null) {
                    this.topo = pratoAtual.proximo;
                } else {
                    pratoAnterior.proximo = pratoAtual.proximo;
                }
                atualizarTela();
                verificarVitoria(); // Verifica se todos os pratos foram lavados
                return true;
            }
            pratoAnterior = pratoAtual;
            pratoAtual = pratoAtual.proximo;
        }
        return false;
    }

    exibirPilha() {
        const pilhaLista = document.getElementById(`pilha${this.id}-lista`);
        pilhaLista.innerHTML = '';
        let pratoAtual = this.topo;
        while (pratoAtual !== null) {
            const li = document.createElement('li');
            li.textContent = `${pratoAtual.rotulo}`;
            pilhaLista.appendChild(li);
            pratoAtual = pratoAtual.proximo;
        }
    }
}

const pilhas = [
    new PilhaDePratos(1),
    new PilhaDePratos(2),
    new PilhaDePratos(3)
];
const ranking = [];
let intervaloPratos;
let tempoInicio;
const intervaloEntrePratos = 3000; // 3 segundos entre adições de pratos
const maxTotalPratos = 18; // Número máximo de pratos permitidos
let jogoEncerrado = false; // Flag para evitar múltiplos registros de fim de jogo

// Função para iniciar o jogo e começar a adicionar pratos
function iniciarJogo() {
    jogoEncerrado = false; // Reseta a flag de jogo encerrado
    const nomeJogador = document.getElementById('player-name').value.trim();
    if (!nomeJogador) {
        mostrarMensagem('Por favor, insira seu nome antes de iniciar o jogo.');
        return;
    }

    // Atualiza a interface com o nome do jogador
    const playerNameDisplay = document.getElementById('player-name-display');
    if (playerNameDisplay) {
        playerNameDisplay.textContent = `Nome do Jogador: ${nomeJogador}`;
    }    

    document.getElementById('intro').classList.add('hidden');
    
    // Mostra as informações do jogo
    document.getElementById('game-info').classList.remove('hidden');
    document.getElementById('pilhas').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden');

    document.getElementById('volume-controls').style.display = 'block'; 

    clearInterval(intervaloPratos);
    resetarPilhas(); 
    atualizarTela(); 
    tempoInicio = Date.now(); // Registra o tempo de início do jogo
    let totalPratosAdicionados = 0;

    const backgroundMusic = document.getElementById('background-music');
    backgroundMusic.play();

    // Começa a adicionar pratos
    intervaloPratos = setInterval(() => {
        if (totalPratosAdicionados < maxTotalPratos) {
            const pilhaDisponivel = pilhas.find(pilha => pilha.totalEmpilhados < pilha.maxEmpilhamento);
            if (pilhaDisponivel) {
                const rotulo = gerarSequencia(6); // Gera uma sequência de 6 caracteres
                pilhaDisponivel.adicionarPrato(rotulo);
                totalPratosAdicionados++;
                if (totalPratosAdicionados >= maxTotalPratos) {
                    clearInterval(intervaloPratos);
                }
            }
        }
        verificarLimiteEmpilhamento(); // Verifica se todas as pilhas atingiram o limite
    }, intervaloEntrePratos);
}

// Função para gerar uma sequência de caracteres
function gerarSequencia(length) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sequencia = '';
    for (let i = 0; i < length; i++) {
        sequencia += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return sequencia;
}

function resetarPilhas() {
    pilhas.forEach(pilha => {
        while (pilha.topo !== null) {
            pilha.removerPrato();
        }
        pilha.totalEmpilhados = 0;
        pilha.totalLavados = 0;
    });
}

function registrarRanking() {
    if (jogoEncerrado) return;

    const tempoFim = Date.now();
    const tempoTotal = (tempoFim - tempoInicio) / 1000; // Tempo total em segundos
    const totalLavados = pilhas.reduce((acc, pilha) => acc + pilha.totalLavados, 0);
    const tempoMedioPorPrato = totalLavados > 0 ? (tempoTotal / totalLavados).toFixed(2) : 0;

    const jogador = document.getElementById('player-name').value.trim();
    if (jogador) {
        ranking.push({
            jogador,
            totalLavados,
            tempoTotal,
            tempoMedioPorPrato
        });

        // Ordena por pratos lavados e tempo médio por prato
        ranking.sort((a, b) => b.totalLavados - a.totalLavados || a.tempoMedioPorPrato - b.tempoMedioPorPrato); 
        atualizarRanking();
    }

    // Mostra o botão para iniciar um novo jogo e o campo de entrada do nome
    document.getElementById('intro').classList.remove('hidden');
    document.getElementById('game-info').classList.add('hidden');
    document.getElementById('pilhas').classList.add('hidden');
    document.getElementById('ranking').classList.remove('hidden');

    jogoEncerrado = true;
}

function atualizarRanking() {
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = ''; 
    ranking.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `#${index + 1} ${entry.jogador} - Pratos Lavados: ${entry.totalLavados}, Tempo Total: ${entry.tempoTotal.toFixed(2)} segundos, Tempo Médio por Prato: ${entry.tempoMedioPorPrato} segundos`;
        rankingList.appendChild(li);
    });
}

function atualizarTela() {
    pilhas.forEach(pilha => pilha.exibirPilha());
    const totalLavados = pilhas.reduce((acc, pilha) => acc + pilha.totalLavados, 0);
    const totalEmpilhados = pilhas.reduce((acc, pilha) => acc + pilha.totalEmpilhados, 0);
    document.getElementById('pratos-lavados').textContent = totalLavados;
    document.getElementById('pratos-empilhados').textContent = totalEmpilhados;
}

function verificarVitoria() {
    const totalPratosLavados = pilhas.reduce((acc, pilha) => acc + pilha.totalLavados, 0);
    if (totalPratosLavados >= maxTotalPratos) {
        mostrarMensagem('Parabéns! Você lavou todos os pratos e ganhou o jogo!');
        encerrarJogo();
    }
}

function verificarLimiteEmpilhamento() {
    const todasCheias = pilhas.every(pilha => pilha.totalEmpilhados >= pilha.maxEmpilhamento);
    if (todasCheias) {
        mostrarMensagem('Todas as pilhas atingiram o limite de empilhamento! O jogo acabou.');
        encerrarJogo();
    }
}

function encerrarJogo() {
    if (jogoEncerrado) return;

    clearInterval(intervaloPratos);
    registrarRanking();
}
function lavarPrato() {
    const rotulo = document.getElementById('input-sequencia').value.trim();
    let sucesso = false;

    if (rotulo && rotulo.length === 6) {
        // Tenta lavar o prato de qualquer pilha
        for (const pilha of pilhas) {
            if (pilha.lavarPrato(rotulo)) {
                sucesso = true;
                criarConfetes();
                break;
            }
        }
        if (!sucesso) {
            mostrarMensagem('Sequência incorreta ou prato não encontrado.');
        }
    } else {
        mostrarMensagem('Sequência inválida. Deve ter 6 caracteres.');
    }

    document.getElementById('input-sequencia').value = '';
}

// Função para mostrar mensagens na tela
function mostrarMensagem(mensagem) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = mensagem;
    messageBox.classList.remove('hidden');

    // Remove a mensagem após 8 segundos
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 8000);
}

function criarConfetes() {
    const container = document.getElementById('confetti');
    container.innerHTML = ''; 

    const numConfetes = 100;
    
    for (let i = 0; i < numConfetes; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.classList.add('confetti-piece');
        
        confettiPiece.style.left = `${Math.random() * 100}vw`;
        confettiPiece.style.top = `${Math.random() * 100}vh`;
        confettiPiece.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        confettiPiece.style.animationDelay = `${Math.random() * 1}s`;
        
        container.appendChild(confettiPiece);
    }
}

// Função para adicionar pratos
function adicionarPratos() {
    const pilhaDisponivel = pilhas.find(pilha => pilha.totalEmpilhados < pilha.maxEmpilhamento);
    if (pilhaDisponivel) {
        const rotulo = gerarSequencia(6); // Gera uma sequência de 6 caracteres
        pilhaDisponivel.adicionarPrato(rotulo);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputNomeJogador = document.getElementById('player-name');
    const botaoIniciarJogo = document.getElementById('start-game');
    const inputSequencia = document.getElementById('input-sequencia');
    const botaoLavarPrato = document.getElementById('lavar-prato');

    botaoIniciarJogo.removeEventListener('click', iniciarJogo);
    botaoIniciarJogo.addEventListener('click', iniciarJogo);

    inputNomeJogador.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            iniciarJogo();
        }
    });

    botaoLavarPrato.addEventListener('click', lavarPrato);

    inputSequencia.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            lavarPrato();
        }
    }); 

    const volumeBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const backgroundMusic = document.getElementById('background-music');
    
    let isMuted = false;

    function atualizarVolume() {
        backgroundMusic.volume = volumeSlider.value;
    }

    function alternarMute() {
        if (isMuted) {
            backgroundMusic.muted = false;
            volumeBtn.textContent = '🔊'; 
            volumeSlider.value = backgroundMusic.volume; 
        } else {
            backgroundMusic.muted = true;
            volumeBtn.textContent = '🔈'; 
            volumeSlider.value = 0; 
        }
        isMuted = !isMuted;
    }

    volumeSlider.addEventListener('input', atualizarVolume);
    volumeBtn.addEventListener('click', alternarMute);

    backgroundMusic.volume = volumeSlider.value;
});