import { writable } from 'svelte/store';

// Check if we have a token in local storage
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
const storedMustChange = localStorage.getItem('mustChangePassword') === 'true';

export const auth = writable({
    isAuthenticated: !!storedToken,
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,
    mustChangePassword: storedMustChange,
});

export function login(token, user, mustChangePassword) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('mustChangePassword', mustChangePassword);
    auth.set({ isAuthenticated: true, token, user, mustChangePassword });
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mustChangePassword');
    auth.set({ isAuthenticated: false, token: null, user: null, mustChangePassword: false });
}
