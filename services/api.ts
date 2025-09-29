import { supabase } from './supabaseClient';

const getApiUrl = (endpoint: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
        throw new Error("Supabase URL is not configured in environment variables.");
    }
    // Supabase Edge Functions are exposed under the /functions/v1/ path
    return `${supabaseUrl}/functions/v1/${endpoint}`;
};

// A helper function to make authenticated API requests to our backend
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        throw new Error('User is not authenticated.');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
    };

    const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => {
            return { error: `HTTP error! status: ${response.status}` };
        });
        throw new Error(errorData.error || 'An unknown API error occurred.');
    }

    // If the response has no content, return a success indicator
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { success: true };
    }

    return response.json();
};