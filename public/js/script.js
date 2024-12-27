 document.getElementById('usersButton').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/admin/users')
      .then(response => response.json())
      .then(data => {
          console.log("Users:", data);
          alert("Check console for user data");
        })
      .catch(error => console.error('Error getting users:', error));
});
