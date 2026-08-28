console.log("JAVA CARREGOU");

// Supabase
const SUPABASE_URL = "https://trfrcjlqimestmmdgonw.supabase.co";
const SUPABASE_KEY = "sb_publishable_0MpcGtxcajVYtCMkhLYvtg_ul3Y1qHm";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Carrinho salvo
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Elementos
const quantidadeCarrinho = document.querySelector("#quantidade-carrinho");
const linkCarrinho = document.querySelector("#link-carrinho");
const carrinhoLateral = document.querySelector("#carrinho-lateral");
const fundoCarrinho = document.querySelector("#fundo-carrinho");
const fecharCarrinho = document.querySelector("#fechar-carrinho");
const itensCarrinho = document.querySelector("#itens-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const botaoFinalizar = document.querySelector(".btn-finalizar");
const checkout = document.querySelector("#checkout");
const checkoutFundo = document.querySelector("#checkout-fundo");
const fecharCheckout = document.querySelector("#fechar-checkout");
const checkoutTotal = document.querySelector("#checkout-total");
const formCheckout = document.querySelector("#form-checkout");
const gradeProdutos = document.querySelector("#grade-produtos");

// Carrega produtos
async function carregarProdutos() {
    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("id");

    if (error) {
        console.log("Erro ao carregar produtos:", error);
        return;
    }

    gradeProdutos.innerHTML = "";

    data.forEach(produto => {
        const card = document.createElement("div");

        card.classList.add("card-produto");
        card.dataset.id = produto.id;
        card.dataset.estoque = produto.estoque;

        // Tamanhos
        let tamanhos = `
            <option value="">Selecione</option>
            <option value="P">P</option>
            <option value="M">M</option>
            <option value="G">G</option>
            <option value="GG">GG</option>
        `;

        // Tamanhos de calça
        if (produto.categoria === "Calças") {
            tamanhos = `
                <option value="">Selecione</option>
                <option value="38">38</option>
                <option value="40">40</option>
                <option value="42">42</option>
                <option value="44">44</option>
                <option value="46">46</option>
            `;
        }

        card.innerHTML = `
            <img src="./${produto.imagem}" alt="${produto.nome}">

            <h3>${produto.nome}</h3>

            <p class="preco-produto">
                R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}
            </p>

            <p class="estoque-produto">
                Estoque: ${produto.estoque}
            </p>

            <label>Tamanho:</label>

            <select class="tamanho-produto">
                ${tamanhos}
            </select>

            <label>Quantidade:</label>

            <div class="controle-quantidade">
                <button class="btn-menos" type="button">-</button>
                <span class="quantidade-produto">1</span>
                <button class="btn-mais" type="button">+</button>
            </div>

            <button class="btn-adicionar" type="button">
                Adicionar ao Carrinho
            </button>
        `;

        gradeProdutos.appendChild(card);

        // Produto esgotado
        if (produto.estoque === 0) {
            const botao = card.querySelector(".btn-adicionar");
            const quantidade = card.querySelector(".controle-quantidade");
            const tamanho = card.querySelector(".tamanho-produto");

            botao.innerText = "Esgotado";
            botao.disabled = true;
            quantidade.style.display = "none";
            tamanho.disabled = true;
        }
    });
}

// Cliques nos produtos
gradeProdutos.addEventListener("click", function(event) {
    const card = event.target.closest(".card-produto");

    if (!card) return;

    const quantidadeElemento = card.querySelector(".quantidade-produto");
    const estoque = Number(card.dataset.estoque);
    let quantidade = Number(quantidadeElemento.innerText);

    // Aumenta
    if (event.target.classList.contains("btn-mais")) {
        if (quantidade < estoque) {
            quantidade++;
            quantidadeElemento.innerText = quantidade;
        } else {
            alert("Quantidade máxima disponível em estoque.");
        }
    }

    // Diminui
    if (event.target.classList.contains("btn-menos")) {
        if (quantidade > 1) {
            quantidade--;
            quantidadeElemento.innerText = quantidade;
        }
    }

    // Adiciona
    if (event.target.classList.contains("btn-adicionar")) {
        adicionarAoCarrinho(card, event.target);
    }
});

// Adiciona ao carrinho
function adicionarAoCarrinho(card, botao) {
    const id = Number(card.dataset.id);
    const estoque = Number(card.dataset.estoque);
    const nome = card.querySelector("h3").innerText;
    const imagem = card.querySelector("img").src;
    const tamanho = card.querySelector(".tamanho-produto").value;
    const quantidade = Number(
        card.querySelector(".quantidade-produto").innerText
    );

    const precoTexto = card
        .querySelector(".preco-produto")
        .innerText
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim();

    const preco = Number(precoTexto);

    if (tamanho === "") {
        alert("Selecione um tamanho.");
        return;
    }

    const produtoExistente = carrinho.find(
        item => item.id === id && item.tamanho === tamanho
    );

    if (produtoExistente) {
        if (produtoExistente.quantidade + quantidade > estoque) {
            alert("Quantidade maior que o estoque disponível.");
            return;
        }

        produtoExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id,
            nome,
            preco,
            imagem,
            tamanho,
            quantidade,
            estoque
        });
    }

    salvarCarrinho();
    atualizarCarrinho();

    // Feedback
    botao.innerText = "Adicionado ✓";

    setTimeout(function() {
        botao.innerText = "Adicionar ao Carrinho";
    }, 1000);
}

