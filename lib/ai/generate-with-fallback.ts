/**
 * Multi-provider AI content generation with automatic fallback
 * Supports: Gemini, DeepSeek, Groq, Mistral, OpenAI, Claude
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

type AIProvider = 'gemini' | 'deepseek' | 'groq' | 'mistral' | 'openai' | 'claude';

interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

/**
 * Generate AI content with automatic fallback to other providers
 * @param prompt - The prompt to send to AI
 * @param options - Generation options
 * @returns AI-generated content as string
 */
export async function generateContentWithFallback(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const {
    temperature = 0.7,
    maxTokens = 8000,
    responseFormat = 'json',
  } = options;

  // Build list of available providers in priority order
  // Priority: FREE (Gemini, DeepSeek, Groq) > CHEAP (Mistral) > PAID (OpenAI, Claude)
  const availableProviders: AIProvider[] = [];
  if (process.env.GOOGLE_AI_API_KEY) availableProviders.push('gemini');
  if (process.env.DEEPSEEK_API_KEY) availableProviders.push('deepseek');
  if (process.env.GROQ_API_KEY) availableProviders.push('groq');
  if (process.env.MISTRAL_API_KEY) availableProviders.push('mistral');
  if (process.env.OPENAI_API_KEY) availableProviders.push('openai');
  if (process.env.ANTHROPIC_API_KEY) availableProviders.push('claude');

  if (availableProviders.length === 0) {
    throw new Error(
      'No AI API key configured. Please set GOOGLE_AI_API_KEY, DEEPSEEK_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY'
    );
  }

  console.log('🤖 Available AI providers (in priority order):', availableProviders);

  let lastError: Error | null = null;

  // Try each provider in order until one succeeds
  for (const provider of availableProviders) {
    try {
      console.log(`🤖 Trying AI provider: ${provider}`);

      const content = await generateWithProvider(provider, prompt, {
        temperature,
        maxTokens,
        responseFormat,
      });

      console.log(`✅ Successfully generated content with provider: ${provider}`);
      return content;

    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a quota/rate limit error
      const isQuotaError =
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('429') ||
        errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        console.warn(`⚠️ Provider ${provider} quota exceeded, trying next provider...`);
      } else {
        console.error(`❌ Provider ${provider} failed:`, errorMessage);
      }

      // Continue to next provider
      if (availableProviders.indexOf(provider) < availableProviders.length - 1) {
        console.log(`🔄 Trying next provider...`);
      }
    }
  }

  // All providers failed
  console.error('❌ All AI providers failed!');
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Generate content with a specific provider
 */
async function generateWithProvider(
  provider: AIProvider,
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  switch (provider) {
    case 'gemini':
      return await generateWithGemini(prompt, options);

    case 'deepseek':
      return await generateWithDeepSeek(prompt, options);

    case 'groq':
      return await generateWithGroq(prompt, options);

    case 'mistral':
      return await generateWithMistral(prompt, options);

    case 'openai':
      return await generateWithOpenAI(prompt, options);

    case 'claude':
      return await generateWithClaude(prompt, options);

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Generate with Google Gemini
 */
async function generateWithGemini(
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash', // Updated to stable version
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain',
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate with DeepSeek
 */
async function generateWithDeepSeek(
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate with Groq
 */
async function generateWithGroq(
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate with Mistral
 */
async function generateWithMistral(
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate with OpenAI
 */
async function generateWithOpenAI(
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate with Anthropic Claude
 */
async function generateWithClaude(
  prompt: string,
  options: Required<GenerateOptions>
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
