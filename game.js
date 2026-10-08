let coins = 0;
let energy = 100;

let carLevel = 1;
let tapPower = 1;
let upgradeCost = 100;

let selectedCar = "car1";
// =========================
// AFK / ОФЛАЙН-ЗАРАБОТОК
// =========================

let lastOnlineTime = Date.now();

const AFK_MAX_SECONDS = 8 * 60 * 60; // максимум 8 часов
const AFK_BASE_PER_MINUTE = 15;        // базовый доход в минуту
const MAX_ENERGY = 100;


function calculateOfflineProgress() {

    const now = Date.now();

    let elapsedSeconds =
        Math.floor((now - lastOnlineTime) / 1000);

    elapsedSeconds =
        Math.max(0, elapsedSeconds);

    elapsedSeconds =
        Math.min(
            elapsedSeconds,
            AFK_MAX_SECONDS
        );

    const car = cars[selectedCar];

    if (!car) {
        return {
            seconds: elapsedSeconds,
            coins: 0,
            energy: 0
        };
    }

    const minutes =
        elapsedSeconds / 60;

    const offlineCoins =
        Math.floor(
            minutes *
            AFK_BASE_PER_MINUTE *
            car.multiplier
        );

    const energyRecovered =
        Math.min(
            MAX_ENERGY - energy,
            elapsedSeconds
        );

    return {
        seconds: elapsedSeconds,
        coins: offlineCoins,
        energy: energyRecovered
    };
}


function applyOfflineProgress() {

    const progress =
        calculateOfflineProgress();

    if (progress.seconds <= 0) {
        lastOnlineTime = Date.now();
        return progress;
    }

    coins += progress.coins;

    energy =
        Math.min(
            MAX_ENERGY,
            energy + progress.energy
        );

    lastOnlineTime = Date.now();

    return progress;
}
// =========================
// УВЕДОМЛЕНИЕ ОБ AFK-ДОХОДЕ
// =========================

function formatOfflineTime(seconds) {

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    if (hours > 0) {

        return (
            hours +
            " ч " +
            minutes +
            " мин"
        );

    }

    if (minutes > 0) {

        return (
            minutes +
            " мин"
        );

    }

    return (
        seconds +
        " сек"
    );
}


function showOfflineProgress(progress) {

    if (
        !progress ||
        progress.seconds <= 0
    ) {
        return;
    }

    // Не показываем окно,
    // если вообще ничего не заработано
    if (
        progress.coins <= 0
    ) {
        return;
    }


    const oldNotice =
        document.getElementById(
            "offlineIncomeNotice"
        );

    if (oldNotice) {
        oldNotice.remove();
    }


    const notice =
        document.createElement("div");

    notice.id =
        "offlineIncomeNotice";


    notice.innerHTML =
        `
        <div class="offline-title">
            💰 Пока тебя не было
        </div>

        <div class="offline-time">
            AFK-доход копился:
            <b>${formatOfflineTime(progress.seconds)}</b>
        </div>

        <div class="offline-coins">
            +${progress.coins.toLocaleString("ru-RU")} 🪙
        </div>
        `;


    document.body.appendChild(
        notice
    );


    setTimeout(
        function () {

            notice.classList.add(
                "show"
            );

        },
        20
    );


    setTimeout(
        function () {

            notice.classList.remove(
                "show"
            );

            setTimeout(
                function () {

                    notice.remove();

                },
                300
            );

        },
        5000
    );
}

const offlineIncomeStyle =
    document.createElement("style");

offlineIncomeStyle.textContent = `

#offlineIncomeNotice {

    position: fixed;

    top: 20px;
    left: 50%;

    transform:
        translate(-50%, -20px);

    z-index: 99999;

    width: min(
        340px,
        calc(100vw - 30px)
    );

    padding: 16px 18px;

    background: rgba(
        255,
        255,
        255,
        0.97
    );

    color: #111;

    border-radius: 16px;

    box-shadow:
        0 10px 35px
        rgba(0, 0, 0, 0.35);

    text-align: center;

    opacity: 0;

    pointer-events: none;

    transition:
        opacity 0.3s ease,
        transform 0.3s ease;

    font-family:
        Arial,
        sans-serif;
}


#offlineIncomeNotice.show {

    opacity: 1;

    transform:
        translate(-50%, 0);

}


#offlineIncomeNotice
.offline-title {

    font-size: 17px;

    font-weight: 800;

    margin-bottom: 7px;

}


#offlineIncomeNotice
.offline-time {

    font-size: 13px;

    color: #555;

    margin-bottom: 8px;

}


#offlineIncomeNotice
.offline-coins {

    font-size: 21px;

    font-weight: 900;

}

`;

document.head.appendChild(
    offlineIncomeStyle
);



// =========================
// ЗАДАНИЯ И ЕЖЕДНЕВНАЯ НАГРАДА
// =========================

let tasksDate = "";
let taskTaps = 0;
let taskCoinsEarned = 0;
let taskUpgrades = 0;
let taskRaces = 0;
let taskWins = 0;
let taskTurbo = 0;

let dailyTasks = [];

let claimedTasks = {
    tap: false,
    coins: false,
    upgrade: false
};

// Ежедневная награда
let dailyRewardDay = 0;
let dailyRewardLastDate = "";

const dailyRewards = [
    500,
    750,
    1000,
    1500,
    2000,
    3000,
    5000
];


// =========================
// МАШИНЫ
// =========================

