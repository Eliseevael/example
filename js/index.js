// Основной URL API
const API_URL = "http://lab8-api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";

// Сопоставление категорий
const CATEGORY_MAP = {
    "home & kitchen": "Товары для дома и кухни",
    "tv, audio & cameras": "Аксессуары для камеры",
    "beauty & health": "Диета и питание",
    "sports & fitness": "Спорт и фитнес",
};

// Функция для загрузки товаров
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
                            <a href="#" class="btn btn-primary">Купить</a>
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
