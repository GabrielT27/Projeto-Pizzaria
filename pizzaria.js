let pizzaria = [];


function mostrarSecao(secao) {
    // esconde as seções
document.getElementById("cadastro").classList.add("hidden");
document.getElementById("cardapio").classList.add("hidden");

// mostrar seção selecionada

document.getElementById(secao).classList.remove("hidden");
}

function cadastrarPizza() {
    const nome = document.getElementById("nome-pizza").value;
    const sabor = document.getElementById("ingredientes").value;
    const preco = document.getElementById("preco").value;

    if (nome && sabor && preco) {
        pizzaria.push({ nome, sabor, preco });
        document.getElementById("nome-pizza").value= "";
        document.getElementById("ingredientes").value= "";
        document.getElementById("preco").value= "";
        // atualizarLista();
        alert("Pizza adicionada com sucesso!");
    } else {
        alert("Por favor, preencha todos os campos.");
    }
}

function buscarPizza() {
    const busca = document.getElementById("cardapio").value.toLowerCase();
    const resultado = pizzaria.find((pizza) => 
        pizza.nome.toLowerCase().includes(cardapio)
);
atualizarLista(resultado);
}

function atualizarLista(lista = pizzaria) {
    const tabela = document.getElementById("cardapio");
    tabela.innerHTML = "";

    lista.forEach((pizza) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
        <td>${pizza.nome}</td>
        <td>${pizza.sabor}</td>
        <td>${pizza.preco}</td>
        `;
        tabela.appendChild(linha);
    });
}

