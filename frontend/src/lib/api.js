export const API_URL = '/api';

export async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'API Request Failed');
        }
        return data;
    } catch (error) {
        throw error;
    }
}

export async function uploadFiles(files, token) {
    const formData = new FormData();
    // 'files' is a FileList or array of Files
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Upload Failed');
    }
    return data;
}
