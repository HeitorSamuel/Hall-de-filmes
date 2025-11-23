// ===================================================================================
// SELEÇÃO DE ELEMENTOS E VARIÁVEIS GLOBAIS
// ===================================================================================

let cardContainer = document.querySelector(".card-container"); // Seleciona a seção que vai conter os cards dos filmes.
let barraBusca = document.querySelector("#campo-busca"); // Seleciona o campo de input da busca.
let botaoBusca = document.querySelector("#botao-busca"); // Seleciona o botão de busca.
let dados = []; // Array que vai armazenar os dados dos filmes carregados do data.json. Começa vazio.
let generoSelecionado = 'todos'; // Variável para guardar o gênero selecionado nos filtros. Inicia com 'todos'.

// ===================================================================================
// FUNÇÃO PRINCIPAL DE BUSCA E FILTRAGEM
// ===================================================================================

// Função assíncrona para buscar, filtrar e exibir os filmes.
async function escolherFilme() {
    // Mostra a animação de carregamento apenas na área dos cards
    cardContainer.innerHTML = '<div class="loader"></div>';

    // Otimização: Se os dados dos filmes (array 'dados') ainda não foram carregados, busca do arquivo JSON.
    if (dados.length === 0) {
        try {
            let resposta = await fetch("data.json");
            dados = await resposta.json();
            renderizarFiltros(); // Cria os botões de filtro depois de carregar os dados
        } catch (error) {
            console.error("Falha ao buscar dados:", error);
            return; // Interrompe a execução se houver erro
        }
    }

    // Pega o valor digitado na barra de busca e converte para minúsculas para uma busca case-insensitive.
    const palavraBusca = barraBusca.value.toLowerCase();

    // 1. Primeiro filtro: por gênero. Se 'todos' estiver selecionado, usa todos os dados. Senão, filtra pelo gênero.
    const filmesPorGenero = generoSelecionado === 'todos' 
        ? dados 
        : dados.filter(filme => filme.genero.includes(generoSelecionado));

    // 2. Segundo filtro: pelo texto da busca (a partir do resultado do primeiro filtro de gênero).
    const filmesFiltrados = filmesPorGenero.filter(filme => {
        const buscaNoNome = filme.nome.toLowerCase().includes(palavraBusca);
        const buscaNaSinopse = filme.sinopse.toLowerCase().includes(palavraBusca);
        return buscaNoNome || buscaNaSinopse;
    });

    renderizarCards(filmesFiltrados);
}

// ===================================================================================
// FUNÇÃO PARA RENDERIZAR OS CARDS NA TELA
// ===================================================================================

function renderizarCards(dados) {
    cardContainer.innerHTML = ""; // Limpa o conteúdo atual do container (loader ou cards antigos).

    // Se o array de dados filtrados estiver vazio, exibe uma mensagem de "sem resultados".
    if (dados.length === 0) {
        cardContainer.innerHTML = `<p class="sem-resultados">Nenhum filme encontrado. Tente outro termo.</p>`;
        return; // Encerra a função.
    }

    for (let filme of dados) {
        let article = document.createElement("article");
        article.innerHTML = `
        <img src="${filme.imagem}" alt="Pôster do filme ${filme.nome}">
        <div class="card-content">
            <h2>${filme.nome}</h2>
            <p><strong>Ano:</strong> ${filme.ano}</p>
            <p>${filme.sinopse}</p>
            <a href="${filme.link}" target="_blank">Saiba mais sobre o filme</a>
        </div>
        `
        cardContainer.appendChild(article);
    }
}

// ===================================================================================
// FUNÇÃO PARA CRIAR E RENDERIZAR OS BOTÕES DE FILTRO
// ===================================================================================

function renderizarFiltros() {
    const filtrosContainer = document.querySelector('.filtros-container');
    // Lógica para criar a lista de gêneros:
    // 1. `dados.flatMap(filme => filme.genero)`: Pega os arrays de gênero de cada filme e os achata em um único array.
    // 2. `new Set(...)`: Cria um conjunto (Set) a partir do array, o que remove automaticamente todos os gêneros duplicados.
    // 3. `['todos', ...]` : Cria um novo array começando com 'todos' e espalhando os gêneros únicos do Set.
    // Pega todos os gêneros de todos os filmes, achata o array e remove duplicados
    const todosOsGeneros = ['todos', ...new Set(dados.flatMap(filme => filme.genero))];

    todosOsGeneros.forEach(genero => {
        const botao = document.createElement('button');
        botao.innerText = genero.charAt(0).toUpperCase() + genero.slice(1); // Deixa a primeira letra maiúscula
        botao.classList.add('filtro-btn');
        if (genero === 'todos') {
            botao.classList.add('active'); // O botão "Todos" começa ativo
        }
        botao.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões
            document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe 'active' ao botão clicado
            botao.classList.add('active');
            // Atualiza o gênero selecionado e refaz a busca
            generoSelecionado = genero;
            escolherFilme();
        });
        filtrosContainer.appendChild(botao);
    });
}

// ===================================================================================
// "OUVINTES DE EVENTO" (EVENT LISTENERS)
// ===================================================================================

// Adiciona um evento para o logo recarregar tudo
document.querySelector('.logo-container').addEventListener('click', () => {
    window.location.reload();
});

// Evento de 'input': aciona a função 'escolherFilme' toda vez que o usuário digita algo na barra de busca (busca em tempo real).
barraBusca.addEventListener("input", escolherFilme);

// Evento de 'click': aciona a função 'escolherFilme' quando o botão de busca é clicado.
botaoBusca.addEventListener("click", (event) => {
    event.preventDefault(); // Impede o comportamento padrão do botão (como recarregar a página se estivesse em um formulário).
    escolherFilme();
});

// Chamada inicial: executa a função 'escolherFilme' assim que a página termina de carregar, para exibir todos os filmes inicialmente.
escolherFilme();