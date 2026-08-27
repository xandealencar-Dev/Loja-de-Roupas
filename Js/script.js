// Pega o carrinho salvo
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Elementos dos produtos
const quantidadeCarrinho = document.querySelector("#quantidade-carrinho");
const botoesAdicionar = document.querySelectorAll(".btn-adicionar");
const botoesMais = document.querySelectorAll(".btn-mais");
const botoesMenos = document.querySelectorAll(".btn-menos");

// Elementos do carrinho
const linkCarrinho = document.querySelector("#link-carrinho");
const carrinhoLateral = document.querySelector("#carrinho-lateral");
const fecharCarrinho = document.querySelector("#fechar-carrinho");
const itensCarrinho = document.querySelector("#itens-carrinho");
const totalCarrinho = document.querySelector("#total-carrinho");
const fundoCarrinho = document.querySelector("#fundo-carrinho");
const botaoFinalizar = document.querySelector(".btn-finalizar");

// Elementos do checkout
const checkout = document.querySelector("#checkout");
const checkoutFundo = document.querySelector("#checkout-fundo");
const fecharCheckout = document.querySelector("#fechar-checkout");
const checkoutTotal = document.querySelector("#checkout-total");
const formCheckout = document.querySelector("#form-checkout");

// Atualiza ao abrir o site
atualizarCarrinho();

// Aumenta quantidade
botoesMais.forEach(function(botao) {
    botao.addEventListener("click", function() {
        const card = botao.closest(".card-produto");
        const quantidadeElemento = card.querySelector(".quantidade-produto");

        let quantidade = Number(quantidadeElemento.innerText);
        quantidade++;

        quantidadeElemento.innerText = quantidade;
    });
});

// Diminui quantidade
botoesMenos.forEach(function(botao) {
    botao.addEventListener("click", function() {
        const card = botao.closest(".card-produto");
        const quantidadeElemento = card.querySelector(".quantidade-produto");

        let quantidade = Number(quantidadeElemento.innerText);

        if (quantidade > 1) {
            quantidade--;
        }

        quantidadeElemento.innerText = quantidade;
    });
});

// Adiciona produto
botoesAdicionar.forEach(function(botao) {
    botao.addEventListener("click", function() {
        const card = botao.closest(".card-produto");

        const nome = card.querySelector("h3").innerText;
        const precoTexto = card.querySelector(".preco-produto").innerText;
        const tamanho = card.querySelector(".tamanho-produto").value;
        const imagem = card.querySelector("img").src;
        const quantidade = Number(
            card.querySelector(".quantidade-produto").innerText
        );

        // Verifica tamanho
        if (tamanho === "") {
            alert("Selecione um tamanho.");
            return;
        }

        // Converte preço
        const preco = Number(
            precoTexto
                .replace("R$", "")
                .replace(",", ".")
                .trim()
        );

        // Procura produto igual
        const produtoExistente = carrinho.find(function(produto) {
            return produto.nome === nome && produto.tamanho === tamanho;
        });

        // Soma ou cria produto
        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
        } else {
            const produto = {
                nome: nome,
                preco: preco,
                tamanho: tamanho,
                imagem: imagem,
                quantidade: quantidade
            };

            carrinho.push(produto);
        }

        salvarCarrinho();
        atualizarCarrinho();

        // Feedback visual
        const textoOriginal = botao.innerText;

        botao.innerText = "Adicionado ✓";
        botao.disabled = true;

        setTimeout(function() {
            botao.innerText = textoOriginal;
            botao.disabled = false;
        }, 1200);
    });
});

// Abre carrinho
linkCarrinho.addEventListener("click", function(evento) {
    evento.preventDefault();
    abrirCarrinho();
});

// Fecha carrinho
fecharCarrinho.addEventListener("click", function() {
    fecharPainelCarrinho();
});

// Fecha carrinho clicando fora
fundoCarrinho.addEventListener("click", function() {
    fecharPainelCarrinho();
});

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
fecharCheckout.addEventListener("click", function() {
    fecharCheckoutPagina();
});

// Fecha checkout clicando fora
checkoutFundo.addEventListener("click", function() {
    fecharCheckoutPagina();
});

