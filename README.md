# AI Communication Solution – Superteam Vietnam

## Overview

This AI-powered communication solution streamlines interactions within Superteam Vietnam by integrating a Retrieval-Augmented Generation (RAG) pipeline with Telegram, enabling efficient document management, real-time content drafting, and member discovery.

## Features

- **AI-Driven Telegram Bot** – Enhances team communication with instant responses.
- **Superteam Member Finder** – Quickly locates relevant members based on expertise.
- **Document Management System** – Upload, retrieve, and manage knowledge sources.
- **AI Content Drafting** – Integrates with Twitter for automated content generation.

## Prerequisites

Ensure the following services are installed and running locally:

- **Redis** – Caching layer for efficient data retrieval.
- **Ollama** – Local LLM deployment for privacy-focused AI processing.
- **MongoDB** – Document store for structured data storage.
- **Pinecone** – Vector database for semantic search and retrieval.

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-repo/ai-communication-solution.git
   cd ai-communication-solution
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a .env file and configure following the .env.example file provided

   ```

   ```

4. **Run the application:**
   ```sh
   npm run dev
   ```

## Telegram Bot Commands

The bot is controlled through the following commands:

- **`/admin`** – Admin panel for document uploads, deletion, and bot management.
- **`/finder`** – Finds relevant Superteam members based on expertise and project requirements.
- **`/contentadvisor`** – Assists in drafting and optimizing content for social media.
- **`/assistant`** – AI-powered general assistant for answering user inquiries.
- **`/portal`** – Knowledge portal for retrieving stored documents and information.

## LLM Functions

### 1. **Knowledge Portal** (`llmKnowledgePortal`)

**Purpose:**  
Retrieves relevant knowledge from the vector database (Pinecone) and generates a response using Ollama.

**Function Signature:**

```ts
async function llmKnowledgePortal(query: string, queryResponse: QueryResponse): Promise<string>;
```

**Parameters:**

- **query** - The user’s question.
- **queryResponse** - The retrieved documents from Pinecone.

### 2. **Member Finder** (`llmMemberFinder`)

**Purpose**:

Finds the most relevant Superteam members based on expertise and project requirements.

**Function Signature:**

```ts
async function llmMemberFinder(
  query: string,
  queryResponse: QueryResponse<RecordMetadata>
): Promise<string>;
```

**Parameters**:

- **query** - The user's request for a specific skill set.
- **queryResponse** - The retrieved member profiles from Pinecone.

### 3. **Tweet Generator** (`llmGenerateTweetSuggestions`)

**Purpose:**

Generates tweet ideas and refines drafts for Superteam Vietnam based on recent tweets, followed accounts, and trending topics.

**Function Signature:**

```ts
async function llmGenerateTweetSuggestions(context: TweetContext, draft?: string): Promise<string>;
```

**Parameters:**

- **context** - Includes recent tweets, followed accounts, and trending topics.
- **draft** (optional) - A tweet draft to refine.

### 4. **Tweet Refinement with Chat History** (`llmGenerateSuggestions`)

**Purpose:**

Refines tweets and provides personalized suggestions based on conversation history.

**Function Signature:**

```ts
async function llmGenerateSuggestions(
  userId: number,
  query: string,
  messageHistory: InteractionHistory[]
): Promise<string>;
```

**Parameters:**

- **userId** - The unique user identifier.
- **query** - The tweet content or request.
- **messageHistory** - Past messages exchanged in the session.

## Live Demo

You can watch a live demo of this application in action on YouTube. The demo showcases the core features and functionality of the LLM-powered system.

[Watch the Live Demo on YouTube](https://youtu.be/WVna-djLfUk)

## Current Deployment Status and Next Steps

The bot is not currently deployed due to the lack of available servers to host the Llama3 model.

Also as this is an MVP, the architecture and codebase are flexible and open to future modifications.