const cars = {

    car1: {
        name: "Lada 2109",
        image: "images/Lada_2109.png",
        price: 0,
        speed: 50,
        acceleration: 50,
        multiplier: 1,
        unlocked: true
    },

    car2: {
        name: "Ford Focus",
        image: "images/Ford_Focus.png",
        price: 5000,
        speed: 65,
        acceleration: 60,
        multiplier: 1.2,
        unlocked: false
    },

    car3: {
        name: "Ford Fiesta",
        image: "images/Ford_Fiesta.png",
        price: 15000,
        speed: 75,
        acceleration: 70,
        multiplier: 1.4,
        unlocked: false
    },

    car4: {
        name: "Ford Mondeo",
        image: "images/Ford_Mondeo.png",
        price: 30000,
        speed: 70,
        acceleration: 80,
        multiplier: 1.5,
        unlocked: false
    },

    
      car5: {
        name: "Mini Cooper",
        image: "images/Mini_Cooper.png",
        price: 50000,
        speed: 90,
        acceleration: 90,
        multiplier: 1.75,
        unlocked: false
    },

    car6: {
        name: "Subaru Legacy",
        image: "images/Subaru_Legacy.png",
        price: 75000,
        speed: 100,
        acceleration: 100,
        multiplier: 2.0,
        unlocked: false
    }



};


// =========================
// СОСТОЯНИЕ МАШИН
// =========================

let unlockedCars = {
    car1: true,
    car2: false,
    car3: false,
    car4: false,
    car5: false,
    car6: false
};


// =========================
// ЭЛЕМЕНТЫ HTML
// =========================

const coinsText =
    document.getElementById("coins");

const energyText =
    document.getElementById("energy");

const tapButton =
    document.getElementById("tapButton");

const carLevelText =
    document.getElementById("carLevel");

const tapPowerText =
    document.getElementById("tapPower");

const upgradeButton =
    document.getElementById("upgradeButton");

const garageCarLevel =
    document.getElementById("garageCarLevel");

const garageTapPower =
    document.getElementById("garageTapPower");

const garageCarImage =
    document.getElementById("garageCarImage");

const garageCarName =
    document.getElementById("garageCarName");

const selectedCarButton =
    document.getElementById("selectedCarButton");

const turboEvent =
    document.getElementById("turboEvent");

const turboTimer =
    document.getElementById("turboTimer");

const garageCarSpeed =
    document.getElementById("garageCarSpeed");

const garageCarAcceleration =
    document.getElementById("garageCarAcceleration");

const garageCarMultiplier =
    document.getElementById("garageCarMultiplier");


// =========================
// TURBO
// =========================

let turboActive = false;
let turboTime = 0;
let turboInterval = null;

// =========================
// БЕСКОНЕЧНАЯ ЭНЕРГИЯ
// =========================

let infiniteEnergyActive = false;
let infiniteEnergyTime = 0;
let infiniteEnergyInterval = null;

const infiniteEnergyEvent =
    document.createElement("div");

infiniteEnergyEvent.id =
    "infiniteEnergyEvent";

infiniteEnergyEvent.textContent =
    "⚡ БЕСКОНЕЧНАЯ ЭНЕРГИЯ";

document.body.appendChild(
    infiniteEnergyEvent
);

const infiniteEnergyStyle =
    document.createElement("style");

infiniteEnergyStyle.textContent = `
#infiniteEnergyEvent {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;

    padding: 10px 18px;

    background: rgba(255, 255, 255, 0.95);
    color: #111;

    border-radius: 14px;

    font-size: 14px;
    font-weight: 800;

    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.35);

    opacity: 0;
    pointer-events: none;

    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

#infiniteEnergyEvent.active {
    opacity: 1;
}
`;

document.head.appendChild(
    infiniteEnergyStyle
);

// =========================
// ЗАГРУЗКА СОХРАНЕНИЯ
// =========================

try {

    const savedGame =
        localStorage.getItem("stRacingSave");

    if (savedGame) {

        const data =
            JSON.parse(savedGame);

        coins =
            data.coins ?? 0;

        energy =
            data.energy ?? 100;

        carLevel =
            data.carLevel ?? 1;

        tapPower =
            data.tapPower ?? 1;

        upgradeCost =
            data.upgradeCost ?? 100;

        selectedCar =
            data.selectedCar ?? "car1";
        // Исправление старого сохранения
        if (!cars[selectedCar]) {
            selectedCar = "car1";
        }


        // Новая система машин

        if (data.unlockedCars) {

            unlockedCars =
                data.unlockedCars;

        }
        // Загрузка заданий
        tasksDate =
            data.tasksDate ?? "";

        taskTaps =
            data.taskTaps ?? 0;

        taskCoinsEarned =
            data.taskCoinsEarned ?? 0;

        taskUpgrades =
            data.taskUpgrades ?? 0;

        taskRaces =
            data.taskRaces ?? 0;

        taskWins =
            data.taskWins ?? 0;

        taskTurbo =
            data.taskTurbo ?? 0;

        claimedTasks =
            data.claimedTasks ?? {};

        dailyTasks =
            data.dailyTasks ?? [];

        taskRaces =
            data.taskRaces ?? 0;

        taskWins =
            data.taskWins ?? 0;

        taskTurbo =
            data.taskTurbo ?? 0;

        // Загрузка ежедневной награды
        dailyRewardDay =
            data.dailyRewardDay ?? 0;

        dailyRewardLastDate =
            data.dailyRewardLastDate ?? "";

        lastOnlineTime =
            data.lastOnlineTime ?? Date.now();

    }

} catch (error) {

    console.log(
        "Ошибка загрузки сохранения:",
        error
    );

}


// =========================
// СОХРАНЕНИЕ
// =========================

function saveGame() {

    const gameData = {

        coins: coins,
        energy: energy,

        carLevel: carLevel,
        tapPower: tapPower,
        upgradeCost: upgradeCost,

        selectedCar: selectedCar,

        unlockedCars: unlockedCars,

        // Задания
        tasksDate: tasksDate,
        taskTaps: taskTaps,
        taskCoinsEarned: taskCoinsEarned,
        taskUpgrades: taskUpgrades,

        taskRaces: taskRaces,
        taskWins: taskWins,
        taskTurbo: taskTurbo,

        dailyTasks: dailyTasks,
        claimedTasks: claimedTasks,

        // Ежедневная награда
        dailyRewardDay: dailyRewardDay,
        dailyRewardLastDate: dailyRewardLastDate,
        lastOnlineTime: lastOnlineTime
    };


    localStorage.setItem(
        "stRacingSave",
        JSON.stringify(gameData)
    );

}


