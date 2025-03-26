document.addEventListener('DOMContentLoaded', () => {
    // Регистрация
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const registerMessage = document.getElementById('registerMessage');

            try {
                const response = await fetch('http://localhost:8080/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    registerMessage.textContent = data.message;
                    registerMessage.style.color = 'green';
                    registerForm.reset();
                } else {
                    registerMessage.textContent = data.message;
                    registerMessage.style.color = 'red';
                }
            } catch (error) {
                registerMessage.textContent = 'Ошибка при регистрации.';
                registerMessage.style.color = 'red';
                console.error('Ошибка регистрации:', error);
            }
        });
    }

    // Вход
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const loginMessage = document.getElementById('loginMessage');

            try {
                const response = await fetch('http://localhost:8080/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token); // Сохраняем токен в localStorage
                    loginMessage.textContent = 'Вход успешно выполнен!';
                    loginMessage.style.color = 'green';
                    loginForm.reset();
                    setTimeout(() => {
                        window.location.href = 'protected.html'; // Перенаправляем на защищенную страницу
                    }, 1000);
                } else {
                    loginMessage.textContent = data.message;
                    loginMessage.style.color = 'red';
                }
            } catch (error) {
                loginMessage.textContent = 'Ошибка при входе.';
                loginMessage.style.color = 'red';
                console.error('Ошибка входа:', error);
            }
        });
    }

    // Защищенный ресурс
    const fetchProtectedDataButton = document.getElementById('fetchProtectedData');
    const protectedDataDiv = document.getElementById('protectedData');
    if (fetchProtectedDataButton) {
        fetchProtectedDataButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                protectedDataDiv.textContent = 'Токен отсутствует. Войдите в систему.';
                protectedDataDiv.style.color = 'red';
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/protected', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    protectedDataDiv.textContent = data.message + ` User ID: ${data.userId}`;
                    protectedDataDiv.style.color = 'green';
                } else {
                    protectedDataDiv.textContent = data.message;
                    protectedDataDiv.style.color = 'red';
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token'); // Удаляем недействительный токен
                        setTimeout(() => {
                            window.location.href = 'login.html'; // Перенаправляем на страницу входа
                        }, 1500);
                    }
                }
            } catch (error) {
                protectedDataDiv.textContent = 'Ошибка при получении защищенных данных.';
                protectedDataDiv.style.color = 'red';
                console.error('Ошибка защищенных данных:', error);
            }
        });
    }
});