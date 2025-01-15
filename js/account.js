const API_URL = "http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";
const GOODS_API_URL = "http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371";

// Кэш для товаров
let goodsCache = {};

// Загрузка товаров для отображения названий
async function loadGoods() {
    try {
        const response = await fetch(GOODS_API_URL);
        if (!response.ok) throw new Error(`Ошибка: ${response.statusText}`);
        const goods = await response.json();
        goods.forEach((good) => {
            goodsCache[good.id] = good; // Сохраняем товар в кэш
        });
    } catch (error) {
        showNotification("Ошибка загрузки товаров", "danger");
    }
}

// Загрузка заказов
async function loadOrders() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Ошибка: ${response.statusText}`);
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        showNotification("Ошибка загрузки заказов", "danger");
    }
}

// Рендер заказов в таблице
function renderOrders(orders) {
    const ordersTable = document.getElementById("orders-table");
    ordersTable.innerHTML = ""; // Очищаем таблицу перед добавлением новых строк

    // Добавляем заголовки таблицы
    const headers = `
        <thead>
            <tr>
                <th>#</th>
                <th>Дата создания</th>
                <th>Товары</th>
                <th>Стоимость</th> <!-- Новый столбец -->
                <th>Адрес доставки</th>
                <th>Дата и время доставки</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    ordersTable.innerHTML = headers;

    const tbody = ordersTable.querySelector("tbody");

    orders.forEach((order, index) => {
        // Расчет стоимости заказа
        const totalPrice = calculateTotalPrice(order.good_ids);

        const row = document.createElement("tr");

        // Формируем строку таблицы
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(order.created_at).toLocaleString()}</td>
            <td>${renderGoods(order.good_ids)}</td>
            <td>${totalPrice} ₽</td> <!-- Отображаем стоимость -->
            <td>${order.delivery_address}</td>
            <td>${order.delivery_date} (${order.delivery_interval})</td>
            <td class="actions">
                <button  onclick="viewOrder(${order.id})">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="edit-order" data-id="${order.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button  onclick="confirmDeleteOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll(".edit-order").forEach(button => {
        button.addEventListener("click", async function () {
            const orderId = this.getAttribute("data-id");
            await openEditOrderModal(orderId);  // Открытие модального окна редактирования
        });
    });
}

// Функция для расчета общей стоимости заказа
function calculateTotalPrice(goodIds) {
    let totalPrice = 0;

    goodIds.forEach(id => {
        const good = goodsCache[id];
        if (good) {
            // Проверяем, если есть скидочная цена, то берем ее, иначе обычную цену
            const price = good.discount_price !== null ? good.discount_price : good.actual_price;
            totalPrice += price; // Прибавляем цену товара (с учетом скидки или без)
        }
    });

    return totalPrice;
}

// Отображение товаров по их ID
function renderGoods(goodIds) {
    if (!goodIds || goodIds.length === 0) return "—";
    return goodIds
        .map((id) => goodsCache[id] ? goodsCache[id].name : `Товар ${id}`)
        .join(", ");
}

