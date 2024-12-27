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

                        const passwordContainer = document.createElement('div');
                        passwordContainer.classList.add('password-container');

                        const passwordField = document.createElement('div');
                        passwordField.classList.add('password-field');
                        passwordField.textContent = user.password;

                        const copyButton = document.createElement('button');
                        copyButton.textContent = 'Copy';
                        copyButton.classList.add('copy-button');
                            copyButton.addEventListener('click', function() {
                                navigator.clipboard.writeText(user.password)
                                    .then(() => {
                                        alert('Password copied to clipboard!');
                                    })
                                .catch(error => console.error('Failed to copy password:', error));
                                });
                        passwordContainer.appendChild(copyButton);
                        passwordContainer.appendChild(passwordField);

                        userDiv.innerHTML = `
                            <p><strong>Full Name:</strong> ${user.fullName}</p>
                            <p><strong>Username:</strong> ${user.username}</p>
                        `;
                        userDiv.appendChild(passwordContainer);
                        userDataDiv.appendChild(userDiv);
                    });
                })
                .catch(error => console.error('Error getting users:', error));
        });
