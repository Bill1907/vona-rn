# Conversation Feature

This feature provides conversation management capabilities with AI-powered title generation using OpenAI.

## Overview

The conversation feature includes:

- AI-powered conversation title generation using OpenAI
- Conversation statistics calculation
- Category suggestion based on content analysis
- Integration with edge functions for scalable processing

## Components

### Types (`types/index.ts`)

- `ConversationMessage`: Individual message structure
- `Conversation`: Complete conversation structure
- `ConversationSummaryResponse`: API response structure

### Services (`services/index.ts`)

- `generateConversationTitle()`: AI-powered title generation using edge function
- `suggestConversationCategory()`: Content-based category suggestion
- `calculateConversationStats()`: Statistical analysis of conversations

### Hooks (`hooks/useConversationTitle.ts`)

- `useConversationTitle()`: React hook for managing title generation state

## Usage

### Basic Title Generation

```typescript
import { useConversationTitle } from "@/features/conversation";

const { generateTitle, isGenerating, error } = useConversationTitle();

// Generate title for a conversation
const title = await generateTitle(messages, 30);
```

### Direct Service Usage

```typescript
import {
  generateConversationTitle,
  calculateConversationStats,
} from "@/features/conversation";

// Generate title
const title = await generateConversationTitle(messages);

// Calculate statistics
const stats = calculateConversationStats(messages);
```

## Edge Function Integration

The feature integrates with the `summarize-conversation` edge function which:

- Uses OpenAI GPT-3.5-turbo for intelligent title generation
- Handles error cases gracefully with fallback strategies
- Supports customizable maximum title lengths
- Provides CORS support for cross-origin requests

## AI-Powered Features

### Title Generation

- Uses OpenAI to analyze conversation context
- Generates meaningful, concise titles
- Falls back to simple text extraction if AI fails
- Supports customizable length limits

### Category Suggestion

- Analyzes user messages for keywords
- Suggests appropriate categories (Development, Translation, Q&A, Writing, etc.)
- Extensible keyword-based classification

### Statistics

- Counts total messages, user/assistant split
- Calculates total word count
- Estimates reading time (200 words/minute)

## Configuration

### Environment Variables

Make sure to set up the following in your edge function environment:

- `OPENAI_API_KEY`: Your OpenAI API key for title generation

### Edge Function Deployment

Deploy the `summarize-conversation` function to your Supabase project:

```bash
supabase functions deploy summarize-conversation
```

## Error Handling

The feature includes comprehensive error handling:

- Network failures gracefully fall back to local title generation
- Invalid API responses are handled with appropriate fallbacks
- All errors are logged for debugging purposes
- User experience remains smooth even when AI services are unavailable

## Future Enhancements

- Support for multiple languages in title generation
- More sophisticated category classification using ML
- Conversation sentiment analysis
- Export capabilities with proper formatting
