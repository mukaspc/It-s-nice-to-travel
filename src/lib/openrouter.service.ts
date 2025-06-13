/**
 * OpenRouter Service
 * Provides unified access to various LLM models through OpenRouter API
 */

import type {
  OpenRouterConfig,
  Message,
  ChatOptions,
  ChatResponse,
  CreditInfo,
  Model,
  ConversationContext,
  CacheOptions
} from "./openrouter.types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  enabled: true,
  ttl: 3600, // 1 hour
  maxSize: 100
};

/**
 * OpenRouter service class providing unified access to LLM models
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly defaultModel: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly cacheOptions: CacheOptions;
  private readonly responseCache: Map<string, { response: ChatResponse; timestamp: number }>;
  private readonly conversations: Map<string, ConversationContext>;

  /**
   * Creates a new instance of OpenRouterService
   * @param config Service configuration
   */
  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    if (!config.siteUrl) {
      throw new Error("Site URL is required");
    }
    if (!config.siteName) {
      throw new Error("Site name is required");
    }

    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel ?? "openai/gpt-4o-mini";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer": config.siteUrl,
      "X-Title": config.siteName
    };
    this.cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...config.cacheOptions };
    this.responseCache = new Map();
    this.conversations = new Map();

    // Start cache cleanup interval
    if (this.cacheOptions.enabled) {
      setInterval(() => this.cleanupCache(), this.cacheOptions.ttl * 1000);
    }
  }

  /**
   * Creates a new conversation context
   * @param model Initial model for the conversation
   * @returns Conversation context
   */
  public createConversation(model: string = this.defaultModel): ConversationContext {
    const context: ConversationContext = {
      id: crypto.randomUUID(),
      messages: [],
      model,
      totalTokens: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(context.id, context);
    return context;
  }

  /**
   * Adds a message to a conversation context
   * @param contextId Conversation context ID
   * @param message Message to add
   * @throws Error if context not found
   */
  public addMessageToContext(contextId: string, message: Message): void {
    const context = this.conversations.get(contextId);
    if (!context) {
      throw new Error(`Conversation context not found: ${contextId}`);
    }

    context.messages.push(message);
    context.updatedAt = new Date();
    this.conversations.set(contextId, context);
  }

  /**
   * Sends a chat request to the model
   * @param messages Array of messages for the conversation
   * @param options Chat configuration options
   * @returns Promise with chat response
   */
  public async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    this.validateMessages(messages);
    this.validateChatOptions(options);

    const data = {
      messages,
      model: options.model ?? this.defaultModel,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      response_format: options.response_format,
      stream: false
    };

    // Check cache if enabled
    if (options.cache !== false && this.cacheOptions.enabled) {
      const cacheKey = this.generateCacheKey(data);
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    const response = await this.makeRequest<ChatResponse>("/chat/completions", data, options.signal);

    // Cache response if enabled
    if (options.cache !== false && this.cacheOptions.enabled) {
      const cacheKey = this.generateCacheKey(data);
      this.cacheResponse(cacheKey, response);
    }

    return response;
  }

  /**
   * Sends a streaming chat request to the model
   * @param messages Array of messages for the conversation
   * @param options Chat configuration options
   * @returns AsyncGenerator yielding chat response chunks
   */
  public async *streamChat(
    messages: Message[],
    options: ChatOptions = {}
  ): AsyncGenerator<ChatResponse, void, unknown> {
    this.validateMessages(messages);
    this.validateChatOptions(options);

    const data = {
      messages,
      model: options.model ?? this.defaultModel,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      response_format: options.response_format,
      stream: true
    };

    const response = await this.makeRequestWithRetry(async () => {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
        signal: options.signal
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw this.handleError(res.status, error);
      }

      return res;
    });

    if (!response.body) {
      throw new Error("No response body received");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;
            try {
              const chunk = JSON.parse(data) as ChatResponse;
              yield chunk;
            } catch (e) {
              console.error("Failed to parse chunk:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Retrieves list of available models
   * @returns Promise with array of available models
   */
  public async getModelsList(): Promise<Model[]> {
    const response = await this.makeRequestWithRetry(async () => {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: this.defaultHeaders
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw this.handleError(res.status, error);
      }

      return res;
    });

    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.name,
      maxTokens: model.context_length,
      pricePerToken: {
        prompt: model.pricing.prompt,
        completion: model.pricing.completion
      }
    }));
  }

  /**
   * Retrieves account credit information
   * @returns Promise with credit information
   */
  public async getCredits(): Promise<CreditInfo> {
    const response = await this.makeRequestWithRetry(async () => {
      const res = await fetch(`${this.baseUrl}/credits`, {
        headers: this.defaultHeaders
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw this.handleError(res.status, error);
      }

      return res;
    });

    const data = await response.json();
    return {
      total: data.total,
      used: data.used,
      remaining: data.remaining
    };
  }

  /**
   * Validates messages array
   * @param messages Array of messages to validate
   * @throws Error if validation fails
   */
  private validateMessages(messages: Message[]): void {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array must not be empty");
    }

    for (const message of messages) {
      if (!message.content) {
        throw new Error("Message content cannot be empty");
      }
      if (!["system", "user", "assistant"].includes(message.role)) {
        throw new Error(`Invalid message role: ${message.role}`);
      }
    }
  }

  /**
   * Validates chat options
   * @param options Chat options to validate
   * @throws Error if validation fails
   */
  private validateChatOptions(options: ChatOptions): void {
    if (options.temperature !== undefined) {
      if (typeof options.temperature !== "number" || options.temperature < 0 || options.temperature > 2) {
        throw new Error("Temperature must be a number between 0 and 2");
      }
    }

    if (options.max_tokens !== undefined) {
      if (!Number.isInteger(options.max_tokens) || options.max_tokens < 1) {
        throw new Error("max_tokens must be a positive integer");
      }
    }

    if (options.response_format !== undefined) {
      if (options.response_format.type !== "json_object") {
        throw new Error('response_format.type must be "json_object"');
      }
      if (options.response_format.schema && typeof options.response_format.schema !== "object") {
        throw new Error("response_format.schema must be an object");
      }
    }
  }

  /**
   * Makes a request to OpenRouter API
   * @param endpoint API endpoint
   * @param data Request data
   * @param signal AbortSignal for request cancellation
   * @returns Promise with response data
   */
  private async makeRequest<T>(
    endpoint: string, 
    data: unknown, 
    signal?: AbortSignal
  ): Promise<T> {
    const response = await this.makeRequestWithRetry(async () => {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
        signal
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        throw this.handleError(res.status, error);
      }

      return res;
    });

    return response.json();
  }

  /**
   * Makes a request with retry mechanism
   * @param fn Function to retry
   * @returns Promise with response
   */
  private async makeRequestWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    let delay = INITIAL_RETRY_DELAY;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && 
            (error.message.includes("Rate limit") || error.message.includes("Server error"))) {
          if (attempt === MAX_RETRIES) break;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error;
        }
      }
    }

    throw lastError ?? new Error("Max retries exceeded");
  }

  /**
   * Handles API errors
   * @param status HTTP status code
   * @param error Error response
   * @returns Error with appropriate message
   */
  private handleError(status: number, error: unknown): Error {
    let errorMessage = 'Unknown error occurred';
    
    if (error && typeof error === 'object') {
      if ('error' in error && error.error) {
        errorMessage = typeof error.error === 'string' 
          ? error.error 
          : JSON.stringify(error.error);
      } else {
        errorMessage = JSON.stringify(error);
      }
    }

    switch (status) {
      case 401:
      case 403:
        return new Error(`Authentication failed. Please check your API key. Details: ${errorMessage}`);
      case 429:
        return new Error(`Rate limit exceeded. Please try again later. Details: ${errorMessage}`);
      case 500:
      case 502:
      case 503:
      case 504:
        return new Error(`Server error. Please try again later. Details: ${errorMessage}`);
      default:
        return new Error(`API request failed: ${errorMessage}`);
    }
  }

  /**
   * Generates a cache key for request data
   * @param data Request data
   * @returns Cache key
   */
  private generateCacheKey(data: unknown): string {
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  /**
   * Gets a cached response if available and not expired
   * @param key Cache key
   * @returns Cached response or undefined
   */
  private getCachedResponse(key: string): ChatResponse | undefined {
    const cached = this.responseCache.get(key);
    if (!cached) return undefined;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheOptions.ttl * 1000) {
      this.responseCache.delete(key);
      return undefined;
    }

    return cached.response;
  }

  /**
   * Caches a response
   * @param key Cache key
   * @param response Response to cache
   */
  private cacheResponse(key: string, response: ChatResponse): void {
    if (this.responseCache.size >= this.cacheOptions.maxSize) {
      // Remove oldest entry if exists
      const oldestKey = this.responseCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.responseCache.delete(oldestKey);
      }
    }

    this.responseCache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Cleans up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.cacheOptions.ttl * 1000) {
        this.responseCache.delete(key);
      }
    }
  }
} 