document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');


    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                gender: document.getElementById('gender').value,
                dob: document.getElementById('dob').value
            };

            try {

                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });

                const data = await response.json();

                if (response.ok) {

                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    alert('Реєстрація успішна! Переходимо в додаток...');
                    window.location.href = 'app.html';
                } else {

                    alert(data.error);
                }
            } catch (error) {
                console.error("Помилка сервера:", error);
                alert("Не вдалося з'єднатися з сервером.");
            }
        });
    }


    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputEmail = document.getElementById('email').value;
            const inputPassword = document.getElementById('password').value;
            
            try {

                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: inputEmail, password: inputPassword })
                });

                const data = await response.json();

                if (response.ok) {

                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    window.location.href = 'app.html'; 
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Помилка сервера:", error);
                alert("Не вдалося з'єднатися з сервером.");
            }
        });
    }


    const profileEmail = document.getElementById('profile-email');
    if (profileEmail) {
        const savedUser = JSON.parse(localStorage.getItem('currentUser'));

        if (savedUser) {
            document.getElementById('profile-full-name').textContent = savedUser.name;
            document.getElementById('profile-email').textContent = savedUser.email;
            document.getElementById('profile-gender').textContent = savedUser.gender === 'male' ? 'Чоловіча' : 'Жіноча';
            document.getElementById('profile-dob').textContent = savedUser.dob;
            
            const names = savedUser.name.split(' ');
            const initials = names.map(n => n[0]).join('').toUpperCase();
            document.getElementById('profile-initials').textContent = initials;
        } else {
            window.location.href = 'index.html';
        }
    }


    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout){
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }


    const btnDeleteProfile = document.getElementById('btn-delete-profile');
    if (btnDeleteProfile) {
        btnDeleteProfile.addEventListener('click', async () => {
            const savedUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!savedUser) return;


            if (!confirm('Ви впевнені, що хочете ПОВНІСТЮ видалити свій профіль? Всі ваші дані будуть стерті без можливості відновлення.')) {
                return;
            }

            try {

                const response = await fetch(`http://localhost:3000/api/users/${savedUser.email}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (response.ok) {

                    localStorage.removeItem('currentUser');
                    alert('Ваш профіль було успішно видалено.');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Помилка при видаленні профілю.');
                }
            } catch (error) {
                console.error("Помилка з'єднання з сервером:", error);
                alert("Не вдалося зв'язатися з сервером для видалення профілю.");
            }
        });
    }
});