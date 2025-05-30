// Função para mostrar mensagens na tela (substitui alert)
function mostrarMensagem(msg, tipo = "info") {
    let div = document.getElementById('mensagem');
    if (!div) {
        div = document.createElement('div');
        div.id = 'mensagem';
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.zIndex = '9999';
        div.style.padding = '16px 28px';
        div.style.borderRadius = '8px';
        div.style.fontSize = '1.1em';
        div.style.boxShadow = '0 2px 12px #0002';
        div.style.transition = 'opacity 0.3s';
        document.body.appendChild(div);
    }
    div.style.background = tipo === "erro" ? "#ffdddd" : "#e2b96c";
    div.style.color = tipo === "erro" ? "#b53a1c" : "#4d2e00";
    div.innerText = msg;
    div.style.opacity = "1";
    setTimeout(() => { div.style.opacity = "0"; }, 2500);
}

let pizzas = JSON.parse(localStorage.getItem('pizzas')) || [
    {
        nome: "Margherita",
        ingredientes: "Molho de tomate, mussarela, manjericão",
        preco: 40.00,
        imagem: "imagens/margherita.jpg"
    },
    {
        nome: "Calabresa",
        ingredientes: "Molho de tomate, mussarela, calabresa, cebola",
        preco: 45.00,
        imagem: "imagens/calabresa.jpg"
    },
    {
        nome: "Quatro Queijos",
        ingredientes: "Molho de tomate, mussarela, parmesão, gorgonzola, catupiry",
        preco: 50.00,
        imagem: "imagens/quatroqueijos.jpg"
    }
];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
let usuarios = [
    { usuario: 'admin', senha: '1234', tipo: 'admin' },
    { usuario: 'cliente', senha: '1234', tipo: 'cliente' }
];
let usuarioLogado = null;
let pedidosCliente = [];
let historicoPedidos = JSON.parse(localStorage.getItem('historicoPedidos')) || {};

function salvarDados() {
    localStorage.setItem('pizzas', JSON.stringify(pizzas));
    localStorage.setItem('vendas', JSON.stringify(vendas));
    localStorage.setItem('historicoPedidos', JSON.stringify(historicoPedidos));
}

function mostrarSecao(secao) {
    document.querySelectorAll('body > div:not(.menu):not(header)').forEach(div => div.style.display = 'none');
    const el = document.getElementById(secao);
    if (el) el.style.display = 'block';
    if (secao === 'cardapio') atualizarCardapio();
    if (secao === 'pedido') atualizarSelectPedido();
    if (secao === 'vendas') atualizarSelectVenda();
    if (secao === 'relatorio') atualizarRelatorio();
    if (secao === 'meusPedidos') atualizarMeusPedidos();
    if (secao === 'cadastro') previewImagemPizza();
    if (secao === 'pagamento') atualizarListaPedidos();
}

function mostrarMenu() {
    document.getElementById('menu-admin').style.display = usuarioLogado && usuarioLogado.tipo === 'admin' ? 'flex' : 'none';
    document.getElementById('menu-cliente').style.display = usuarioLogado && usuarioLogado.tipo === 'cliente' ? 'flex' : 'none';
    document.getElementById('menu-principal').style.display = usuarioLogado ? 'none' : 'flex';
}

// Login
function fazerLogin() {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    if (!usuario || !senha) {
        mostrarMensagem('Preencha usuário e senha!', "erro");
        return;
    }
    const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
    if (user) {
        usuarioLogado = user;
        mostrarMenu();
        document.getElementById('login').style.display = 'none';
        if (user.tipo === 'admin') {
            mostrarSecao('cadastro');
        } else {
            pedidosCliente = [];
            mostrarSecao('cardapio');
        }
        document.getElementById('usuario').value = '';
        document.getElementById('senha').value = '';
        mostrarMensagem('Login realizado com sucesso!');
    } else {
        mostrarMensagem('Usuário ou senha incorretos!', "erro");
        document.getElementById('senha').value = '';
    }
}

function logout() {
    usuarioLogado = null;
    mostrarMenu();
    document.getElementById('login').style.display = 'flex';
    mostrarSecao('login');
}

// Cadastro de pizza (admin)
function cadastrarPizza() {
    if (!usuarioLogado || usuarioLogado.tipo !== 'admin') {
        mostrarMensagem('Apenas o administrador pode cadastrar pizzas!', "erro");
        return;
    }
    const nome = document.getElementById('nome-pizza').value.trim();
    const ingredientes = document.getElementById('ingredientes').value.trim();
    const preco = parseFloat(document.getElementById('preco').value);
    const imagem = document.getElementById('imagem-pizza').value.trim();
    if (!nome || !ingredientes || isNaN(preco) || preco <= 0 || !imagem) {
        mostrarMensagem('Preencha todos os campos corretamente!', "erro");
        return;
    }
    pizzas.push({ nome, ingredientes, preco, imagem });
    salvarDados();
    mostrarMensagem('Pizza cadastrada!');
    atualizarCardapio();
    document.getElementById('nome-pizza').value = '';
    document.getElementById('ingredientes').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('imagem-pizza').value = '';
    document.getElementById('preview-imagem').innerHTML = '';
}

