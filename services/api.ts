import { showToast } from "@/components/Toast";
import { BACKEND_URL } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RequestConfig extends RequestInit {
  token?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const token = await AsyncStorage.getItem("token");
    const { token: configToken, ...restConfig } = config;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(config.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      ...restConfig,
      headers,
    };

    const generateCurlCommand = (url: string, options: RequestInit) => {
      const headers = options.headers ? Object.entries(options.headers)
        .map(([key, value]) => `-H '${key}: ${value}'`)
        .join(' ') : '';
      
      const method = options.method || 'GET';
      const body = options.body ? `-d '${options.body}'` : '';
      
      return `curl -X ${method} ${headers} ${body} '${url}'`;
    };

    // console.log('CURL Command:', generateCurlCommand(url, options));
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(data, '333')
      showToast(data.message || "API request failed", false);
      throw new Error(data.message || "API request failed");
    }

    // Always wrap response in { data }
    return data.data;
  }

  public async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  public async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  public async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }

  public async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiService(BACKEND_URL);
