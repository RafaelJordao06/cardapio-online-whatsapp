const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];

//Abrir modal do carrinho
cartBtn.addEventListener("click", function () {
    updateCartModel();
    cartModal.style.display = "flex";
});

//Fechar o modal do carrinho
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".add-to-cart-btn");
    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        //add carinho
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;

    } else {

        cart.push({
            name,
            price,
            quantity: 1,
        });
    }

    updateCartModel();
}

//Atualiza o carrinho
function updateCartModel() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div")

        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Quantidade: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    <i class="fa-solid fa-trash text-2xl text-red-600"></i>
                </button>
            </div>
        `
        total += item.price * item.quantity
        cartItemsContainer.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })

    cartCounter.innerHTML = cart.length
}


// Função para remover item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
    // Verifica se o botão ou algum de seus filhos foi clicado
    let targetElement = event.target;

    // Procura pelo elemento com a classe "remove-from-cart-btn" subindo na árvore do DOM
    while (targetElement && !targetElement.classList.contains("remove-from-cart-btn")) {
        targetElement = targetElement.parentElement;
    }

    if (targetElement) {
        const name = targetElement.getAttribute("data-name");
        removeItemCart(name);
    }
});


function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index]

        if (item.quantity > 1) {
            item.quantity -= 1;
            updateCartModel();
            return;
        }

        cart.splice(index, 1)
        updateCartModel();
    }
}

addressInput.addEventListener("input", function (event) {
    let inputValue = event.target.value

    if (inputValue !== "") {
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

//Finalizar Pedido
checkoutBtn.addEventListener("click", function () {

    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops! O restaurante está fechado!",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast()
        return;
    }

    if (cart.length === 0) return;
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return
    }

    // Enviar pedido para o WhatsApp Web
    const cartItems = cart.map((item) => {
        return (
            `${item.quantity}x | ${item.name} | Preço: R$${item.price}`
        );
    }).join("\n");

    const message = encodeURIComponent(`Gostaria de estar fazendo um pedido\n\n${cartItems}\n\nEndereço: ${addressInput.value}`);
    const phone = "12996135323";

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    cart = [];
    updateCartModel();
})

//Verificar a hora e manupular o card horario
function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 18 && hora < 22
}

const spanItem = document.getElementById("date-span")
const idOpen = checkRestaurantOpen();

if (idOpen) {
    spanItem.classList.remove("bg-red-500")
    spanItem.classList.add("bg-green-600")
} else {
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-500")
}