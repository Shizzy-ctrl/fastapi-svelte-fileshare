<script>
  import { apiRequest } from '../lib/api.js';
  import { auth } from '../lib/auth.js';
  import { login } from '../lib/auth.js';

  let newPassword = '';
  let confirmPassword = '';
  let error = '';
  let success = '';

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }
    if (newPassword.length < 6) {
      error = "Password must be at least 6 characters";
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$auth.token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Change password failed');

      success = "Password changed successfully! You will be redirected soon.";
      
      // Update local storage and state
      const user = $auth.user;
      const token = $auth.token;
      setTimeout(() => {
        login(token, user, false);
      }, 2000);
      
    } catch (e) {
      error = e.message;
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
  <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
    <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white">Change your password</h2>
    <p class="text-sm text-center text-gray-600 dark:text-gray-400">
      This is your first login or your password was reset. Please set a new password.
    </p>
    
    {#if error}
      <div class="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-400" role="alert">
        <span class="font-medium">Error!</span> {error}
      </div>
    {/if}

    {#if success}
      <div class="p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/50 dark:text-green-400" role="alert">
        <span class="font-medium">Success!</span> {success}
      </div>
    {/if}

    <form class="space-y-4" on:submit|preventDefault={handleChangePassword}>
      <div>
        <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
        <input 
          type="password" 
          id="new-password" 
          bind:value={newPassword} 
          required 
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder="••••••••"
        />
      </div>
      <div>
        <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
        <input 
          type="password" 
          id="confirm-password" 
          bind:value={confirmPassword} 
          required 
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-900 dark:border-zinc-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
          placeholder="••••••••"
        />
      </div>
      <button 
        type="submit" 
        class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Set new password
      </button>
    </form>
  </div>
</div>
