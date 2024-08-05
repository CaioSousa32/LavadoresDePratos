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
const intervaloEntrePratos = 5000; // 5 segundos entre adições de pratos
const maxTotalPratos = 18; // Número máximo de pratos permitidos

// Função para iniciar o jogo e começar a adicionar pratos
// Função para iniciar o jogo e começar a adicionar pratos
function iniciarJogo() {
    const nomeJogador = document.getElementById('player-name').value.trim();
    if (!nomeJogador) {
        mostrarMensagem('Por favor, insira seu nome antes de iniciar o jogo.');
        return;
    }

    // Atualiza a interface com o nome do jogador
    document.getElementById('player-name-display').textContent = `Nome do Jogador: ${nomeJogador}`;

    // Oculta o campo de entrada e o botão "Iniciar Jogo"
    document.getElementById('intro').classList.add('hidden');
    
    // Mostra as informações do jogo
    document.getElementById('game-info').classList.remove('hidden');
    document.getElementById('pilhas').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden'); // Mostra a seção de controles

    clearInterval(intervaloPratos);
    resetarPilhas(); // Limpa as pilhas no início do jogo
    atualizarTela(); // Atualiza a tela inicialmente
    tempoInicio = Date.now(); // Registra o tempo de início do jogo
    let totalPratosAdicionados = 0;

    // Adiciona pratos um por vez a cada intervalo
    intervaloPratos = setInterval(() => {
        if (totalPratosAdicionados < maxTotalPratos) {
            const pilhaDisponivel = pilhas.find(pilha => pilha.totalEmpilhados < pilha.maxEmpilhamento);
            if (pilhaDisponivel) {
                const rotulo = gerarSequencia(6); // Gera uma sequência de 6 caracteres
                pilhaDisponivel.adicionarPrato(rotulo);
                totalPratosAdicionados++;
                if (totalPratosAdicionados >= maxTotalPratos) {
                    // Parar de adicionar novos pratos se o número máximo for atingido
                    clearInterval(intervaloPratos);
                }
            }
        }
        verificarLimiteEmpilhamento(); // Verifica se todas as pilhas atingiram o limite
    }, intervaloEntrePratos);
}

// Restante do código JavaScript permanece o mesmo


// Função para gerar uma sequência de caracteres
function gerarSequencia(length) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sequencia = '';
    for (let i = 0; i < length; i++) {
        sequencia += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return sequencia;
}

// Função para resetar as pilhas
function resetarPilhas() {
    pilhas.forEach(pilha => {
        while (pilha.topo !== null) {
            pilha.removerPrato();
        }
        // Limpa contagens de pratos lavados e empilhados
        pilha.totalEmpilhados = 0;
        pilha.totalLavados = 0;
    });
}

function registrarRanking() {
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
        ranking.sort((a, b) => b.totalLavados - a.totalLavados || a.tempoMedioPorPrato - b.tempoMedioPorPrato); // Ordena por pratos lavados e tempo médio por prato
        atualizarRanking();
    }

    // Mostra o botão para iniciar um novo jogo e o campo de entrada do nome
    document.getElementById('intro').classList.remove('hidden');
    document.getElementById('game-info').classList.add('hidden');
    document.getElementById('pilhas').classList.add('hidden');
    document.getElementById('ranking').classList.remove('hidden');
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
                break;
            }
        }
        if (!sucesso) {
            mostrarMensagem('Sequência incorreta ou prato não encontrado.');
        }
    } else {
        mostrarMensagem('Sequência inválida. Deve ter 6 caracteres.');
    }

    // Limpa o campo de entrada após tentar lavar o prato
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

// Inicializa os eventos após o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    const inputNomeJogador = document.getElementById('player-name');
    const botaoIniciarJogo = document.getElementById('start-game');
    const inputSequencia = document.getElementById('input-sequencia');
    const botaoLavarPrato = document.getElementById('lavar-prato');

    // Adiciona evento de clique ao botão "Iniciar Jogo"
    botaoIniciarJogo.addEventListener('click', iniciarJogo);

    // Adiciona evento de tecla ao campo de entrada do nome do jogador
    inputNomeJogador.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita o comportamento padrão
            iniciarJogo();
        }
    });

    // Adiciona evento de clique ao botão "Lavar Prato"
    botaoLavarPrato.addEventListener('click', lavarPrato);

    // Adiciona evento de tecla ao campo de entrada da sequência
    inputSequencia.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita o comportamento padrão
            lavarPrato();
        }
    });
});
