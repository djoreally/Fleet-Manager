const API_URL = 'http://localhost:3001/api';

// A helper function to make authenticated API requests to our backend
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => {
            // If the response body is not JSON, create a generic error
            return { error: `HTTP error! status: ${response.status}` };
        });
        throw new Error(errorData.error || 'An unknown API error occurred.');
    }

    // If the response has no content (like a 204 No Content for DELETE), return success
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { success: true };
    }

    return response.json();
};