// =========================
// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// =========================

function updateInterface() {

    coinsText.textContent =
        Math.floor(coins).toLocaleString("ru-RU");

    energyText.textContent =
        energy;

    carLevelText.textContent =
        carLevel;

    tapPowerText.textContent =
        tapPower;


    // Цена следующего улучшения
    upgradeButton.textContent =
        "🔧 Улучшить — " +
        upgradeCost.toLocaleString("ru-RU") +
        " 🪙";


    updateGarage();

    updateMainCar();

    updateTasksInterface();

    updateDailyRewardInterface();

}


// =========================
// ГАРАЖ
// =========================

function updateGarage() {

    const car =
        cars[selectedCar];

    if (!car) {
        return;
    }


    garageCarImage.src =
        car.image;

    garageCarName.textContent =
        car.name;

    garageCarLevel.textContent =
        carLevel;

    garageTapPower.textContent =
        tapPower + " 🪙";

    if (garageCarSpeed) {
        garageCarSpeed.textContent =
            car.speed;
    }

    if (garageCarAcceleration) {
        garageCarAcceleration.textContent =
            car.acceleration;
    }

    if (garageCarMultiplier) {
        garageCarMultiplier.textContent =
            "×" + car.multiplier;
    }


    selectedCarButton.textContent =
        "✓ Выбрана";


    updateCarList();

}


// =========================
// СОЗДАНИЕ СПИСКА МАШИН
// =========================

function updateCarList() {

    const carsList =
        document.querySelector(".cars-list");

    if (!carsList) {
        return;
    }


    carsList.innerHTML = "";


    Object.keys(cars).forEach(
        function (carId) {

            const car =
                cars[carId];

            const isUnlocked =
                unlockedCars[carId] === true;

            const isSelected =
                selectedCar === carId;

            const canAfford =
                coins >= car.price;


            const slot =
                document.createElement("div");

            slot.className =
                "car-slot";


            if (isSelected) {

                slot.classList.add(
                    "active-car"
                );

            }


            if (!isUnlocked) {

                slot.classList.add(
                    "locked-car"
                );

            }


            // =========================
            // КАРТИНКА
            // =========================

            const imageWrapper =
                document.createElement("div");

            imageWrapper.className =
                "car-slot-image";


            const image =
                document.createElement("img");

            image.src =
                car.image;

            image.alt =
                car.name;


            imageWrapper.appendChild(image);


            // Замок поверх картинки

            if (!isUnlocked) {

                const lock =
                    document.createElement("div");

                lock.className =
                    "locked-icon";

                lock.textContent =
                    "🔒";

                imageWrapper.appendChild(
                    lock
                );

            }


            slot.appendChild(
                imageWrapper
            );


            // =========================
            // ИНФОРМАЦИЯ
            // =========================

            const info =
                document.createElement("div");

            info.className =
                "car-slot-info";


            const name =
                document.createElement("strong");

            name.textContent =
                car.name;


            const description =
                document.createElement("small");


            if (isUnlocked) {

                description.textContent =
                    "Скорость " +
                    car.speed +
                    " • Разгон " +
                    car.acceleration;

            } else {

                description.textContent =
                    "Цена: " +
                    car.price.toLocaleString("ru-RU") +
                    " 🪙";

            }


            info.appendChild(name);
            info.appendChild(description);

            slot.appendChild(info);


            // =========================
            // КНОПКА
            // =========================

            if (isSelected) {

                const check =
                    document.createElement("span");

                check.className =
                    "car-check";

                check.textContent =
                    "✓";

                slot.appendChild(check);

            }

            else if (isUnlocked) {

                const choose =
                    document.createElement("button");

                choose.className =
                    "buy-car-button";

                choose.textContent =
                    "Выбрать";

                slot.appendChild(choose);

            }

            else {

                const buy =
                    document.createElement("button");

                buy.className =
                    "buy-car-button";

                /* Если денег хватает — делаем кнопку активной */
                if (coins >= car.price) {
                    buy.classList.add("can-afford");
                }

                buy.textContent =
                    car.price.toLocaleString("ru-RU") +
                    " 🪙";

                slot.appendChild(buy);
                  }


            // =========================
            // КЛИК
            // =========================

            slot.addEventListener(
                "click",
                function () {

                    // Уже куплена
                    if (isUnlocked) {

                        selectedCar =
                            carId;

                        updateInterface();

                        saveGame();

                        return;

                    }


                    // Денег не хватает
                    if (
                        coins <
                        car.price
                    ) {

                        return;

                    }


                    // Покупаем
                    coins =
                        coins -
                        car.price;

                    unlockedCars[carId] =
                        true;

                    selectedCar =
                        carId;


                    updateInterface();

                    saveGame();

                }
            );


            carsList.appendChild(
                slot
            );

        }
    );

}


// =========================
// МАШИНА НА ГЛАВНОЙ
// =========================

function updateMainCar() {

    const car =
        cars[selectedCar];

    if (!car) {
        return;
    }


    tapButton.src =
        car.image;

    tapButton.alt =
        car.name;

}
// =========================
// ДАТА
// =========================

function getTodayDate() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );

}

// =========================
// ПУЛ ЕЖЕДНЕВНЫХ ЗАДАНИЙ
// =========================

