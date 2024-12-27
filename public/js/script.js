document.getElementById('usersButton').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/admin/users')
        .then(response => response.json())
        .then(data => {
          const userDataContainer = document.getElementById('userDataContainer');
            userDataContainer.style.display = 'block'; // Make container visible

            const userDataDiv = document.getElementById('userData');
            userDataDiv.innerHTML = ''; // Clear previous data

            data.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.innerHTML = `
                     <p><strong>Username:</strong> ${user.username}</p>
                     <p><strong>Password:</strong> ${user.password}</p>
                     <hr>
                 `;
                 userDataDiv.appendChild(userDiv);
             });
        })
        .catch(error => console.error('Error getting users:', error));
});
