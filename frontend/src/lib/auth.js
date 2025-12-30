import { writable } from 'svelte/store';

// Check if we have a token in local storage
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const auth = writable({
    isAuthenticated: !!storedToken,
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,
});

export function login(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    auth.set({ isAuthenticated: true, token, user });
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    auth.set({ isAuthenticated: false, token: null, user: null });
}