const taskPool = [

    {
        id: "tap100",
        icon: "👆",
        title: "Сделай 100 тапов",
        type: "taps",
        target: 100,
        reward: 500
    },

    {
        id: "tap250",
        icon: "👆",
        title: "Сделай 250 тапов",
        type: "taps",
        target: 250,
        reward: 750
    },

    {
        id: "tap500",
        icon: "👆",
        title: "Сделай 500 тапов",
        type: "taps",
        target: 500,
        reward: 1500
    },


    {
        id: "coins1000",
        icon: "🪙",
        title: "Заработай 1 000 монет",
        type: "coins",
        target: 1000,
        reward: 1000
    },

    {
        id: "coins2500",
        icon: "🪙",
        title: "Заработай 2 500 монет",
        type: "coins",
        target: 2500,
        reward: 2000
    },

    {
        id: "coins5000",
        icon: "🪙",
        title: "Заработай 5 000 монет",
        type: "coins",
        target: 5000,
        reward: 4000
    },


    {
        id: "upgrade1",
        icon: "🔧",
        title: "Улучши машину 1 раз",
        type: "upgrade",
        target: 1,
        reward: 1500
    },

    {
        id: "upgrade2",
        icon: "🔧",
        title: "Улучши машину 2 раза",
        type: "upgrade",
        target: 2,
        reward: 3000
    },


    {
        id: "races2",
        icon: "🏁",
        title: "Проведи 2 заезда",
        type: "races",
        target: 2,
        reward: 1000
    },

    {
        id: "races3",
        icon: "🏁",
        title: "Проведи 3 заезда",
        type: "races",
        target: 3,
        reward: 1750
    },


    {
        id: "wins1",
        icon: "🏆",
        title: "Победи в 1 заезде",
        type: "wins",
        target: 1,
        reward: 1500
    },

    {
        id: "wins2",
        icon: "🏆",
        title: "Победи в 2 заезда",
        type: "wins",
        target: 2,
        reward: 3000
    },


    {
        id: "turbo1",
        icon: "⚡",
        title: "Активируй ТУРБО",
        type: "turbo",
        target: 1,
        reward: 1000
    }

];


// =========================
// ВЫБОР 5 ЗАДАНИЙ
// =========================

function generateDailyTasks() {

    const shuffled = [...taskPool];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] =
            [
                shuffled[j],
                shuffled[i]
            ];
    }

    return shuffled.slice(0, 5);

}


// =========================
// СБРОС ЕЖЕДНЕВНЫХ ЗАДАНИЙ
// =========================

function checkTasksDate() {

    const today = getTodayDate();

    if (tasksDate !== today) {

        tasksDate = today;

        taskTaps = 0;
        taskCoinsEarned = 0;
        taskUpgrades = 0;

        taskRaces = 0;
        taskWins = 0;
        taskTurbo = 0;

        claimedTasks = {};

        dailyTasks = generateDailyTasks();

        saveGame();
    }

}


// =========================
// ОБНОВЛЕНИЕ ЗАДАНИЙ
// =========================

function updateTasksInterface() {

    checkTasksDate();

    const taskCards =
        document.querySelectorAll(".task-card");

    if (taskCards.length < 5) {
        return;
    }

    if (
        !dailyTasks ||
        dailyTasks.length !== 5
    ) {
        dailyTasks =
            generateDailyTasks();

        saveGame();
    }


    dailyTasks.forEach(
        function (task, index) {

            const card =
                taskCards[index];

            if (!card) {
                return;
            }


            const progress =
                getTaskProgress(task);

            const percent =
                Math.min(
                    progress / task.target * 100,
                    100
                );


            const title =
                card.querySelector(
                    ".task-title"
                );

            const icon =
                card.querySelector(
                    ".task-icon"
                );

            const progressText =
                card.querySelector(
                    ".task-progress-text"
                );

            const progressFill =
                card.querySelector(
                    ".task-progress-fill"
                );

            const rewardText =
                card.querySelector(
                    ".task-reward-text"
                );


            icon.textContent =
                task.icon;

            title.textContent =
                task.title;

            progressText.textContent =
                progress.toLocaleString(
                    "ru-RU"
                ) +
                " / " +
                task.target.toLocaleString(
                    "ru-RU"
                );

            progressFill.style.width =
                percent + "%";

            rewardText.textContent =
                "Награда: " +
                task.reward.toLocaleString(
                    "ru-RU"
                ) +
                " 🪙";


            updateTaskButton(
                card,
                progress >= task.target,
                claimedTasks[task.id]
            );

        }
    );

}

function getTaskProgress(task) {

    if (task.type === "taps") {
        return taskTaps;
    }

    if (task.type === "coins") {
        return taskCoinsEarned;
    }

    if (task.type === "upgrade") {
        return taskUpgrades;
    }

    if (task.type === "races") {
        return taskRaces;
    }

    if (task.type === "wins") {
        return taskWins;
    }

    if (task.type === "turbo") {
        return taskTurbo;
    }

    return 0;

}


// =========================
// ПРОВЕРКА ВЧЕРАШНЕЙ ДАТЫ
// =========================

function isYesterday(dateString) {

    if (!dateString) {
        return false;
    }

    const today =
        new Date(getTodayDate());

    const yesterday =
        new Date(today);

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    const expected =
        yesterday.getFullYear() +
        "-" +
        String(
            yesterday.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            yesterday.getDate()
        ).padStart(2, "0");

    return dateString === expected;
}


// =========================
// ЕЖЕДНЕВНАЯ НАГРАДА
// =========================