// Salva carrinho
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Atualiza carrinho
function atualizarCarrinho() {
    const quantidadeTotal = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    quantidadeCarrinho.innerText = quantidadeTotal;

    if (carrinho.length === 0) {
        itensCarrinho.innerHTML = "<p>Seu carrinho está vazio.</p>";
        totalCarrinho.innerText = "0,00";
        return;
    }

    itensCarrinho.innerHTML = "";

    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco * item.quantidade;

        const div = document.createElement("div");

        div.classList.add("item-carrinho");

        div.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}">

            <div>
                <h4>${item.nome}</h4>
                <p>Tamanho: ${item.tamanho}</p>
                <p>Quantidade: ${item.quantidade}</p>

                <p>
                    R$ ${(item.preco * item.quantidade)
                        .toFixed(2)
                        .replace(".", ",")}
                </p>

                <button
                    class="remover-item"
                    data-index="${index}"
                    type="button"
                >
                    Remover
                </button>
            </div>
        `;

        itensCarrinho.appendChild(div);
    });

    totalCarrinho.innerText = total
        .toFixed(2)
        .replace(".", ",");
}

// Remove item
itensCarrinho.addEventListener("click", function(event) {
    if (event.target.classList.contains("remover-item")) {
        const index = Number(event.target.dataset.index);

        carrinho.splice(index, 1);

        salvarCarrinho();
        atualizarCarrinho();
    }
});

// Abre carrinho
linkCarrinho.addEventListener("click", function(event) {
    event.preventDefault();

    carrinhoLateral.classList.add("ativo");
    fundoCarrinho.classList.add("ativo");
});

// Fecha carrinho
function fecharPainelCarrinho() {
    carrinhoLateral.classList.remove("ativo");
    fundoCarrinho.classList.remove("ativo");
}

fecharCarrinho.addEventListener("click", fecharPainelCarrinho);
fundoCarrinho.addEventListener("click", fecharPainelCarrinho);

// Abre checkout
botaoFinalizar.addEventListener("click", function() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    checkout.classList.add("ativo");
    checkoutFundo.classList.add("ativo");
    checkoutTotal.innerText = totalCarrinho.innerText;

    fecharPainelCarrinho();
});

// Fecha checkout
function fecharPainelCheckout() {
    checkout.classList.remove("ativo");
    checkoutFundo.classList.remove("ativo");
}

fecharCheckout.addEventListener("click", fecharPainelCheckout);
checkoutFundo.addEventListener("click", fecharPainelCheckout);

// Confirma pedido
formCheckout.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.querySelector("#nome-cliente").value;
    const email = document.querySelector("#email-cliente").value;
    const telefone = document.querySelector("#telefone-cliente").value;
    const cep = document.querySelector("#cep-cliente").value;
    const rua = document.querySelector("#rua-cliente").value;
    const numero = document.querySelector("#numero-cliente").value;
    const bairro = document.querySelector("#bairro-cliente").value;
    const cidade = document.querySelector("#cidade-cliente").value;
    const pagamento = document.querySelector("#forma-pagamento").value;

    const total = carrinho.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
    );

    // Cria pedido
    const { data: pedido, error: erroPedido } = await supabaseClient
        .from("pedidos")
        .insert({
            nome_cliente: nome,
            email: email,
            telefone: telefone,
            cep: cep,
            rua: rua,
            numero: numero,
            bairro: bairro,
            cidade: cidade,
            pagamento: pagamento,
            total: total
        })
        .select("id")
        .single();

    if (erroPedido) {
        console.log("Erro ao criar pedido:", erroPedido);
        alert("Erro ao finalizar pedido.");
        return;
    }

    // Itens do pedido
    const itens = carrinho.map(item => ({
        pedido_id: pedido.id,
        produto_id: item.id,
        nome_produto: item.nome,
        tamanho: item.tamanho,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        subtotal: item.preco * item.quantidade
    }));

    // Salva itens
    const { error: erroItens } = await supabaseClient
        .from("itens_pedidos")
        .insert(itens);

    if (erroItens) {
        console.log("Erro ao salvar itens:", erroItens);
        alert("Pedido criado, mas houve erro ao salvar os produtos.");
        return;
    }

    console.log("PEDIDO CRIADO:", pedido.id);

    alert("Pedido confirmado com sucesso!");

    // Limpa carrinho
    carrinho = [];

    salvarCarrinho();
    atualizarCarrinho();

    formCheckout.reset();
    fecharPainelCheckout();
});

// Inicia
carregarProdutos();
atualizarCarrinho();