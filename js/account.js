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
            goodsCache[good.id] = good.name;
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
    orders.forEach((order, index) => {
        const row = document.createElement("tr");

        // Формируем строку таблицы
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(order.created_at).toLocaleString()}</td>
            <td>${renderGoods(order.good_ids)}</td>
            <td>${order.delivery_address}</td>
            <td>${order.delivery_date} (${order.delivery_interval})</td>
            <td>
                <button class="btn btn-info btn-sm me-2" onclick="viewOrder(${order.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-warning btn-sm me-2" onclick="editOrder(${order.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        ordersTable.appendChild(row);
    });
}

// Отображение товаров по их ID
function renderGoods(goodIds) {
    if (!goodIds || goodIds.length === 0) return "—";
    return goodIds
        .map((id) => goodsCache[id] || `Товар ${id}`)
        .join(", ");
}

// Просмотр заказа
async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_URL}/${orderId}?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371`);
        if (!response.ok) throw new Error(`Ошибка: ${response.statusText}`);
        const order = await response.json();
        const details = `
            <p>Имя: ${order.full_name}</p>
            <p>Email: ${order.email}</p>
            <p>Телефон: ${order.phone}</p>
            <p>Адрес: ${order.delivery_address}</p>
            <p>Товары: ${renderGoods(order.good_ids)}</p>
            <p>Комментарий: ${order.comment || "—"}</p>
            <p>Дата заказа: ${new Date(order.created_at).toLocaleString()}</p>
        `;
        document.getElementById("view-order-details").innerHTML = details;
        new bootstrap.Modal(document.getElementById("viewModal")).show();
    } catch (error) {
        showNotification("Ошибка загрузки данных заказа", "danger");
    }
}

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