function updateDailyRewardInterface() {

    const button = document.getElementById("dailyRewardButton");
    const text = document.getElementById("dailyRewardText");
    const status = document.getElementById("dailyRewardStatus");
    const days = document.querySelectorAll(".reward-day");

    if (!button || !text || !status) return;

    const today = getTodayDate();

    /* Сбрасываем визуальные состояния */

    days.forEach(day => {
        day.classList.remove("reward-current");
        day.classList.remove("reward-claimed");
    });


    /* =========================================
       ОПРЕДЕЛЯЕМ, КАКОЙ ДЕНЬ ДОСТУПЕН
       ========================================= */

    let availableDay = 0;

    if (!dailyRewardLastDate) {

        /* Первый запуск */
        availableDay = 0;

    }

    else if (dailyRewardLastDate === today) {

        /* Уже получил сегодня */
        availableDay = dailyRewardDay;

    }

    else if (isYesterday(dailyRewardLastDate)) {

        /* Получал вчера → следующий день */
        availableDay = dailyRewardDay + 1;

        if (availableDay >= dailyRewards.length) {
            availableDay = 0;
        }

    }

    else {

        /* Пропустил день → снова День 1 */
        availableDay = 0;

    }


    /* =========================================
       ВОССТАНАВЛИВАЕМ ВСЕ ПОЛУЧЕННЫЕ ДНИ
       ========================================= */

    /*
       Если награда была получена сегодня
       или вчера — отмечаем все предыдущие
       дни текущей серии.
    */

    if (
        dailyRewardLastDate === today ||
        isYesterday(dailyRewardLastDate)
    ) {

        for (let i = 0; i <= dailyRewardDay; i++) {

            const claimedDay = document.querySelector(
                `.reward-day[data-day="${i + 1}"]`
            );

            if (claimedDay) {
                claimedDay.classList.add("reward-claimed");
            }

        }

    }


    /* =========================================
       НАГРАДА УЖЕ ПОЛУЧЕНА СЕГОДНЯ
       ========================================= */

    if (dailyRewardLastDate === today) {

        button.disabled = true;

        button.textContent = "✓ Награда получена";

        text.textContent =
            "Возвращайся завтра за новой наградой";

        status.textContent =
            "✓ НАГРАДА ПОЛУЧЕНА";

        status.classList.remove("available");
        status.classList.add("claimed");

        return;
    }


    /* =========================================
       НАГРАДА ДОСТУПНА
       ========================================= */

    button.disabled = false;

    button.textContent =
        "🎁 Забрать " +
        dailyRewards[availableDay].toLocaleString("ru-RU") +
        " 🪙";

    text.textContent =
        "Твоя награда за сегодня";

    status.textContent =
        "🎁 НАГРАДА ДОСТУПНА";

    status.classList.remove("claimed");
    status.classList.add("available");


    /* Подсвечиваем доступный день */

    const currentDay = document.querySelector(
        `.reward-day[data-day="${availableDay + 1}"]`
    );

    if (currentDay) {
        currentDay.classList.add("reward-current");
    }

}


// =========================
// КНОПКА ЕЖЕДНЕВНОЙ НАГРАДЫ
// =========================

const dailyRewardButton =
    document.getElementById(
        "dailyRewardButton"
    );


if (dailyRewardButton) {

    dailyRewardButton.addEventListener(
        "click",
        function () {

            const today =
                getTodayDate();


            // Защита от повторного получения

            if (
                dailyRewardLastDate === today
            ) {

                return;

            }


            // Определяем день награды

            let rewardDay = 0;


            // Если получал вчера —
            // переходим к следующему дню

            if (
                dailyRewardLastDate &&
                isYesterday(
                    dailyRewardLastDate
                )
            ) {

                rewardDay =
                    dailyRewardDay + 1;


                // После Дня 7 → День 1

                if (
                    rewardDay >=
                    dailyRewards.length
                ) {

                    rewardDay = 0;

                }

            }


            // Если был пропуск —
            // начинаем с Дня 1

            else if (
                dailyRewardLastDate &&
                dailyRewardLastDate !== today
            ) {

                rewardDay = 0;

            }


            // Запоминаем день

            dailyRewardDay =
                rewardDay;


            // Выдаём награду

            const reward =
                dailyRewards[
                dailyRewardDay
                ];


            coins += reward;


            // Запоминаем дату

            dailyRewardLastDate =
                today;


            // Сначала сохраняем

            saveGame();


            // Затем обновляем интерфейс

            updateInterface();

        }
    );

}

//###############
// КНОПКА ЗАДАНИЯ
//###############
function updateTaskButton(
    card,
    completed,
    claimed
) {

    const button =
        card.querySelector(
            ".task-reward-button"
        );


    if (claimed) {

        card.classList.add("completed");

        button.textContent = "✓ Получено";
        button.classList.remove("ready");

        return;

    }


    card.classList.remove("completed");


    if (completed) {

        button.textContent = "Забрать";
        button.classList.add("ready");

    } else {

        button.textContent = "Забрать";
        button.classList.remove("ready");

    }

}


// =========================
// ПОЛУЧЕНИЕ НАГРАДЫ ЗАДАНИЯ
// =========================

function claimTask(taskId) {

    const task =
        dailyTasks.find(
            function (item) {
                return item.id === taskId;
            }
        );

    if (!task) {
        return;
    }


    if (claimedTasks[task.id]) {
        return;
    }


    const progress =
        getTaskProgress(task);


    if (progress < task.target) {
        return;
    }


    coins += task.reward;

    claimedTasks[task.id] = true;


    updateInterface();

    saveGame();

}

// =========================
// КНОПКИ ЗАДАНИЙ
// =========================

const taskButtons =
    document.querySelectorAll(
        ".task-reward-button"
    );

taskButtons.forEach(
    function (button, index) {

        button.addEventListener(
            "click",
            function () {

                if (!dailyTasks[index]) {
                    return;
                }

                claimTask(
                    dailyTasks[index].id
                );

            }
        );

    }
);
// =========================
// ВИЗУАЛЬНЫЙ ЭФФЕКТ ТАПА
// =========================

// В Telegram Mini App :active у картинки/кнопки может
// визуально отличаться от обычного браузера.
// Делаем эффект нажатия явно через класс.
const tapPressStyle =
    document.createElement("style");

tapPressStyle.textContent = `
#tapButton {
    transform-origin: center center;
    transition: transform 0.08s ease, filter 0.08s ease;
}

#tapButton.car-tap-pressed {
    transform: scale(0.94);
    filter: brightness(0.88);
}
`;

document.head.appendChild(tapPressStyle);


// =========================
// ТАП
// =========================


