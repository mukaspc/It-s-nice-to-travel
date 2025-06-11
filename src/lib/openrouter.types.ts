/**
 * OpenRouter service types
 */

export interface OpenRouterConfig {
  apiKey: string;
  siteUrl: string;
  siteName: string;
  defaultModel?: string;
  cacheOptions?: CacheOptions;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: "json_object";
    schema?: object;
  };
  stream?: boolean;
  signal?: AbortSignal;
  cache?: boolean;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CreditInfo {
  total: number;
  used: number;
  remaining: number;
}

export interface Model {
  id: string;
  name: string;
  maxTokens: number;
  pricePerToken: {
    prompt: number;
    completion: number;
  };
}

export interface ConversationContext {
  id: string;
  messages: Message[];
  model: string;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CacheOptions {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of cached responses
} 