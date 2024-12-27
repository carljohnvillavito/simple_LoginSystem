        document.addEventListener('DOMContentLoaded', function() {
                 const registerForm = document.getElementById('registerForm');
                 const successPopup = document.getElementById('successPopup');
                const successMessage = document.getElementById('successMessage');
                  const closePopup = document.getElementById('closePopup');
                 const passwordFields = document.querySelectorAll("input[type='password']");
                 const welcomeTextElement = document.getElementById('welcomeText');
                const welcomeMessage = welcomeTextElement?.textContent;

                function typeText(index) {
                     if (welcomeTextElement){
                            if (index < welcomeMessage.length) {
                            welcomeTextElement.textContent = welcomeMessage.substring(0, index + 1) ;
                              setTimeout(() => typeText(index+1), 30);
                        } else{
                            setTimeout(()=> {
                                welcomeTextElement.textContent = '';
                                 typeText(0);
                             },2000)
                       }
                     }
                    }
                typeText(0);


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
                             const successMessageElement = doc.querySelector('#successMessage');
                            if(errorMessage){
                                successMessage.textContent = '';
                                successPopup.style.display = 'block';
                                successMessage.textContent = errorMessage.textContent;
                            }
                             else if(successMessageElement){
                                 const successText = successMessageElement.textContent;
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