tapButton.addEventListener(
    "click",
    function () {

        // В Telegram WebView псевдокласс :active может
        // отрабатывать иначе, чем в обычном браузере.
        // Поэтому эффект нажатия запускаем явно через JS.
        tapButton.classList.remove("car-tap-pressed");
        void tapButton.offsetWidth;
        tapButton.classList.add("car-tap-pressed");

        setTimeout(function () {
            tapButton.classList.remove("car-tap-pressed");
        }, 120);

        if (energy <= 0) {
            return;
        }


        const currentCar =
            cars[selectedCar];

        let currentTapPower =
            tapPower *
            currentCar.multiplier;


        // Turbo ×2
        if (turboActive) {

            currentTapPower =
                currentTapPower * 2;

        }


        coins =
            coins + Mathround(currentTapPower);

        if (!infiniteEnergyActive) {

            energy =
                energy - 1;

        }


        // Прогресс задания
        taskTaps++;

        taskCoinsEarned += currentTapPower;


        // Шанс запуска турбо

        if (
            !turboActive &&
            Math.random() < 0.02
        ) {

            startTurbo();

        }

        // Шанс бесконечной энергии
        if (
            !infiniteEnergyActive &&
            Math.random() < 0.01
        ) {

            startInfiniteEnergy();

        }

        updateInterface();

        saveGame();

    }
);


// =========================
// ПРОКАЧКА
// =========================

upgradeButton.addEventListener(
    "click",
    function () {

        if (
            coins < upgradeCost
        ) {

            return;

        }


        coins =
            coins - upgradeCost;

        carLevel =
            carLevel + 1;

        tapPower =
            tapPower + 1;

        upgradeCost =
            upgradeCost * 2;

        // Прогресс задания
        taskUpgrades++;


        updateInterface();

        saveGame();

    }
);


// =========================
// ВОССТАНОВЛЕНИЕ ЭНЕРГИИ
// =========================

setInterval(
    function () {

        if (energy < 100) {

            energy =
                energy + 1;

            updateInterface();

            saveGame();

        }

    },
    1000
);


// =========================
// TURBO
// =========================

function startTurbo() {

    turboActive =
        true;

    taskTurbo++;

    turboTime =
        10;

    turboTimer.textContent =
        turboTime;

    turboEvent.classList.add(
        "active"
    );


    turboInterval =
        setInterval(
            function () {

                turboTime--;

                turboTimer.textContent =
                    turboTime;


                if (
                    turboTime <= 0
                ) {

                    clearInterval(
                        turboInterval
                    );

                    turboInterval =
                        null;

                    turboActive =
                        false;

                    turboEvent.classList.remove(
                        "active"
                    );

                }

            },
            1000
        );

}

// =========================
// БЕСКОНЕЧНАЯ ЭНЕРГИЯ
// =========================

function startInfiniteEnergy() {

    infiniteEnergyActive = true;

    infiniteEnergyTime = 10;

    infiniteEnergyEvent.textContent =
        "⚡ БЕСКОНЕЧНАЯ ЭНЕРГИЯ 10с";

    infiniteEnergyEvent.classList.add(
        "active"
    );


    if (infiniteEnergyInterval) {

        clearInterval(
            infiniteEnergyInterval
        );

    }


    infiniteEnergyInterval =
        setInterval(
            function () {

                infiniteEnergyTime--;

                infiniteEnergyEvent.textContent =
                    "⚡ БЕСКОНЕЧНАЯ ЭНЕРГИЯ " +
                    infiniteEnergyTime +
                    "с";


                if (
                    infiniteEnergyTime <= 0
                ) {

                    clearInterval(
                        infiniteEnergyInterval
                    );

                    infiniteEnergyInterval =
                        null;

                    infiniteEnergyActive =
                        false;

                    infiniteEnergyEvent.classList.remove(
                        "active"
                    );

                }

            },
            1000
        );

}

// =========================
// ГОНОЧНЫЙ РЕЖИМ 2.0
// =========================

const racePlayerCar =
    document.getElementById("racePlayerCar");

const raceOpponentCar =
    document.getElementById("raceOpponentCar");

const raceSmokePlayer = document.getElementById("raceSmokePlayer");
const raceSmokeOpponent = document.getElementById("raceSmokeOpponent");
const raceVictoryEffect = document.getElementById("raceVictoryEffect");

const raceStatus =
    document.getElementById("raceStatus");

const raceOpponentText =
    document.getElementById("raceOpponentText");

const startRaceButton =
    document.getElementById("startRaceButton");

const raceAgainButton =
    document.getElementById("raceAgainButton");


let raceRunning = false;

let raceAnimation = null;

let playerProgress = 0;
let opponentProgress = 0;

let playerSpeed = 0;
let opponentSpeed = 0;

let raceOpponent = null;

let raceOpponentId = null;

let lastRaceOpponentId = null;

let raceReward = 1000;

let raceStartTime = 0;

let countdownTimers = [];

function playRaceStartSmoke() {
    if (raceSmokePlayer) {
        raceSmokePlayer.classList.remove("smoke-active");
        void raceSmokePlayer.offsetWidth;
        raceSmokePlayer.classList.add("smoke-active");
    }

    if (raceSmokeOpponent) {
        raceSmokeOpponent.classList.remove("smoke-active");
        void raceSmokeOpponent.offsetWidth;
        raceSmokeOpponent.classList.add("smoke-active");
    }
}

// =========================
// РЕЙТИНГ МАШИНЫ
// =========================

function getCarRating(car) {

    if (!car) {
        return 0;
    }

    return (
        car.speed * 0.6 +
        car.acceleration * 0.4
    );

}


// =========================
// НАГРАДА ЗА ГОНКУ
// =========================

function calculateRaceReward(
    player,
    opponent
) {

    const playerRating =
        getCarRating(player);

    const opponentRating =
        getCarRating(opponent);

    const difference =
        opponentRating -
        playerRating;

    // Базовая награда зависит от стоимости машины игрока
    // Чем дороже машина — тем выше награда
    const baseReward =
        player.price > 0
            ? 1000 + Math.round(player.price * 0.15)
            : 1000;

    // Бонус/штраф за разницу характеристик
    const difficultyBonus =
        Math.round(difference * 10);

    let reward =
        baseReward +
        difficultyBonus;

    // Минимальная награда
    reward = Math.max(
        reward,
        500
    );

    return reward;
}


