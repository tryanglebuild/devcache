// Context builder for AI prompts

import { ChatMessage, SearchResult } from './types.ts'

export class ContextBuilder {
  buildSystemPrompt(): ChatMessage {
    return {
      role: 'system',
      content: `You are DevCache AI Assistant, a helpful AI that helps developers find and manage their code snippets, templates, and resources.

Your capabilities:
- Search through user's project items (code snippets, files, folders)
- Find relevant marketplace templates
- Provide actionable recommendations
- Reference specific resources by name

Guidelines:
- Be concise and technical
- Always reference specific resources when available
- Provide code examples when helpful
- Use markdown formatting for better readability
- If you find relevant resources, mention them by name
- Suggest next steps or related resources

Remember: You have access to the user's personal projects and public marketplace templates.`
    }
  }

  buildSearchResultsContext(results: SearchResult[]): ChatMessage | null {
    if (results.length === 0) {
      return null
    }

    const formattedResults = results.map((result, index) => {
      const tags = result.tags.length > 0 ? `\nTags: ${result.tags.join(', ')}` : ''
      const preview = result.content_preview ? `\nPreview: ${result.content_preview}` : ''
      
      return `${index + 1}. **${result.name}** (${result.resource_type})
   Description: ${result.description || 'No description'}${tags}${preview}
   Relevance: ${(result.relevance_score * 100).toFixed(0)}%`
    }).join('\n\n')

    return {
      role: 'system',
      content: `I found ${results.length} relevant resource(s) for this query:

${formattedResults}

Use these resources to provide a helpful response. Reference them by name when relevant.`
    }
  }

  buildConversationHistory(
    messages: Array<{ role: string; content: string }>,
    limit: number = 10
  ): ChatMessage[] {
    return messages
      .slice(-limit)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))
  }

  buildFullContext(
    userMessage: string,
    searchResults: SearchResult[],
    conversationHistory: Array<{ role: string; content: string }>
  ): ChatMessage[] {
    const context: ChatMessage[] = []

    // 1. System prompt
    context.push(this.buildSystemPrompt())

    // 2. Conversation history (last 10 messages)
    const history = this.buildConversationHistory(conversationHistory)
    context.push(...history)

    // 3. Search results context (if any)
    const searchContext = this.buildSearchResultsContext(searchResults)
    if (searchContext) {
      context.push(searchContext)
    }

    // 4. Current user message
    context.push({
      role: 'user',
      content: userMessage
    })

    return context
  }

  estimateTokenCount(messages: ChatMessage[]): number {
    // Rough estimation: 1 token ≈ 4 characters
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0)
    return Math.ceil(totalChars / 4)
  }
}
