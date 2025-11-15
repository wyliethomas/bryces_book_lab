import OpenAI from 'openai';

class AIService {
  constructor(database) {
    this.database = database;
    this.openai = null;
    this.provider = null;
    this.ollamaUrl = null;
    this.ollamaModel = null;
  }

  async initialize() {
    // Get provider configuration from database
    const provider = this.database.getSetting('llm_provider');

    console.log(`🔍 LLM Provider from database: "${provider}"`);

    // If no provider is configured, skip initialization (onboarding not complete)
    if (!provider) {
      console.log('⏸️  No LLM provider configured yet. Waiting for onboarding...');
      this.provider = null;
      return;
    }

    this.provider = provider;
    console.log(`🔍 Using provider: "${this.provider}"`);

    if (this.provider === 'openai') {
      await this.initializeOpenAI();
    } else if (this.provider === 'ollama') {
      await this.initializeOllama();
    }
  }

  async initializeOpenAI() {
    const apiKey = this.database.getDecryptedSetting('openai_api_key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please configure it in settings or add OPENAI_API_KEY to your .env file.');
    }
    console.log('✅ OpenAI API key loaded');
    this.openai = new OpenAI({ apiKey });
  }

  async initializeOllama() {
    this.ollamaUrl = this.database.getSetting('ollama_url') || 'http://localhost:11434';
    this.ollamaModel = this.database.getSetting('ollama_model') || 'llama3.2';
    console.log(`✅ Ollama configured: ${this.ollamaUrl} (model: ${this.ollamaModel})`);
  }

  async callOllama(messages, temperature = 0.7, maxTokens = 1000) {
    try {
      console.log(`🤖 Calling Ollama: ${this.ollamaUrl} (model: ${this.ollamaModel})`);

      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.ollamaModel,
          messages: messages,
          stream: false,
          options: {
            temperature: temperature,
            num_predict: maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Ollama response received (${data.message.content.length} chars)`);
      return data.message.content;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      throw new Error(`Failed to call Ollama: ${error.message}`);
    }
  }

  async callLLM(messages, temperature = 0.7, maxTokens = 1000) {
    // Check if provider is configured
    if (!this.provider) {
      throw new Error('LLM provider not configured. Please complete the onboarding process in Settings.');
    }

    if (this.provider === 'openai') {
      if (!this.openai) {
        await this.initializeOpenAI();
      }
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
      });
      return completion.choices[0].message.content;
    } else if (this.provider === 'ollama') {
      return await this.callOllama(messages, temperature, maxTokens);
    } else {
      throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }

  async extractTopics(text) {
    try {
      const response = await this.callLLM([
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts topics from text. Return only topic names as a comma-separated list.',
        },
        {
          role: 'user',
          content: `Analyze the following paragraph and identify 1-3 relevant topics or themes. Return only the topic names as a comma-separated list. Be specific and use clear, concise topic names.\n\nParagraph: ${text}`,
        },
      ], 0.7, 100);

      const topics = response
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      return topics;
    } catch (error) {
      console.error('Error extracting topics:', error);
      throw new Error(`Failed to extract topics: ${error.message}`);
    }
  }

  async processNotes(text) {
    try {
      // Split text into paragraphs
      const paragraphs = text
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 20); // Skip very short paragraphs

      const results = [];

      for (const paragraph of paragraphs) {
        // Extract topics for this paragraph
        const topics = await this.extractTopics(paragraph);

        // Create note in database
        const note = this.database.createNote({ content: paragraph });

        // Create/get topics and link to note
        const topicIds = [];
        for (const topicName of topics) {
          const topic = this.database.createTopic(topicName);
          topicIds.push(topic.id);
          this.database.linkNoteToTopic(note.id, topic.id);
        }

        results.push({
          noteId: note.id,
          topics: topics,
          content: paragraph.substring(0, 100) + '...',
        });
      }

      return {
        success: true,
        processedCount: paragraphs.length,
        results,
      };
    } catch (error) {
      console.error('Error processing notes:', error);
      throw new Error(`Failed to process notes: ${error.message}`);
    }
  }

  async generateOutline(topic, notes) {
    try {
      const notesContent = notes.map((n, i) => `${i + 1}. ${n.content}`).join('\n\n');

      const response = await this.callLLM([
        {
          role: 'system',
          content: 'You are a professional book writing assistant. Create detailed, well-structured chapter outlines.',
        },
        {
          role: 'user',
          content: `You are helping write a book chapter about "${topic}". Based on these notes, create a detailed chapter outline with main sections and key points.

Notes:
${notesContent}

Return a structured outline with:
- Introduction
- Main sections (3-5)
- Conclusion

Format the outline with clear headers and bullet points.`,
        },
      ], 0.7, 1000);

      return response;
    } catch (error) {
      console.error('Error generating outline:', error);
      throw new Error(`Failed to generate outline: ${error.message}`);
    }
  }

  async refineOutline(outline, instructions) {
    try {
      const response = await this.callLLM([
        {
          role: 'system',
          content: 'You are a professional book writing assistant. Refine chapter outlines based on user feedback.',
        },
        {
          role: 'user',
          content: `Here is a chapter outline:\n\n${outline}\n\nPlease refine it based on these instructions: ${instructions}\n\nReturn the improved outline maintaining the same structure.`,
        },
      ], 0.7, 1000);

      return response;
    } catch (error) {
      console.error('Error refining outline:', error);
      throw new Error(`Failed to refine outline: ${error.message}`);
    }
  }

  async generateChapter(outline, notes) {
    try {
      const notesContent = notes.map((n, i) => `${i + 1}. ${n.content}`).join('\n\n');

      const response = await this.callLLM([
        {
          role: 'system',
          content: 'You are a professional book writer. Write engaging, well-structured chapters with smooth transitions and professional prose.',
        },
        {
          role: 'user',
          content: `Write a complete book chapter based on this outline and source notes. Use professional, engaging writing. Include smooth transitions. Aim for approximately 2000-3000 words.

Outline:
${outline}

Source Notes:
${notesContent}

Write the complete chapter in HTML format suitable for a rich text editor. Use <h2> for section headers, <p> for paragraphs, and appropriate formatting.`,
        },
      ], 0.8, 4000);

      return response;
    } catch (error) {
      console.error('Error generating chapter:', error);
      throw new Error(`Failed to generate chapter: ${error.message}`);
    }
  }

  async refineContent(content, instructions) {
    try {
      const response = await this.callLLM([
        {
          role: 'system',
          content: 'You are a professional book editor. Refine and improve text based on specific instructions while maintaining the author\'s voice.',
        },
        {
          role: 'user',
          content: `Here is some text from a book chapter:\n\n${content}\n\nPlease refine it based on these instructions: ${instructions}\n\nReturn the improved text in HTML format.`,
        },
      ], 0.7, 2000);

      return response;
    } catch (error) {
      console.error('Error refining content:', error);
      throw new Error(`Failed to refine content: ${error.message}`);
    }
  }
}

export default AIService;
