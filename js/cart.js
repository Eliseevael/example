// Функция для отображения товаров в корзине
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items'); // Контейнер для отображения товаров в корзине

    cartContainer.innerHTML = ''; // Очищаем контейнер

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
    } else {
        cart.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('col-md-4');

            // Генерация карточки товара
            productCard.innerHTML = `
                <div class="card h-100">
                    <img src="${product.image_url}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">
                            <strong>${product.discount_price || product.actual_price}₽</strong><br>
                            Рейтинг: ${product.rating}
                        </p>
                        <button class="btn btn-danger" onclick="removeFromCart(${product.id})">Удалить</button>
                    </div>
                </div>
            `;

            cartContainer.appendChild(productCard);
        });
    }
}

// Функция для удаления товара из корзины
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Удаляем товар по ID
    cart = cart.filter(product => product.id !== productId);

    // Сохраняем обновленную корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCart(); // Обновляем отображение корзины
}

// Обновляем корзину при загрузке страницы
updateCart();



