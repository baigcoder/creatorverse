import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AIProvider {
  generateText(prompt: string, options?: AIProviderOptions): Promise<string>;
  generateJSON(prompt: string, options?: AIProviderOptions): Promise<unknown>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface AIProviderOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
}

@Injectable()
export class AIProviderFactory {
  private defaultProvider: string;

  constructor(private configService: ConfigService) {
    this.defaultProvider = 'openai';
  }

  getProvider(provider?: string): AIProvider {
    const name = provider || this.defaultProvider;
    switch (name) {
      case 'openai':
        return new OpenAIProvider(this.configService);
      case 'gemini':
        return new GeminiProvider(this.configService);
      case 'anthropic':
        return new AnthropicProvider(this.configService);
      default:
        return new OpenAIProvider(this.configService);
    }
  }
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('ai.openaiApiKey') || '';
  }

  async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    this.assertConfigured();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) await throwProviderError('OpenAI', response);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateJSON(prompt: string, options?: AIProviderOptions): Promise<unknown> {
    this.assertConfigured();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) await throwProviderError('OpenAI', response);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    return parseProviderJson('OpenAI', content);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    this.assertConfigured();
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) await throwProviderError('OpenAI', response);
    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  }

  private assertConfigured() {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('OpenAI API key is not configured');
    }
  }
}

class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('ai.geminiApiKey') || '';
  }

  async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    this.assertConfigured();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 2000,
          },
        }),
      },
    );

    if (!response.ok) await throwProviderError('Gemini', response);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async generateJSON(prompt: string, options?: AIProviderOptions): Promise<unknown> {
    const text = await this.generateText(prompt, options);
    try {
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      throw new BadGatewayException('Gemini returned invalid JSON');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    this.assertConfigured();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { parts: [{ text }] } }),
      },
    );

    if (!response.ok) await throwProviderError('Gemini', response);
    const data = await response.json();
    return data.embedding?.values || [];
  }

  private assertConfigured() {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Gemini API key is not configured');
    }
  }
}

class AnthropicProvider implements AIProvider {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = configService.get<string>('ai.anthropicApiKey') || '';
  }

  async generateText(prompt: string, options?: AIProviderOptions): Promise<string> {
    this.assertConfigured();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens ?? 2000,
        messages: [{ role: 'user', content: prompt }],
        ...(options?.systemPrompt ? { system: options.systemPrompt } : {}),
      }),
    });

    if (!response.ok) await throwProviderError('Anthropic', response);
    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  async generateJSON(prompt: string, options?: AIProviderOptions): Promise<unknown> {
    const systemPrompt = `${options?.systemPrompt || ''}\n\nYou must respond with valid JSON only.`.trim();
    const text = await this.generateText(prompt, { ...options, systemPrompt });
    try {
      return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      throw new BadGatewayException('Anthropic returned invalid JSON');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    throw new Error('Anthropic does not provide embedding models. Use OpenAI or Gemini for embeddings.');
  }

  private assertConfigured() {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Anthropic API key is not configured');
    }
  }
}

async function throwProviderError(provider: string, response: Response): Promise<never> {
  const body = await response.text().catch(() => '');
  throw new BadGatewayException(`${provider} request failed with HTTP ${response.status}${body ? `: ${body.slice(0, 300)}` : ''}`);
}

function parseProviderJson(provider: string, content: string) {
  try {
    return JSON.parse(content);
  } catch {
    throw new BadGatewayException(`${provider} returned invalid JSON`);
  }
}