// Confirma pedido
formCheckout.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nomeCliente = document.querySelector("#nome-cliente").value;
    const emailCliente = document.querySelector("#email-cliente").value;
    const telefoneCliente = document.querySelector("#telefone-cliente").value;

    const cepCliente = document.querySelector("#cep-cliente").value;
    const ruaCliente = document.querySelector("#rua-cliente").value;
    const numeroCliente = document.querySelector("#numero-cliente").value;
    const bairroCliente = document.querySelector("#bairro-cliente").value;
    const cidadeCliente = document.querySelector("#cidade-cliente").value;

    const formaPagamento = document.querySelector("#forma-pagamento").value;

    // Calcula total do pedido
    const totalPedido = carrinho.reduce(function(total, produto) {
        return total + (produto.preco * produto.quantidade);
    }, 0);

    // Cria o pedido
    const pedido = {
        cliente: {
            nome: nomeCliente,
            email: emailCliente,
            telefone: telefoneCliente
        },
        endereco: {
            cep: cepCliente,
            rua: ruaCliente,
            numero: numeroCliente,
            bairro: bairroCliente,
            cidade: cidadeCliente
        },
        produtos: carrinho,
        pagamento: formaPagamento,
        total: totalPedido,
        data: new Date().toLocaleString("pt-BR")
    };

    console.log("Pedido criado:");
    console.log(pedido);

    alert("Pedido criado com sucesso!");

    // Limpa checkout e carrinho
    formCheckout.reset();
    carrinho = [];

    salvarCarrinho();
    atualizarCarrinho();
    fecharCheckoutPagina();
});

// Abre painel do carrinho
function abrirCarrinho() {
    carrinhoLateral.classList.add("aberto");
    fundoCarrinho.classList.add("ativo");
}

// Fecha painel do carrinho
function fecharPainelCarrinho() {
    carrinhoLateral.classList.remove("aberto");
    fundoCarrinho.classList.remove("ativo");
}

// Fecha checkout
function fecharCheckoutPagina() {
    checkout.classList.remove("ativo");
    checkoutFundo.classList.remove("ativo");
}

// Salva carrinho
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// Atualiza carrinho
function atualizarCarrinho() {
    let quantidadeTotal = 0;

    carrinho.forEach(function(produto) {
        quantidadeTotal += produto.quantidade || 1;
    });

    quantidadeCarrinho.innerText = quantidadeTotal;

    // Carrinho vazio
    if (carrinho.length === 0) {
        itensCarrinho.innerHTML = "<p>Seu carrinho está vazio.</p>";
        totalCarrinho.innerText = "0,00";
        return;
    }

    itensCarrinho.innerHTML = "";

    let total = 0;

    // Mostra produtos
    carrinho.forEach(function(produto, indice) {
        if (!produto.quantidade) {
            produto.quantidade = 1;
        }

        const subtotal = produto.preco * produto.quantidade;
        total += subtotal;

        const item = document.createElement("div");
        item.classList.add("item-carrinho");

        item.innerHTML = `
            <div class="item-carrinho-conteudo">
                <img
                    src="${produto.imagem}"
                    alt="${produto.nome}"
                    class="item-carrinho-img"
                >

                <div class="item-carrinho-info">
                    <h4>${produto.nome}</h4>

                    <p>Tamanho: ${produto.tamanho}</p>

                    <p>
                        R$ ${produto.preco.toFixed(2).replace(".", ",")} cada
                    </p>

                    <div class="controle-quantidade-carrinho">
                        <button
                            class="btn-menos-carrinho"
                            data-indice="${indice}"
                        >
                            -
                        </button>

                        <span>${produto.quantidade}</span>

                        <button
                            class="btn-mais-carrinho"
                            data-indice="${indice}"
                        >
                            +
                        </button>
                    </div>

                    <p class="subtotal-item">
                        Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}
                    </p>

                    <button
                        class="btn-remover"
                        data-indice="${indice}"
                    >
                        Remover
                    </button>
                </div>
            </div>
        `;

        itensCarrinho.appendChild(item);
    });

    // Atualiza total
    totalCarrinho.innerText = total.toFixed(2).replace(".", ",");

    configurarBotoesCarrinho();
}

// Botões do carrinho
function configurarBotoesCarrinho() {
    const botoesMaisCarrinho =
        document.querySelectorAll(".btn-mais-carrinho");

    const botoesMenosCarrinho =
        document.querySelectorAll(".btn-menos-carrinho");

    const botoesRemover =
        document.querySelectorAll(".btn-remover");

    // Aumenta no carrinho
    botoesMaisCarrinho.forEach(function(botao) {
        botao.addEventListener("click", function() {
            const indice = Number(botao.dataset.indice);

            carrinho[indice].quantidade++;

            salvarCarrinho();
            atualizarCarrinho();
        });
    });

    // Diminui no carrinho
    botoesMenosCarrinho.forEach(function(botao) {
        botao.addEventListener("click", function() {
            const indice = Number(botao.dataset.indice);

            if (carrinho[indice].quantidade > 1) {
                carrinho[indice].quantidade--;
            }

            salvarCarrinho();
            atualizarCarrinho();
        });
    });

    // Remove do carrinho
    botoesRemover.forEach(function(botao) {
        botao.addEventListener("click", function() {
            const indice = Number(botao.dataset.indice);

            carrinho.splice(indice, 1);

            salvarCarrinho();
            atualizarCarrinho();
        });
    });
}