// =========================
// ВЫБОР СОПЕРНИКА
// =========================

function chooseRaceOpponent() {

    const possibleOpponents =
        Object.entries(cars)
            .filter(function ([key]) {

                // Нельзя гоняться самому с собой
                if (key === selectedCar) {
                    return false;
                }

                // Стараемся не повторять
                // прошлого соперника
                if (
                    key === lastRaceOpponentId &&
                    Object.keys(cars).length > 2
                ) {
                    return false;
                }

                return true;

            });


    // Запасной вариант
    if (
        possibleOpponents.length === 0
    ) {

        const fallback =
            Object.entries(cars)
                .filter(function ([key]) {

                    return key !== selectedCar;

                });


        if (
            fallback.length > 0
        ) {

            const randomFallback =
                fallback[
                Math.floor(
                    Math.random() *
                    fallback.length
                )
                ];

            raceOpponentId =
                randomFallback[0];

            lastRaceOpponentId =
                raceOpponentId;

            return randomFallback[1];

        }


        return {
            name: "Уличный соперник",
            image: "images/Lada_2109.png",
            speed: 52,
            acceleration: 52
        };

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            possibleOpponents.length
        );


    const selectedOpponent =
        possibleOpponents[randomIndex];


    raceOpponentId =
        selectedOpponent[0];


    lastRaceOpponentId =
        raceOpponentId;


    return selectedOpponent[1];

}


// =========================
// СЛУЧАЙНОСТЬ СОПЕРНИКА
// =========================

function getOpponentPerformance(
    value
) {

    /*
       Соперник каждый раз
       показывает немного разный результат.

       Например:

       100 → 96–104

       Благодаря этому две одинаковые
       машины не всегда едут абсолютно
       одинаково.
    */

    const variation =
        0.96 +
        Math.random() * 0.08;


    return value * variation;

}


// =========================
// ПОДГОТОВКА ГОНКИ
// =========================

function prepareRacePreview() {

    if (!racePlayerCar) {
        return;
    }


    const player =
        cars[selectedCar];


    if (!player) {
        return;
    }


    raceOpponent =
        chooseRaceOpponent();


    // Машины
    racePlayerCar.src =
        player.image;

    raceOpponentCar.src =
        raceOpponent.image;


    // Имя соперника
    if (raceOpponentText) {

        raceOpponentText.textContent =
            "Соперник: " +
            raceOpponent.name;

    }


    // Награда
    raceReward =
        calculateRaceReward(
            player,
            raceOpponent
        );


    if (raceStatus) {

        raceStatus.style.color = "";

        raceStatus.textContent =
            "🏆 Победа принесёт " +
            raceReward.toLocaleString(
                "ru-RU"
            ) +
            " 🪙";

    }


    // Сброс позиции
    playerProgress = 0;

    opponentProgress = 0;

    playerSpeed = 0;

    opponentSpeed = 0;


    updateRaceCars();

}


// =========================
// ПОЗИЦИЯ МАШИН
// =========================

function updateRaceCars() {

    const track =
        document.querySelector(
            ".race-track"
        );


    if (!track) {
        return;
    }


    const trackWidth =
        track.clientWidth;


    const carWidth =
        105;


    const maxPosition =
        Math.max(
            trackWidth -
            carWidth -
            45,
            50
        );


    const playerX =
        10 +
        maxPosition *
        playerProgress;


    const opponentX =
        10 +
        maxPosition *
        opponentProgress;


    racePlayerCar.style.left =
        playerX + "px";


    raceOpponentCar.style.left =
        opponentX + "px";

}


// =========================
// ОЧИСТКА ТАЙМЕРОВ
// =========================

function clearRaceCountdown() {

    countdownTimers.forEach(
        function (timer) {

            clearTimeout(timer);

        }
    );


    countdownTimers = [];

}


// =========================
// НАЧАЛО ГОНКИ
// =========================

function startRace() {

    if (raceRunning) {
        return;
    }


    const player =
        cars[selectedCar];


    if (!player) {
        return;
    }

    clearRaceCountdown();


    // Используем того же соперника, которого показывали
    // на экране перед стартом. Не выбираем нового здесь.
    if (!raceOpponent) {
        raceOpponent = chooseRaceOpponent();
    }


    if (!raceOpponent) {
        return;
    }


    // Картинки
    racePlayerCar.src =
        player.image;

    raceOpponentCar.src =
        raceOpponent.image;


    // Награда
    raceReward =
        calculateRaceReward(
            player,
            raceOpponent
        );


    if (raceOpponentText) {

        raceOpponentText.textContent =
            "Соперник: " +
            raceOpponent.name;

    }


    // Сброс
    playerProgress = 0;

    opponentProgress = 0;

    playerSpeed = 0;

    opponentSpeed = 0;


    updateRaceCars();


    raceRunning = true;

    raceStartTime =
        performance.now();


    startRaceButton.style.display =
        "none";

    raceAgainButton.style.display =
        "none";


    raceStatus.style.color = "";

    raceStatus.textContent =
        "🚦 ГОТОВЬСЯ...";


    // =========================
    // ОБРАТНЫЙ ОТСЧЁТ
    // =========================

    countdownTimers.push(
        setTimeout(
            function () {

                if (!raceRunning) {
                    return;
                }

                raceStatus.textContent =
                    "3...";

            },
            500
        )
    );


    countdownTimers.push(
        setTimeout(
            function () {

                if (!raceRunning) {
                    return;
                }

                raceStatus.textContent =
                    "2...";

            },
            1000
        )
    );


    countdownTimers.push(
        setTimeout(
            function () {

                if (!raceRunning) {
                    return;
                }

                raceStatus.textContent =
                    "1...";

            },
            1500
        )
    );


    countdownTimers.push(
        setTimeout(
            function () {

                if (!raceRunning) {
                    return;
                }

                raceStatus.textContent =
                    "🏁 ПОЕХАЛИ!";

                playRaceStartSmoke();
                runRace();

            },
            2000
        )
    );

}


