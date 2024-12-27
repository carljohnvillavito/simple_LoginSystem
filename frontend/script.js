function switchSections(section) {
  document.getElementById('login-section').style.display = section === 'login' ? 'block' : 'none';
  document.getElementById('registration-section').style.display = section === 'registration' ? 'block' : 'none';
    document.getElementById('dashboard-section').style.display = 'none';
}

async function register() {
    const fullname = document.getElementById('register-fullname').value;
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    // Normally, you'd send this to the server for registration
    // Here, I simulate successful registration:

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullname, username, password }),
        });

        if (response.ok) {
           alert("Registration successful. Please login.")
             switchSections('login')
        } else {
            const errorData = await response.json();
           alert(`Error registering user: ${errorData.message}`);
        }
    } catch (error) {
        alert('Error registering user:' + error);
    }

}


async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const userData = await response.json();
            showDashboard(userData.fullname)

        } else {
            const errorData = await response.json();
           alert(`Error logging in: ${errorData.message}`);
        }
    } catch (error) {
        alert('Error loggin in:' + error);
    }
}

function showDashboard(fullname) {
    document.getElementById('login-section').style.display = 'none';
     document.getElementById('registration-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block'
    document.getElementById('user-fullname-display').innerText = fullname;
}

function logout(){
    switchSections('login')
    alert('You have been logged out')
}
