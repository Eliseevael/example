// Элементы DOM
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-btn");
const autocompleteList = document.getElementById("autocomplete-list");
const catalogContainer = document.getElementById("catalog");

// API URL
const apiUrl = "http://lab8-api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";

// Функция для загрузки товаров с API
async function fetchProducts(query = '') {
    const response = await fetch(`${apiUrl}&query=${query}`);
    const data = await response.json();
    return data;
}

// Функция для рендера карточек товаров
function renderProducts(products) {
    catalogContainer.innerHTML = ""; // Очистка контейнера
    if (products.length === 0) {
        catalogContainer.innerHTML = "<p>Нет товаров, соответствующих вашему запросу.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "col-md-4 card";
        card.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">Рейтинг: ${product.rating}</p>
                <p class="card-text">
                    Цена: 
                    <span class="${product.discount_price ? "line-through" : ""}">
                        ${product.actual_price} ₽
                    </span>
                    ${product.discount_price ? `<span class="text-danger"> ${product.discount_price} ₽</span>` : ""}
                </p>
                ${product.discount_price ? `<p class="card-text">Скидка: ${Math.round(((product.actual_price - product.discount_price) / product.actual_price) * 100)}%</p>` : ""}
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Добавить в корзину</button>
            </div>
        `;
        catalogContainer.appendChild(card);
    });
}

// Функция для поиска товаров с автодополнением
async function fetchAutocomplete(query) {
    if (query.length < 3) { // Отображаем автодополнение только при 3 и более символах
        autocompleteList.innerHTML = '';
        return;
    }

    const products = await fetchProducts(query);
    
    autocompleteList.innerHTML = '';
    
    if (products.length === 0) return;

    products.forEach(product => {
        const listItem = document.createElement("div");
        listItem.classList.add("list-group-item");
        listItem.textContent = product.name;
        listItem.onclick = () => {
            searchInput.value = product.name;  // Заполняем поле ввода выбранным товаром
            autocompleteList.innerHTML = '';  // Скрываем список автодополнения
        };
        autocompleteList.appendChild(listItem);
    });
}

// Обработчик для автодополнения
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    fetchAutocomplete(query);
});

// Функция для отправки запроса на сервер по нажатию кнопки "Найти"
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        alert("Введите запрос для поиска.");
        return;
    }

    const products = await fetchProducts(query);

    if (products.length === 0) {
        catalogContainer.innerHTML = "<p>Нет товаров, соответствующих вашему запросу.</p>";
        return;
    }

    // Отображаем товары
    renderProducts(products);
}

// Обработчик для кнопки поиска
searchButton.addEventListener("click", performSearch);

// Функция для добавления в корзину
function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    showNotification("Товар добавлен в корзину", "success");
}

// Уведомления
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    document.getElementById("notifications").appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
}

// Инициализация страницы с загрузкой всех товаров
(async function() {
    const products = await fetchProducts();
    renderProducts(products);
})();