// =========================
// ГОНКА
// =========================

function runRace() {

    let lastTime =
        performance.now();


    const player =
        cars[selectedCar];


    // Характеристики игрока
    const playerAcceleration =
        player.acceleration;


    const playerMaxSpeed =
        player.speed;


    // Характеристики соперника
    const opponentAcceleration =
        getOpponentPerformance(
            raceOpponent.acceleration
        );


    const opponentMaxSpeed =
        getOpponentPerformance(
            raceOpponent.speed
        );


    function frame(currentTime) {

        if (!raceRunning) {
            return;
        }


        const deltaTime =
            Math.min(
                (currentTime - lastTime) /
                1000,
                0.05
            );


        lastTime =
            currentTime;


        // =========================
        // РАЗГОН ИГРОКА
        // =========================

        playerSpeed +=
            playerAcceleration *
            0.00035 *
            deltaTime;


        // =========================
        // РАЗГОН СОПЕРНИКА
        // =========================

        opponentSpeed +=
            opponentAcceleration *
            0.00035 *
            deltaTime;


        // =========================
        // МАКСИМАЛЬНАЯ СКОРОСТЬ
        // =========================

        const playerMax =
            0.20 +
            playerMaxSpeed *
            0.004;


        const opponentMax =
            0.20 +
            opponentMaxSpeed *
            0.004;


        playerSpeed =
            Math.min(
                playerSpeed,
                playerMax
            );


        opponentSpeed =
            Math.min(
                opponentSpeed,
                opponentMax
            );


        // =========================
        // ДВИЖЕНИЕ
        // =========================

        playerProgress +=
            playerSpeed *
            deltaTime;


        opponentProgress +=
            opponentSpeed *
            deltaTime;


        // Ограничиваем
        playerProgress =
            Math.min(
                playerProgress,
                1
            );


        opponentProgress =
            Math.min(
                opponentProgress,
                1
            );


        updateRaceCars();


        // =========================
        // ФИНИШ
        // =========================

        if (
            playerProgress >= 1 ||
            opponentProgress >= 1
        ) {

            finishRace();

            return;

        }


        raceAnimation =
            requestAnimationFrame(
                frame
            );

    }


    raceAnimation =
        requestAnimationFrame(
            frame
        );

}


// =========================
// ФИНИШ
// =========================

function finishRace() {

    if (!raceRunning) {
        return;
    }


    raceRunning = false;


    clearRaceCountdown();


    if (raceAnimation) {

        cancelAnimationFrame(
            raceAnimation
        );

        raceAnimation = null;

    }


    // =========================
    // ПОБЕДА
    // =========================

    if (
        playerProgress >=
        opponentProgress
    ) {

        coins =
            coins +
            raceReward;

        taskRaces++;
        taskWins++;
        taskCoinsEarned +=
            raceReward;


        raceStatus.textContent =
            "🏆 ПОБЕДА! +" +
            raceReward.toLocaleString(
                "ru-RU"
            ) +
            " 🪙";


        raceStatus.style.color =
            "#7CFF8A";

    }


    // =========================
    // ПОРАЖЕНИЕ
    // =========================

    else {

        taskRaces++;
        raceStatus.textContent =
            "💨 Соперник оказался быстрее";


        raceStatus.style.color =
            "#ff8a8a";

    }


    updateInterface();

    saveGame();


    raceAgainButton.style.display =
        "block";

}


// =========================
// КНОПКА «СТАРТ»
// =========================

if (startRaceButton) {

    startRaceButton.addEventListener(
        "click",
        startRace
    );

}


// =========================
// КНОПКА «ЕЩЁ РАЗ»
// =========================

if (raceAgainButton) {

    raceAgainButton.addEventListener(
        "click",
        function () {

            raceStatus.style.color =
                "";

            // Выбираем нового соперника
            prepareRacePreview();

            // Запускаем гонку с ним
            startRace();

        }
    );

}

// =========================
// ОТСЛЕЖИВАНИЕ ВЫХОДА ИЗ ИГРЫ
// =========================

function markOfflineTime() {

    lastOnlineTime =
        Date.now();

    saveGame();
}


document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState === "hidden"
        ) {

            markOfflineTime();

        } else {

            const progress =
                applyOfflineProgress();

            if (progress.seconds > 0) {

                console.log(
                    "Пока тебя не было:",
                    "+" +
                    progress.coins +
                    " 🪙"
                );

                updateInterface();
                saveGame();
            }
        }
    }
);


window.addEventListener(
    "pagehide",
    function () {

        markOfflineTime();

    }
);

// =========================
// НАВИГАЦИЯ
// =========================

const navButtons =
    document.querySelectorAll(
        ".nav-button"
    );

const screens =
    document.querySelectorAll(
        ".screen"
    );


navButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const targetScreen =
                    button.dataset.screen;


                screens.forEach(
                    function (screen) {

                        screen.classList.remove(
                            "active-screen"
                        );

                    }
                );


                const target =
                    document.getElementById(
                        targetScreen
                    );


                if (target) {

                    target.classList.add(
                        "active-screen"
                    );

                }


                navButtons.forEach(
                    function (navButton) {

                        navButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                // При входе в гонки
                // показываем новый заезд

                if (
                    targetScreen ===
                    "racesScreen" &&
                    !raceRunning
                ) {

                    prepareRacePreview();

                }

            }
        );

    }
);


// =========================
// ЗАПУСК ИНТЕРФЕЙСА
// =========================

const offlineProgress =
    applyOfflineProgress();

if (offlineProgress.coins > 0) {

    console.log(
        "Пока тебя не было:",
        "+" + offlineProgress.coins + " 🪙"
    );
}

showOfflineProgress(
    offlineProgress
);

saveGame();

updateInterface();