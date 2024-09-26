const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Функция для чтения пользователей из файла
function readUsers() {
    const data = fs.readFileSync('data/users.txt', 'utf8');
    const users = {};
    data.split('\n').forEach(line => {
        if (line.trim() !== '') {
            const [username, password, clicks, gems] = line.split(',');
            users[username] = {
                password,
                clicks: parseInt(clicks, 10),
                gems: parseInt(gems, 10)
            };
        }
    });
    return users;
}

// Функция для записи пользователей в файл
function writeUsers(users) {
    const data = Object.entries(users).map(([username, info]) => {
        return `${username},${info.password},${info.clicks},${info.gems}`;
    }).join('\n');
    fs.writeFileSync('data/users.txt', data);
}

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (users[username]) {
        return res.status(400).json({ success: false, message: 'Пользователь уже существует' });
    }

    users[username] = { password, clicks: 0, gems: 0 };
    writeUsers(users);
    res.json({ success: true });
});

// Вход пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (users[username] && users[username].password === password) {
        res.json({ success: true, clicks: users[username].clicks, gems: users[username].gems });
    } else {
        res.status(400).json({ success: false, message: 'Неверное имя пользователя или пароль' });
    }
});

// Обработка клика
app.post('/click', (req, res) => {
    const { username } = req.body;
    const users = readUsers();

    if (users[username]) {
        users[username].clicks += 1;
        writeUsers(users);
        res.json({ success: true, clicks: users[username].clicks, gems: users[username].gems });
    } else {
        res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
});

// Получение акций
app.get('/actions', (req, res) => {
    const actions = fs.readFileSync('data/actions.txt', 'utf8').split('\n').filter(line => line.trim() !== '');
    res.json(actions);
});

// Обработка покупки акций
app.post('/buy-action', (req, res) => {
    const { username, actionIndex } = req.body;
    const users = readUsers();
    const actions = fs.readFileSync('data/actions.txt', 'utf8').split('\n').filter(line => line.trim() !== '');

    if (!users[username]) {
        return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    if (actions[actionIndex]) {
        const [type, price, count] = actions[actionIndex].split(',');
        if (type === 'click' && users[username].gems >= price) {
            users[username].gems -= price;
            users[username].clicks += parseInt(count, 10);
        } else if (type === 'gems' && users[username].clicks >= price) {
            users[username].clicks -= price;
            users[username].gems += parseInt(count, 10);
        } else {
            return res.status(400).json({ success: false, message: 'Недостаточно ресурсов' });
        }

        writeUsers(users);
        res.json({ success: true, clicks: users[username].clicks, gems: users[username].gems });
    } else {
        res.status(400).json({ success: false, message: 'Акция не найдена' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
