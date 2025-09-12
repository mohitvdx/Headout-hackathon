const API_BASE_URL = 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new ApiError(errorData.error || 'Request failed', response.status);
  }
  return response.json();
};

export const api = {
  // Post detection
  detectPostType: async (content, apiKey) => {
    const response = await fetch(`${API_BASE_URL}/posts/detect-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, apiKey }),
    });
    return handleResponse(response);
  },

  // Post generation
  generatePost: async (prompt, apiKey) => {
    const response = await fetch(`${API_BASE_URL}/posts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, apiKey }),
    });
    return handleResponse(response);
  },

  // Posts CRUD
  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    return handleResponse(response);
  },

  getPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    return handleResponse(response);
  },

  updateRSVP: async (postId, status) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/rsvp`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
};

export { ApiError };