// Preview de imagem no cadastro de pizza
function previewImagemPizza() {
    const url = document.getElementById('imagem-pizza').value;
    const preview = document.getElementById('preview-imagem');
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="Prévia" style="width:100px; border-radius:8px;">`;
    } else {
        preview.innerHTML = '';
    }
}

// Atualiza cardápio
function atualizarCardapio() {
    const tbody = document.getElementById('lista-cardapio');
    if (!tbody) return;
    tbody.innerHTML = '';
    pizzas.forEach((pizza, idx) => {
        let acoes = '';
        if (usuarioLogado && usuarioLogado.tipo === 'admin') {
            acoes = `
                <button onclick="alterarPizza(${idx})"><i class="fas fa-edit"></i></button>
                <button onclick="removerPizza(${idx})"><i class="fas fa-trash"></i></button>
            `;
        } else if (usuarioLogado && usuarioLogado.tipo === 'cliente') {
            acoes = `<button onclick="abrirPedido(${idx})">Pedir</button>`;
        }
        tbody.innerHTML += `
            <tr>
                <td><img src="${pizza.imagem}" alt="${pizza.nome}" style="width:80px; border-radius:8px;"></td>
                <td>${pizza.nome}</td>
                <td>${pizza.ingredientes}</td>
                <td>R$ ${pizza.preco.toFixed(2)}</td>
                <td>${acoes}</td>
            </tr>
        `;
    });
}

// Busca pizza no cardápio
function buscarPizza() {
    const busca = document.getElementById('busca').value.toLowerCase();
    const tbody = document.getElementById('lista-cardapio');
    tbody.innerHTML = '';
    pizzas.filter(p => p.nome.toLowerCase().includes(busca)).forEach((pizza, idx) => {
        let acoes = '';
        if (usuarioLogado && usuarioLogado.tipo === 'admin') {
            acoes = `
                <button onclick="alterarPizza(${idx})"><i class="fas fa-edit"></i></button>
                <button onclick="removerPizza(${idx})"><i class="fas fa-trash"></i></button>
            `;
        } else if (usuarioLogado && usuarioLogado.tipo === 'cliente') {
            acoes = `<button onclick="abrirPedido(${idx})">Pedir</button>`;
        }
        tbody.innerHTML += `
            <tr>
                <td><img src="${pizza.imagem}" alt="${pizza.nome}" style="width:80px; border-radius:8px;"></td>
                <td>${pizza.nome}</td>
                <td>${pizza.ingredientes}</td>
                <td>R$ ${pizza.preco.toFixed(2)}</td>
                <td>${acoes}</td>
            </tr>
        `;
    });
}

// ADMIN: Alterar pizza
function alterarPizza(idx) {
    if (!usuarioLogado || usuarioLogado.tipo !== 'admin') return;
    const pizza = pizzas[idx];
    document.getElementById('nome-pizza').value = pizza.nome;
    document.getElementById('ingredientes').value = pizza.ingredientes;
    document.getElementById('preco').value = pizza.preco;
    document.getElementById('imagem-pizza').value = pizza.imagem;
    previewImagemPizza();
    pizzas.splice(idx, 1);
    salvarDados();
    mostrarSecao('cadastro');
    mostrarMensagem('Preencha os campos para alterar a pizza.');
}

// ADMIN: Remover pizza
function removerPizza(idx) {
    if (!usuarioLogado || usuarioLogado.tipo !== 'admin') return;
    pizzas.splice(idx, 1);
    salvarDados();
    atualizarCardapio();
    mostrarMensagem('Pizza removida!');
}

// ADMIN: Registrar venda manual
function atualizarSelectVenda() {
    const select = document.getElementById('pizza-venda');
    if (!select) return;
    select.innerHTML = '';
    pizzas.forEach((pizza, idx) => {
        select.innerHTML += `<option value="${idx}">${pizza.nome}</option>`;
    });
}

function registrarVenda() {
    const idx = document.getElementById('pizza-venda').value;
    const quantidade = parseInt(document.getElementById('quantidade-venda').value);
    const pagamento = document.getElementById('pagamento-venda').value;
    if (!pizzas[idx]) {
        mostrarMensagem('Selecione uma pizza válida.', "erro");
        return;
    }
    if (isNaN(quantidade) || quantidade < 1) {
        mostrarMensagem('Informe uma quantidade válida.', "erro");
        return;
    }
    vendas.push({
        pizza: pizzas[idx].nome,
        quantidade,
        total: pizzas[idx].preco * quantidade,
        pagamento,
        data: new Date().toLocaleString('pt-BR')
    });
    salvarDados();
    mostrarMensagem('Venda registrada!');
    atualizarRelatorio();
}

// CLIENTE: Abre tela de pedido já com pizza selecionada
function abrirPedido(idx) {
    atualizarSelectPedido(idx);
    mostrarSecao('pedido');
}

// CLIENTE: Atualiza select de pizzas para pedido
function atualizarSelectPedido(idxSelecionado) {
    const select = document.getElementById('pizza-pedido');
    if (!select) return;
    select.innerHTML = '';
    pizzas.forEach((pizza, idx) => {
        select.innerHTML += `<option value="${idx}" ${idxSelecionado === idx ? 'selected' : ''}>${pizza.nome}</option>`;
    });
}

// CLIENTE: Adiciona pizza ao pedido em andamento
function fazerPedido() {
    const idx = document.getElementById('pizza-pedido').value;
    const quantidade = parseInt(document.getElementById('quantidade-pedido').value);
    if (!pizzas[idx]) {
        mostrarMensagem('Selecione uma pizza válida.', "erro");
        return;
    }
    if (isNaN(quantidade) || quantidade < 1) {
        mostrarMensagem('Informe uma quantidade válida.', "erro");
        return;
    }
    pedidosCliente.push({
        pizza: pizzas[idx].nome,
        quantidade,
        total: pizzas[idx].preco * quantidade
    });
    atualizarListaPedidos();
    document.getElementById('quantidade-pedido').value = 1;
    mostrarMensagem('Pizza adicionada ao pedido!');
}

// CLIENTE: Atualiza lista de pedidos em andamento
function atualizarListaPedidos() {
    const lista = document.getElementById('lista-pedidos');
    if (!lista) return;
    lista.innerHTML = '';
    pedidosCliente.forEach((p, i) => {
        lista.innerHTML += `<p>${p.quantidade}x ${p.pizza} - Total: R$ ${p.total.toFixed(2)} <button onclick="removerPedido(${i})">Remover</button></p>`;
    });
}

// CLIENTE: Remove item do pedido em andamento
function removerPedido(idx) {
    pedidosCliente.splice(idx, 1);
    atualizarListaPedidos();
}

// CLIENTE: Mostra tela de pagamento
function mostrarPagamento() {
    if (pedidosCliente.length === 0) {
        mostrarMensagem('Adicione pelo menos uma pizza ao pedido!', "erro");
        return;
    }
    mostrarSecao('pagamento');
}

// CLIENTE: Finaliza pedido com método de pagamento
function finalizarPedido() {
    const metodo = document.getElementById('metodo-pagamento').value;
    if (!historicoPedidos[usuarioLogado.usuario]) historicoPedidos[usuarioLogado.usuario] = [];
    historicoPedidos[usuarioLogado.usuario].push({
        itens: [...pedidosCliente],
        pagamento: metodo,
        data: new Date().toLocaleString('pt-BR')
    });
    pedidosCliente.forEach(p => {
        vendas.push({
            pizza: p.pizza,
            quantidade: p.quantidade,
            total: p.total,
            pagamento: metodo,
            data: new Date().toLocaleString('pt-BR')
        });
    });
    salvarDados();
    mostrarMensagem('Pedido realizado com sucesso!');
    pedidosCliente = [];
    atualizarListaPedidos();
    mostrarSecao('meusPedidos');
}

// CLIENTE: Atualiza histórico de pedidos
function atualizarMeusPedidos() {
    const div = document.getElementById('historico-pedidos');
    div.innerHTML = '';
    const pedidos = historicoPedidos[usuarioLogado.usuario] || [];
    if (pedidos.length === 0) {
        div.innerHTML = '<p>Nenhum pedido realizado ainda.</p>';
        return;
    }
    pedidos.forEach(ped => {
        div.innerHTML += `<div style="margin-bottom:10px;"><b>${ped.data}</b> - <b>${ped.pagamento}</b><ul>` +
            ped.itens.map(i => `<li>${i.quantidade}x ${i.pizza} - R$ ${i.total.toFixed(2)}</li>`).join('') +
            '</ul></div>';
    });
}

// ADMIN: Atualiza relatório de vendas
function atualizarRelatorio() {
    const relatorio = document.getElementById('relatorio-vendas');
    relatorio.innerHTML = '';
    if (vendas.length === 0) {
        relatorio.innerHTML = '<p>Nenhuma venda registrada ainda.</p>';
        return;
    }
    vendas.forEach(v => {
        relatorio.innerHTML += `<p>${v.quantidade}x ${v.pizza} - Total: R$ ${v.total.toFixed(2)} - <b>${v.pagamento}</b><br><small>${v.data}</small></p>`;
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    mostrarMenu();
    document.querySelectorAll('body > div:not(.menu):not(header)').forEach(div => div.style.display = 'none');
    document.getElementById('login').style.display = 'flex';
});