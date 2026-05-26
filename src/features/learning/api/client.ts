import { learningStorage } from '@/features/learning/lib/storage';

const API_URL = import.meta.env.VITE_LEARNING_API_URL || 'http://localhost:5000/api/v1';

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!options.skipAuth) {
    const token = learningStorage.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new ApiClientError(data?.message || 'Request failed.', response.status);
  }

  return data as T;
}

export { API_URL };
