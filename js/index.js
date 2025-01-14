// Основной URL API
const API_URL = "http://lab8-api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";

// Сопоставление категорий
const CATEGORY_MAP = {
    "home & kitchen": "Товары для дома и кухни",
    "tv, audio & cameras": "Аксессуары для камеры",
    "beauty & health": "Диета и питание",
    "sports & fitness": "Спорт и фитнес",
};

// Функция для добавления товара в корзину
function addToCart(product) {
    // Получаем текущую корзину из localStorage или создаем пустой массив, если корзина пуста
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Проверяем, если товар уже есть в корзине
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        // Если товар уже есть в корзине, увеличиваем количество
        cart[existingProductIndex].quantity += 1;
    } else {
        // Если товара нет в корзине, добавляем его
        product.quantity = 1; // Добавляем количество
        cart.push(product);
    }

    // Сохраняем корзину обратно в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Показать уведомление
    showNotification('Товар добавлен в корзину!');
}

// Функция для отображения уведомлений
function showNotification(message) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.classList.add('alert', 'alert-success', 'alert-dismissible', 'fade', 'show');
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    notifications.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Загрузка всех товаров при старте страницы
function loadProducts(query = "", filters = {}, sort = "") {
    let url = `${API_URL}&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Ошибка загрузки данных!");
            return response.json();
        })
        .then(data => {
            const catalog = document.getElementById("catalog");
            catalog.innerHTML = "";

            if (data.length === 0) {
                catalog.innerHTML = "<p>Нет товаров, соответствующих вашему запросу.</p>";
                return;
            }

            let filteredData = data.filter(product => {
                const priceToCheck = product.discount_price !== null ? product.discount_price : product.actual_price;

                if (filters.price_from && priceToCheck < filters.price_from) return false;
                if (filters.price_to && priceToCheck > filters.price_to) return false;
                if (filters.discount && product.discount_price === null) return false;
                if (filters.categories && filters.categories.length > 0) {
                    const categoryMatched = filters.categories.includes(CATEGORY_MAP[product.main_category]);
                    if (!categoryMatched) return false;
                }

                return true;
            });

            if (sort) {
                filteredData.sort((a, b) => {
                    const priceA = a.discount_price !== null ? a.discount_price : a.actual_price;
                    const priceB = b.discount_price !== null ? b.discount_price : a.actual_price;

                    if (sort === "price_asc") return priceA - priceB;
                    if (sort === "price_desc") return priceB - priceA;
                    if (sort === "rating_desc") return b.rating - a.rating;
                });
            }

            if (filteredData.length === 0) {
                catalog.innerHTML = "<p>Нет товаров, соответствующих выбранным фильтрам.</p>";
                return;
            }

            filteredData.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("col-md-4");

                const discount = product.discount_price
                    ? ((product.actual_price - product.discount_price) / product.actual_price * 100).toFixed(0)
                    : null;

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

                productCard.innerHTML = `
                    <div class="card h-100">
                        <img src="${product.image_url}" class="card-img-top" alt="${product.name}">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">
                                ${discount ? `<span class="text-danger">-${discount}%</span><br>` : ""}
                                <span class="text-muted">${CATEGORY_MAP[product.main_category]}</span><br>
                                ${discount ? `<del>${product.actual_price}₽</del>` : ""}
                                <strong>${product.discount_price ? product.discount_price : product.actual_price}₽</strong>
                            </p>
                            <div class="mb-2">
                                ${ratingStars} <!-- Рейтинг в виде звезд -->
                                <span class="text-muted">(${product.rating.toFixed(1)})</span>
                            </div>
                            <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(product)})">Купить</button>
                        </div>
                    </div>
                `;

                catalog.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error("Ошибка при загрузке данных:", error);
            document.getElementById("catalog").innerHTML = "<p>Произошла ошибка при загрузке данных.</p>";
        });
}

// Загрузка всех товаров при старте страницы
loadProducts();

// Обработчик для поиска
document.getElementById("search-button").addEventListener("click", function () {
    const query = document.getElementById("search").value.trim();
    loadProducts(query); // Загружаем товары с учетом запроса
});

// Обработчик для фильтров
document.getElementById("filters").addEventListener("submit", function (e) {
    e.preventDefault(); // Предотвращаем перезагрузку страницы

    // Сбор данных из формы
    const formData = new FormData(this);
    const selectedCategories = Array.from(formData.getAll("category")); // Собираем выбранные категории

    const filters = {
        price_from: parseInt(formData.get("price_from")) || null, // Цена "от"
        price_to: parseInt(formData.get("price_to")) || null, // Цена "до"
        discount: formData.has("discount"), // Фильтр "Товары со скидкой"
        categories: selectedCategories, // Выбранные категории
    };

    console.log("Применяемые фильтры:", filters); // Для отладки

    // Загружаем товары с учетом фильтров
    const sort = document.getElementById("sort").value; // Получаем текущую сортировку
    loadProducts("", filters, sort);
});

// Обработчик для сортировки
document.getElementById("sort").addEventListener("change", function () {
    const sort = this.value; // Получаем выбранное значение сортировки
    const filters = {
        price_from: parseInt(document.getElementById("price-from").value) || null, // Цена "от"
        price_to: parseInt(document.getElementById("price-to").value) || null, // Цена "до"
        discount: document.querySelector("input[name='discount']").checked, // Фильтр "Товары со скидкой"
        categories: Array.from(
            document.querySelectorAll("input[name='category']:checked")
        ).map(el => el.value), // Собираем выбранные категории
    };

    console.log("Применяемая сортировка:", sort); // Для отладки
    loadProducts("", filters, sort); // Загружаем товары с сортировкой
});

// Основной URL для автодополнения
const AUTOCOMPLETE_URL = "http://lab8-api.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";

// Функция для обработки ввода текста
document.getElementById("search").addEventListener("input", function () {
    const input = this.value.trim();
    const words = input.split(" "); // Разделяем текст на слова
    const currentWord = words[words.length - 1]; // Берем последнее введенное слово

    // Если последнее слово пустое, скрываем список автодополнений
    if (!currentWord) {
        document.getElementById("autocomplete-list").innerHTML = "";
        return;
    }

    // Запрос к API автодополнения
    fetch(`${AUTOCOMPLETE_URL}&query=${encodeURIComponent(currentWord)}`)
        .then(response => {
            if (!response.ok) throw new Error("Ошибка загрузки автодополнений!");
            return response.json();
        })
        .then(suggestions => {
            const autocompleteList = document.getElementById("autocomplete-list");
            autocompleteList.innerHTML = ""; // Очищаем старые варианты

            // Если сервер вернул пустой массив
            if (suggestions.length === 0) {
                autocompleteList.innerHTML = "<div class='list-group-item'>Нет вариантов</div>";
                return;
            }

            // Создаем список вариантов автодополнения
            suggestions.forEach(suggestion => {
                const item = document.createElement("div");
                item.classList.add("list-group-item");
                item.textContent = suggestion;

                // При клике на вариант автодополнения
                item.addEventListener("click", function () {
                    words[words.length - 1] = suggestion; // Заменяем последнее слово
                    document.getElementById("search").value = words.join(" "); // Обновляем текст в поле ввода

                    // Очищаем список автодополнений
                    autocompleteList.innerHTML = "";
                });

                autocompleteList.appendChild(item);
            });
        })
        .catch(error => {
            console.error("Ошибка при загрузке автодополнений:", error);
        });
});

// Закрытие списка автодополнения при клике вне поля
document.addEventListener("click", function (event) {
    if (!event.target.closest("#autocomplete-list") && event.target.id !== "search") {
        document.getElementById("autocomplete-list").innerHTML = "";
    }
});

// Поиск товаров при клике на кнопку "Найти"
document.getElementById("search-button").addEventListener("click", function () {
    const query = document.getElementById("search").value.trim();
    const sort = document.getElementById("sort").value; // Учитываем выбранный порядок сортировки
    loadProducts(query, {}, sort); // Загружаем товары с учетом поиска
});

// Функция для обновления корзины на странице
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items'); // Контейнер для отображения товаров в корзине

    cartContainer.innerHTML = ''; // Очищаем контейнер

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Ваша корзина пуста.</p>';
    } else {
        let total = 0; // Общая стоимость товаров

        cart.forEach(product => {
            total += product.discount_price || product.actual_price;

            // Создаем карточку товара в корзине
            const productCard = document.createElement('div');
            productCard.classList.add('cart-item', 'd-flex', 'align-items-center', 'mb-3');

            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="cart-item-img" width="50">
                <div class="cart-item-details ms-3">
                    <h5 class="cart-item-title">${product.name}</h5>
                    <p>${product.discount_price ? `<del>${product.actual_price}₽</del>` : ''} <strong>${product.discount_price || product.actual_price}₽</strong></p>
                    <div class="d-flex align-items-center">
                        <span class="me-2">Рейтинг: ${product.rating}</span>
                        <span class="badge bg-warning">${product.discount ? `-${product.discount}%` : ''}</span>
                    </div>
                </div>
                <button class="btn btn-danger ms-auto" onclick="removeFromCart(${product.id})">Удалить</button>
            `;

            cartContainer.appendChild(productCard);
        });

        // Обновляем общую сумму
        const cartTotal = document.getElementById('cart-total');
        cartTotal.textContent = `Общая сумма: ${total}₽`;
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


