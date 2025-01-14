// Функция для загрузки товаров из корзины
function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    cartItemsContainer.innerHTML = ""; // Очищаем контейнер
    let totalPrice = 0;

    cart.forEach((product, index) => {
        const productPrice = product.discount_price || product.actual_price;
        totalPrice += productPrice * product.quantity;

        const cartItem = document.createElement("div");
        cartItem.classList.add("col-md-12", "d-flex", "align-items-center", "border", "mb-2", "p-2");
        cartItem.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="img-thumbnail" style="width: 100px; height: 100px;">
            <div class="ms-3">
                <h5>${product.name}</h5>
                <p>Цена: ${productPrice}₽</p>
                <p>Количество: ${product.quantity}</p>
            </div>
            <button class="btn btn-danger ms-auto" data-index="${index}">Удалить</button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    // Обновляем общую сумму
    totalPriceElement.textContent = totalPrice;

    // Обработчик для кнопок "Удалить"
    document.querySelectorAll(".btn-danger").forEach(button => {
        button.addEventListener("click", function () {
            const productIndex = this.getAttribute("data-index");
            removeFromCart(productIndex);
        });
    });
}

// Функция для удаления товара из корзины
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Удаляем товар по индексу
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем изменения
    loadCart(); // Перезагружаем корзину
}

// Загрузка корзины при старте страницы
loadCart();



