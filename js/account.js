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
                <button class="btn btn-warning btn-sm me-2 edit-order" data-id="${order.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        ordersTable.appendChild(row);
    });

    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll(".edit-order").forEach(button => {
        button.addEventListener("click", async function () {
            const orderId = this.getAttribute("data-id");
            await openEditOrderModal(orderId);  // Открытие модального окна редактирования
        });
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
        const response = await fetch(`http://api.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=28d90ad7-799e-4507-bc4a-dec5813b2371`);
        if (!response.ok) throw new Error(`Ошибка: ${response.statusText}`);
        
        const order = await response.json();
        
        // Формируем данные для отображения
        const details = `
            <p><strong>Имя:</strong> ${order.full_name}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Телефон:</strong> ${order.phone}</p>
            <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
            <p><strong>Дата доставки:</strong> ${order.delivery_date}</p>
            <p><strong>Временной интервал:</strong> ${order.delivery_interval}</p>
            <p><strong>Товары:</strong> ${renderGoods(order.good_ids)}</p>
            <p><strong>Комментарий:</strong> ${order.comment || "—"}</p>
            <p><strong>Дата создания заказа:</strong> ${new Date(order.created_at).toLocaleString()}</p>
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

// Открытие модального окна редактирования
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