// Просмотр заказа
async function viewOrder(orderId) {
    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371`);
        if (!response.ok) throw new Error(`Ошибка: ${response.statusText}`);
        
        const order = await response.json();

        // Расчет стоимости заказа
        const totalPrice = calculateTotalPrice(order.good_ids);

        // Формируем данные для отображения в два столбца
        const details = `
            <div class="row mb-2">
                <div class="col-4"><strong>Имя:</strong></div>
                <div class="col-8">${order.full_name}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Email:</strong></div>
                <div class="col-8">${order.email}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Телефон:</strong></div>
                <div class="col-8">${order.phone}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Адрес доставки:</strong></div>
                <div class="col-8">${order.delivery_address}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Дата доставки:</strong></div>
                <div class="col-8">${order.delivery_date}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Временной интервал:</strong></div>
                <div class="col-8">${order.delivery_interval}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Товары:</strong></div>
                <div class="col-8">${renderGoods(order.good_ids)}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Стоимость:</strong></div>
                <div class="col-8">${totalPrice} ₽</div> <!-- Добавлена стоимость заказа -->
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Комментарий:</strong></div>
                <div class="col-8">${order.comment || "—"}</div>
            </div>
            <div class="row mb-2">
                <div class="col-4"><strong>Дата создания заказа:</strong></div>
                <div class="col-8">${new Date(order.created_at).toLocaleString()}</div>
            </div>
        `;

        // Вставляем данные в модальное окно
        document.getElementById("view-order-details").innerHTML = details;

        // Открываем модальное окно
        new bootstrap.Modal(document.getElementById("viewModal")).show();
    } catch (error) {
        console.error(error);
        showNotification("Ошибка загрузки данных заказа", "danger");
    }
}



async function openEditOrderModal(orderId) {
    try {
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371`);
        if (!response.ok) throw new Error("Ошибка при получении данных заказа");

        const orderData = await response.json();

        // Заполняем форму редактирования данными заказа
        document.getElementById("edit-order-id").value = orderData.id;
        document.getElementById("edit-name").value = orderData.full_name;
        document.getElementById("edit-email").value = orderData.email;
        document.getElementById("edit-phone").value = orderData.phone;
        document.getElementById("edit-address").value = orderData.delivery_address;
        document.getElementById("edit-delivery-date").value = orderData.delivery_date;
        document.getElementById("edit-delivery-time").value = orderData.delivery_interval;
        document.getElementById("edit-comments").value = orderData.comment;

        // Открываем модальное окно редактирования
        const editModal = new bootstrap.Modal(document.getElementById("editModal"));
        editModal.show();
    } catch (error) {
        console.error(error);
        showNotification("Ошибка при загрузке заказа", "danger");
    }
}

// Обновление заказа
async function updateOrder() {
    const orderId = document.getElementById("edit-order-id").value;
    const updatedOrder = {
        full_name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        phone: document.getElementById("edit-phone").value,
        delivery_address: document.getElementById("edit-address").value,
        delivery_date: document.getElementById("edit-delivery-date").value,
        delivery_interval: document.getElementById("edit-delivery-time").value,
        comment: document.getElementById("edit-comments").value,
    };

    try {
        const response = await fetch(
            `http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedOrder),
            }
        );

        if (!response.ok) {
            throw new Error(`Ошибка обновления: ${response.statusText}`);
        }

        showNotification("Заказ успешно обновлен", "success");

        // Закрыть модальное окно
        const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        editModal.hide();

        // Обновить данные на странице
        await loadOrders();
    } catch (error) {
        console.error(error);
        showNotification("Не удалось обновить заказ", "danger");
    }
}

// Привязка формы редактирования к обработчику
document.getElementById("edit-order-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Отключаем стандартное поведение отправки формы
    await updateOrder(); // Вызываем функцию обновления заказа
});

// Подтверждение удаления
function confirmDeleteOrder(orderId) {
    orderToDelete = orderId;
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    confirmDeleteModal.show();
}

// Удаление заказа
document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
    if (orderToDelete !== null) {
        try {
            const response = await fetch(
                `http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderToDelete}?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(`Ошибка удаления: ${response.statusText}`);
            }

            showNotification("Заказ успешно удален", "success");
            orderToDelete = null;
            await loadOrders();
            const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
            confirmDeleteModal.hide();
        } catch (error) {
            console.error(error);
            showNotification("Не удалось удалить заказ", "danger");
        }
    }
});

// Уведомления
function showNotification(message, type = "info") {
    const notifications = document.getElementById("notifications");
    notifications.style.display = "block";
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} mt-2`;
    notification.textContent = message;
    notifications.appendChild(notification);
    setTimeout(() => {
        notification.remove();
        if (!notifications.firstChild) notifications.style.display = "none";
    }, 5000);
}

// Загрузка данных при старте
async function initialize() {
    await loadGoods(); // Сначала загружаем товары
    await loadOrders(); // Затем загружаем заказы
}

// Инициализация
initialize();


