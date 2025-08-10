document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.origin;
    const form = document.getElementById('userForm');
    const loadBtn = document.getElementById('loadUsers');
    const tbody = document.querySelector('#usersTable tbody');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('name').value,
            items: document.getElementById('items').value,
            date: document.getElementById('date').value
        };
        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) throw new Error('Failed to save');
            alert('User saved successfully!');
            form.reset();
            loadUsers();
        } catch (error) {
            alert('Error saving user');
        }
    });

    loadBtn.addEventListener('click', loadUsers);

    async function loadUsers() {
        try {
            const response = await fetch(`${API_BASE}/users`);
            if (!response.ok) throw new Error('Failed to load');
            const users = await response.json();
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.items}</td>
                    <td>${user.date}</td>
                    <td>
                        <button onclick="editUser('${encodeURIComponent(user.name)}')">Edit</button>
                        <button onclick="deleteUser('${encodeURIComponent(user.name)}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            alert('Error loading users');
        }
    }

    // Initial load
    loadUsers();
});

// DELETE
window.deleteUser = async function(name) {
    const API_BASE = window.location.origin;
    if (!confirm(`Delete user ${decodeURIComponent(name)}?`)) return;
    try {
        const response = await fetch(`${API_BASE}/users/name/${name}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete failed');
        alert('User deleted');
        document.getElementById('loadUsers').click();
    } catch (error) {
        alert('Error deleting user');
    }
}

// EDIT
window.editUser = function(name) {
    const row = Array.from(document.querySelectorAll('#usersTable tbody tr'))
        .find(tr => tr.children[0].textContent === decodeURIComponent(name));
    if (!row) return;
    document.getElementById('name').value = row.children[0].textContent;
    document.getElementById('items').value = row.children[1].textContent;
    document.getElementById('date').value = row.children[2].textContent;
    // Change form submit to update
    const form = document.getElementById('userForm');
    form.onsubmit = async function(e) {
        e.preventDefault();
        try {
            const response = await fetch(`${window.location.origin}/users/name/${name}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: document.getElementById('items').value,
                    date: document.getElementById('date').value
                })
            });
            if (!response.ok) throw new Error('Update failed');
            alert('User updated!');
            form.reset();
            form.onsubmit = null; // Restore default
            document.addEventListener('submit', formSubmitHandler);
            document.getElementById('loadUsers').click();
        } catch (error) {
            alert('Error updating user');
        }
    };
    // Remove default submit handler to avoid duplicate
    document.removeEventListener('submit', formSubmitHandler);
};

// Helper to restore default submit
function formSubmitHandler(e) {
    e.preventDefault();
    // ...same as above, or reload page...
}