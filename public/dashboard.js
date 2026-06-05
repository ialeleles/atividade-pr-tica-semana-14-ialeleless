const API_URL = "http://localhost:3000/manobras";

async function carregarDadosGraficos() {
    try {
        const response = await fetch(API_URL);
        const manobras = await response.json();

        if (manobras.length === 0) return;

        const categoriasContagem = {};
        manobras.forEach(m => {
            categoriasContagem[m.categoria] = (categoriasContagem[m.categoria] || 0) + 1;
        });

        const labelsCategorias = Object.keys(categoriasContagem);
        const dadosCategorias = Object.values(categoriasContagem);

        const ctxBarras = document.getElementById('graficoCategorias').getContext('2d');
        new Chart(ctxBarras, {
            type: 'bar',
            data: {
                labels: labelsCategorias,
                datasets: [{
                    label: 'Número de Manobras',
                    data: dadosCategorias,
                    backgroundColor: ['#dc3545', '#ffc107', '#0dcaf0', '#198754', '#6c757d'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#fff' } },
                    x: { ticks: { color: '#fff' } }
                }
            }
        });

    } catch (error) {
        console.error("Erro ao carregar os dados para os gráficos:", error);
    }
}

document.addEventListener("DOMContentLoaded", carregarDadosGraficos);