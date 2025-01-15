function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    cartItemsContainer.innerHTML = ""; // Очищаем контейнер
    totalPriceElement.textContent = "0₽"; // Обнуляем общую цену

    if (cart.length === 0) {
        document.getElementById("cart-items").innerHTML = ""; // Очищаем товары
        document.getElementById("empty-cart-message").style.display = "block"; // Показываем сообщение
        document.getElementById("order-form-container").style.display = "none"; // Прячем форму
        return; // Выход из функции
    }

    let totalPrice = 0;

    // Установка сетки
    cartItemsContainer.classList.add("row", "g-3"); // Добавляем классы Bootstrap для сетки

    cart.forEach((product, index) => {
        if (!product.name || (!product.actual_price && !product.discount_price)) {
            console.error("Некорректные данные товара в корзине:", product);
            return;
        }

        const productPrice = product.discount_price || product.actual_price;
        const discountPercentage = product.discount_price
            ? ((product.actual_price - product.discount_price) / product.actual_price * 100).toFixed(0)
            : null;

        totalPrice += productPrice * product.quantity;

        // Генерация звезд для рейтинга
        const ratingStars = Array(5)
            .fill()
            .map((_, index) => {
                if (index < Math.floor(product.rating)) {
                    return '<i class="fas fa-star text-warning"></i>'; // Закрашенная звезда
                } else if (index < product.rating) {
                    return '<i class="fas fa-star-half-alt text-warning"></i>'; // Половина звезды
                } else {
                    return '<i class="far fa-star text-muted"></i>'; // Пустая звезда
                }
            })
            .join("");


        const cartItem = document.createElement("div");
        cartItem.classList.add("col-md-4"); // Колонка занимает 4 из 12 (3 карточки в строку на больших экранах)

        cartItem.innerHTML = `
            <div class="card h-100">
                <div class="card-img-container">
                    <img src="${product.image_url}" alt="${product.name}" class="card-img-top">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="mb-1">
                        <strong>${productPrice}₽</strong>
                        ${discountPercentage ? `<span class="text-danger ms-2">-${discountPercentage}%</span>` : ""}
                    </p>
                    <div class="mb-2">
                        ${ratingStars}
                        <span class="text-muted">(${product.rating.toFixed(1)})</span>
                    </div>
                    <p>Количество: ${product.quantity}</p>
                    <button class="btn btn-danger w-100" data-index="${index}">Удалить</button>
                </div>
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    // Обновляем общую сумму
    totalPriceElement.textContent = `${totalPrice}₽`;

    // Обработчик для кнопок "Удалить"
    document.querySelectorAll(".btn-danger").forEach(button => {
        button.addEventListener("click", function () {
            const productIndex = this.getAttribute("data-index");
            removeFromCart(productIndex);
        });
    });
}

// Функция для показа формы оформления заказа
document.getElementById("checkout-button").addEventListener("click", function () {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const orderFormContainer = document.getElementById("order-form-container");

    if (cart.length === 0) {
        alert("Корзина пуста. Добавьте товары в корзину перед оформлением заказа.");
    } else {
        orderFormContainer.style.display = "block"; // Показываем форму
    }
});

// Функция для удаления товара из корзины
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Удаляем товар по индексу
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем изменения
    loadCart(); // Перезагружаем корзину
}

// Загрузка корзины при старте страницы
loadCart();



