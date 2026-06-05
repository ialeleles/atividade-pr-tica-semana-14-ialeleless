const API_URL = "http://localhost:3000/manobras";

async function fetchItems() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao buscar dados do servidor");
        return await response.json();
    } catch (error) {
        console.error("Erro na requisição:", error);
        return [];
    }
}

function createCard(item) {
    // Detecta se o navegador já está dentro da pasta public para não duplicar na URL
    const prefixoPasta = window.location.pathname.includes('/public/') ? "" : "public/";
    
    return `
        <div class="col-12 col-sm-6 col-lg-4 d-flex justify-content-center">
            <div class="card h-100 w-100">
                <img src="${item.imagem}" alt="${item.nome}" class="card-img-top">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="fw-bold mb-2">${item.nome}</h5>
                        <p class="tag fw-semibold mb-2">${item.categoria}</p>
                        <p class="card-text text-light small mb-3">${item.descricaoCurta}</p>
                        <p class="text-secondary small">Dificuldade técnica: <strong>${item.dificuldade_num}/5</strong></p>
                    </div>
                    <a href="${prefixoPasta}details.html?id=${item.id}" class="btn btn-outline-light btn-sm mt-2">Ver detalhes</a>
                </div>
            </div>
        </div>
    `;
}

function renderCards(items) {
    const container = document.getElementById('container-manobras');
    if (!container) return;

    let htmlCards = "";
    items.forEach(item => {
        htmlCards += createCard(item);
    });

    if (items.length === 0) {
        container.innerHTML = "<p class='text-secondary text-center mt-4'>Nenhuma manobra encontrada nesta categoria.</p>";
    } else {
        container.innerHTML = htmlCards;
    }
}

function renderCarrossel(items) {
    const containerCarrossel = document.getElementById('carrossel-itens');
    const containerIndicadores = document.getElementById('carrossel-indicators');

    if (!containerCarrossel || !containerIndicadores) return;

    const itensDestaque = items.filter(m => m.destaque);
    let htmlCarrossel = "";
    let htmlIndicadores = "";
    
    const prefixoPasta = window.location.pathname.includes('/public/') ? "" : "public/";
    
    itensDestaque.forEach((item, index) => {
        const activeClass = index === 0 ? "active" : "";
        
        htmlCarrossel += `
            <div class="carousel-item ${activeClass}">
                <img src="${item.imagem}" class="d-block w-100" alt="${item.nome}">
                <div class="carousel-caption">
                    <div class="bg-dark bg-opacity-75 caixa-texto-slide">
                        <h2 class="fw-bold text-white text-uppercase mb-1">${item.nome}</h2>
                        <p class="text-light mb-3">${item.descricaoCurta}</p>
                        <a href="${prefixoPasta}details.html?id=${item.id}" class="btn btn-light btn-sm fw-bold px-3">Ver detalhes</a>
                    </div>
                </div>
            </div>
        `;

        htmlIndicadores += `
            <button type="button" data-bs-target="#carouselDestaques" data-bs-slide-to="${index}" class="${activeClass}" aria-current="${index === 0 ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>
        `;
    });
    
    containerCarrossel.innerHTML = htmlCarrossel;
    containerIndicadores.innerHTML = htmlIndicadores;
}

async function init() {
    const containerHome = document.getElementById('container-manobras');
    if (!containerHome) return; 

    const manobrasApi = await fetchItems();

    renderCards(manobrasApi);
    renderCarrossel(manobrasApi);

    const selectFiltro = document.getElementById('filtro-categoria');
    if (selectFiltro) {
        selectFiltro.addEventListener('change', (evento) => {
            const categoriaSelecionada = evento.target.value;
            if (categoriaSelecionada === "Todos") {
                renderCards(manobrasApi);
            } else {
                const manobrasFiltradas = manobrasApi.filter(m => m.categoria === categoriaSelecionada);
                renderCards(manobrasFiltradas);
            }
        });
    }
}

async function carregarDetalhes() {
    const container = document.getElementById('detalhe-manobra');
    if (!container) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const idDaManobra = urlParams.get('id');

    if (!idDaManobra) {
        container.innerHTML = `
            <div class="alert alert-warning text-center mt-4" role="alert">
                Erro: ID da manobra não foi especificado na URL!
            </div>
            <div class="text-center mt-3"><a href="index.html" class="btn btn-light">Voltar para Home</a></div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${idDaManobra}`);
        
        if (!response.ok) {
            container.innerHTML = `
                <div class="alert alert-danger text-center mt-4" role="alert">
                    Manobra não encontrada em nosso banco de dados!
                </div>
                <div class="text-center mt-3"><a href="index.html" class="btn btn-light">Voltar para Home</a></div>
            `;
            return;
        }

        const manobra = await response.json();

        let tagsHtml = "";
        manobra.tags.forEach(tag => {
            tagsHtml += `<span class="badge bg-secondary me-1 p-2">#${tag}</span>`;
        });

        container.innerHTML = `
            <div class="row align-items-center text-light">
                <div class="col-md-6 mb-4 mb-md-0">
                    <img src="${manobra.imagem}" class="img-fluid rounded shadow" alt="${manobra.nome}">
                </div>
                <div class="col-md-6">
                    <h1 class="display-4 fw-bold">${manobra.nome}</h1>
                    <div class="my-3">
                        <span class="badge bg-danger p-2 fs-6 me-2">${manobra.categoria}</span>
                        <span class="badge bg-dark border border-secondary p-2 fs-6">Dificuldade: ${manobra.dificuldade_num}/5</span>
                    </div>
                    <p class="lead mt-3 text-warning"><em>"${manobra.descricaoCurta}"</em></p>
                    <p class="mt-2">${manobra.descricaoCompleta}</p>
                    <hr class="bg-light">
                    <p class="mb-2"><strong>Base recomendada:</strong> ${manobra.base}</p>
                    <div class="bg-dark border border-secondary text-light p-3 rounded my-3">
                        <p class="small mb-0">💡 <strong>Dica de Mestre:</strong> ${manobra.dica_mestre}</p>
                    </div>
                    <div class="mt-4 mb-4">
                        <h6 class="fw-bold text-secondary mb-2">Tags do estilo:</h6>
                        ${tagsHtml}
                    </div>
                    <a href="index.html" class="btn btn-outline-light mt-2">← Voltar para as Manobras</a>
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger text-center mt-4" role="alert">
                Ocorreu um erro de conexão ao tentar buscar os detalhes.
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init();
    carregarDetalhes();
});