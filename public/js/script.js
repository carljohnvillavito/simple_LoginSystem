        document.addEventListener('DOMContentLoaded', function() {
                const registerForm = document.getElementById('registerForm');
                 const successPopup = document.getElementById('successPopup');
                 const successMessage = document.getElementById('successMessage');
                 const closePopup = document.getElementById('closePopup');
                 const passwordFields = document.querySelectorAll("input[type='password']");
                 const messageArea = document.getElementById('messageArea');
                const messageInput = document.getElementById('messageInput');
                const sendButton = document.getElementById('sendButton');

                function fetchMessages() {
                    fetch('/chat/messages')
                        .then(response => response.json())
                        .then(messages => {
                                messageArea.innerHTML = ''; // Clear previous messages
                                messages.forEach(msg => {
                                        const messageDiv = document.createElement('div');
                                        messageDiv.classList.add('message');
                                        messageDiv.innerHTML = `
                                         <div class="message-content">
                                             <span class="username">${msg.username}:</span>
                                            <span class="message-text">  ${msg.message}</span>
                                            <span class="timestamp">${msg.timestamp}</span>
                                        </div>`;
                                        messageArea.appendChild(messageDiv);
                                });
                            messageArea.scrollTop = messageArea.scrollHeight;
                          })
                        .catch(error => console.error('Error fetching messages:', error));
                }
            // Fetch messages initially and set up interval
            fetchMessages();
           setInterval(fetchMessages, 1000);


                 if (registerForm) {
                    registerForm.addEventListener('submit', function(event) {
                      event.preventDefault();
                      const formData = new URLSearchParams(new FormData(registerForm)).toString();

                      fetch('/register', {
                         method: 'POST',
                         headers: {
                             'Content-Type': 'application/x-www-form-urlencoded',
                          },
                          body: formData,
                       })
                         .then(response => {
                            if (response.ok) {
                                 return response.text();
                            } else {
                                 throw new Error('Registration failed');
                            }
                         })
                         .then(html => {
                             const parser = new DOMParser();
                             const doc = parser.parseFromString(html, 'text/html');
                             const errorMessage = doc.querySelector('.error');
                              if(errorMessage){
                                  successMessage.textContent = '';
                                  successPopup.style.display = 'block';
                                  successMessage.textContent = errorMessage.textContent;
                              }
                              else {
                                   const successText = doc.querySelector('#successMessage').textContent;
                                  successMessage.textContent = successText;
                                  successPopup.style.display = 'block';
                                  passwordFields.forEach(field => {
                                        field.value = '';
                                    });
                                    registerForm.reset();
                              }

                         })
                         .catch(error => {
                             successMessage.textContent = 'An error occurred during registration.';
                             successPopup.style.display = 'block';
                             console.error(error);
                        });
                    });
               }
               closePopup.addEventListener('click', function() {
                    successPopup.style.display = 'none';
               });
               sendButton.addEventListener('click', function(event) {
                event.preventDefault();
                 const message = messageInput.value.trim();

                if(message) {
                    fetch('/chat/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({message}),
                    })
                    .then(() => {
                       messageInput.value = '';
                        fetchMessages();
                    })
                   .catch(error => console.error('Error sending message', error));
                }
            });


    });

     function togglePassword(inputId) {
             const passwordInput = document.getElementById(inputId);
            if (passwordInput.type === "password") {
                  passwordInput.type = "text";
            } else {
                 passwordInput.type = "password";
           }
     }
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
