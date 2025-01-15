// Функция для загрузки корзины
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

        const cartItem = document.createElement("div");
        cartItem.classList.add("col-md-4");

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

// Функция для удаления товара из корзины
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Удаляем товар по индексу
    localStorage.setItem("cart", JSON.stringify(cart)); // Сохраняем изменения
    loadCart(); // Перезагружаем корзину
}

// Функция для получения списка товаров в корзине (только ID)
function getCartProductIds() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.map(product => product.id); // Возвращаем массив ID товаров
}

// Функция для отправки заказа на API
document.getElementById("order-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Отменяем стандартную отправку формы

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
        alert("Корзина пуста. Добавьте товары в корзину.");
        return;
    }

    function formatDateToDDMMYYYY(dateString) {
        if (!dateString) {
          return null; // Или можно вернуть пустую строку "", или любой другой дефолт.
        }
        // Проверяем, является ли dateString строкой, или это обьект даты
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
        
      }

    // Подготовка данных для отправки
    const orderData = {
        comment: document.getElementById("comments").value, // Комментарий
        created_at: new Date().toISOString(), // Время создания заказа
        delivery_address: document.getElementById("address").value, // Адрес доставки
        delivery_date: formatDateToDDMMYYYY(document.getElementById("delivery-date").value), // Дата доставки
        
        delivery_interval: String(document.getElementById("time-slot").value), // Время доставки
        email: document.getElementById("email").value, // Email
        full_name: document.getElementById("name").value, // ФИО
        good_ids: getCartProductIds(), // Список товаров в корзине
        //id: 15, // Пример: ID заказа
        phone: document.getElementById("phone").value, // Телефон
        student_id: 10700, // Пример: Студенческий ID
        subscribe: document.getElementById("newsletter").checked, // Подписка на новости
        updated_at: new Date().toISOString(), // Время последнего обновления заказа
    };
    
    const apiUrl = "http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";

    try {
        // Отправляем запрос на сервер
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        // Обрабатываем возможные ошибки
        if (!response.ok) {
            const errorText = await response.text(); // Считываем текст ошибки от сервера
            throw new Error(`Ошибка сервера: ${response.status}. Ответ: ${errorText}`);
        }

        // Получаем результат ответа
        const result = await response.json();
        console.log("Ответ сервера:", result);

        alert("Ваш заказ успешно оформлен!");
        localStorage.removeItem("cart"); // Очищаем корзину
        loadCart(); // Перезагружаем корзину
    } catch (error) {
        console.error("Ошибка при отправке данных:", error);
        alert(`Ошибка при оформлении заказа: ${error.message}`);
    }
});


// Загрузка корзины при старте страницы
loadCart();