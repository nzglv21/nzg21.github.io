document.addEventListener("DOMContentLoaded", () => {
    // Инициализация карты OpenStreetMap
    const map = L.map('map').setView([55.751244, 37.618423], 13); // начальная позиция (Москва)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Переменная для хранения флага, который отслеживает, какое поле активно
    let activeField = 'from'; // по умолчанию активен "Откуда"

    // Инициализация метки начальной точки (поле "Откуда")
    let fromMarker = L.marker([55.751244, 37.618423], { draggable: true }).addTo(map); // начальная метка в Москве


    // Инициализация метки конечной точки (поле "Куда")
    let toMarker = null; // начальная метка для "Куда" еще не существует

    // Функция для изменения метки и перемещения карты
    function updateFromMarker(lat, lon) {
        fromMarker.setLatLng([lat, lon]);  // обновляем позицию метки "Откуда"
        document.getElementById('from').value = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
    }

    // Функция для добавления или обновления метки конечного пункта (для "Куда")
    function updateToMarker(lat, lon) {
        if (toMarker) {
            toMarker.setLatLng([lat, lon]); // если метка уже существует, просто обновляем
        } else {
            toMarker = L.marker([lat, lon]).addTo(map); // если нет, создаем новую
        }
        document.getElementById('to').value = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
    }

    // Получаем координаты пользователя с использованием Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Обновляем метку, поле "Откуда" и карту
                updateFromMarker(lat, lon);
                map.setView([lat, lon], 13); // Перемещаем карту в центр координат пользователя
            },
            (error) => {
                alert("Ошибка получения координат: " + error.message);
                // Если не удалось получить координаты, ставим метку по умолчанию (Москва)
                updateFromMarker(55.751244, 37.618423);
            }
        );
    } else {
        alert("Геолокация не поддерживается этим браузером.");
        // Если геолокация не поддерживается, ставим метку по умолчанию (Москва)
        updateFromMarker(55.751244, 37.618423);
    }

    // Функция для активации поля
    function activateField(field) {
        document.getElementById('from').classList.remove('active-field');
        document.getElementById('to').classList.remove('active-field');
        document.getElementById(field).classList.add('active-field');
    }

    // При фокусе на поле "Откуда" или "Куда" меняем флаг и активируем нужное поле
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const formContainer = document.getElementById('form-container');

    fromInput.addEventListener('focus', () => {
        activeField = 'from';
        activateField('from');
        formContainer.classList.add('active');  // Поднимаем контейнер
        const center = fromMarker.getLatLng(); // Получаем координаты метки "Откуда"
        map.setView([center.lat, center.lng], 13); // Перемещаем карту к метке "Откуда"
    });

    toInput.addEventListener('focus', () => {
        activeField = 'to';
        activateField('to');
        formContainer.classList.add('active');  // Поднимаем контейнер
        const center = toMarker ? toMarker.getLatLng() : fromMarker.getLatLng(); // Если метка "Куда" есть, используем ее, иначе - метку "Откуда"
        map.setView([center.lat, center.lng], 13); // Перемещаем карту к метке "Куда" (или "Откуда" если метки нет)
    });

    // При перемещении карты обновляем метку
    map.on('move', () => {
        const center = map.getCenter();
        if (activeField === 'from') {
            updateFromMarker(center.lat, center.lng); // Обновляем метку "Откуда"
        } else if (activeField === 'to') {
            updateToMarker(center.lat, center.lng); // Обновляем метку "Куда"
        }
    });

    // Обработчики кнопок "Карта"
    document.getElementById('map-btn-from').addEventListener('click', () => {
        activeField = 'from'; // Устанавливаем флаг на "Откуда"
        map.setView(fromMarker.getLatLng(), 13); // Перемещаем карту к метке "Откуда"
        formContainer.classList.remove('active'); // Скрываем форму
    });

    document.getElementById('map-btn-to').addEventListener('click', () => {
        activeField = 'to'; // Устанавливаем флаг на "Куда"
        if (toMarker) {
            map.setView(toMarker.getLatLng()); // Перемещаем карту к метке "Куда"
        } else {
            const fromCoords = fromMarker.getLatLng();
            map.setView([fromCoords.lat+0.001, fromCoords.lng+0.001]); // Если метка "Куда" ещё не создана, перемещаем карту к "Откуда"
        }
        formContainer.classList.remove('active'); // Скрываем форму
    });

    // Обработка отправки формы
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', () => {
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        alert(`Заказ оформлен: \nОткуда: ${from}\nКуда: ${to}`);
        formContainer.classList.remove('active');
    });
});
