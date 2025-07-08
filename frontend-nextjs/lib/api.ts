import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or other headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.code === 'ECONNREFUSED') {
      console.error('Server connection refused. Is the backend server running?')
    } else if (error.response?.status === 500) {
      console.error('Internal server error')
    } else if (error.response?.status === 404) {
      console.error('API endpoint not found')
    }
    
    return Promise.reject(error)
  }
)

// API endpoint functions
export const api = {
  // Health check
  health: () => apiClient.get('/health'),
  
  // Instagram endpoints
  instagram: {
    login: (username: string, password: string) =>
      apiClient.post('/instagram/login', { username, password }),
    status: () => apiClient.get('/instagram/status'),
    post: (filename: string, customCaption?: string) =>
      apiClient.post('/instagram/post', { filename, custom_caption: customCaption }),
    postNext: () => apiClient.post('/instagram/post/next'),
  },
  
  // Image processing endpoints
  images: {
    upload: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    process: (data: {
      filename: string
      custom_caption?: string
      watermark_text?: string
      watermark_opacity?: number
    }) => apiClient.post('/process', data),
    processed: () => apiClient.get('/images/processed'),
    posted: () => apiClient.get('/images/posted'),
    download: (filename: string) => apiClient.get(`/download/${filename}`, {
      responseType: 'blob',
    }),
  },
  
  // MCP protocol endpoint
  mcp: (request: any) => apiClient.post('/mcp', request),
}

export default apiClient
