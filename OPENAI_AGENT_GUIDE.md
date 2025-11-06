# Step-by-Step Guide: Building AI Agents with OpenAI

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Understanding AI Agents](#understanding-ai-agents)
3. [Setup and Configuration](#setup-and-configuration)
4. [Building Your First Agent](#building-your-first-agent)
5. [Advanced Agent Features](#advanced-agent-features)
6. [Best Practices](#best-practices)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Knowledge
- Basic understanding of programming (Python or JavaScript/TypeScript)
- Familiarity with APIs and REST concepts
- Understanding of asynchronous programming
- Basic knowledge of JSON data structures

### Tools and Accounts
- **OpenAI API Key**: Sign up at [platform.openai.com](https://platform.openai.com)
- **Development Environment**: VS Code, PyCharm, or similar
- **Programming Language**: Python 3.8+ or Node.js 16+
- **Package Manager**: pip (Python) or npm/yarn (Node.js)

---

## Understanding AI Agents

### What is an AI Agent?

An AI agent is an autonomous system that can:
- **Perceive** its environment through inputs
- **Reason** about the information using AI models
- **Act** by making decisions and taking actions
- **Learn** from interactions and feedback

### Types of OpenAI Agents

1. **Conversational Agents**: Chat-based interactions
2. **Function-Calling Agents**: Execute tools and APIs
3. **Retrieval Agents**: Search and retrieve information
4. **Multi-Agent Systems**: Multiple agents working together

### Key Components

```
User Input → Agent → LLM (GPT-4) → Tool Execution → Response
                ↑                         ↓
                └─────────  Memory  ──────┘
```

---

## Setup and Configuration

### Step 1: Install Required Packages

#### Python Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install OpenAI SDK
pip install openai

# Install additional libraries
pip install python-dotenv requests
```

#### Node.js Setup
```bash
# Initialize project
npm init -y

# Install OpenAI SDK
npm install openai

# Install additional libraries
npm install dotenv axios
```

### Step 2: Configure API Key

Create a `.env` file:
```env
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o
```

### Step 3: Basic Configuration

#### Python
```python
# config.py
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
```

#### TypeScript/JavaScript
```typescript
// config.ts
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
```

---

## Building Your First Agent

### Step 1: Simple Conversational Agent

#### Python Implementation
```python
# simple_agent.py
from config import client, MODEL

def chat_agent(user_message: str) -> str:
    """Simple agent that responds to user messages."""
    
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content

# Usage
if __name__ == "__main__":
    user_input = "What is an AI agent?"
    response = chat_agent(user_input)
    print(f"Agent: {response}")
```

#### TypeScript Implementation
```typescript
// simpleAgent.ts
import { client, MODEL } from './config';

async function chatAgent(userMessage: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
  
  return response.choices[0].message.content || '';
}

// Usage
(async () => {
  const userInput = "What is an AI agent?";
  const response = await chatAgent(userInput);
  console.log(`Agent: ${response}`);
})();
```

### Step 2: Agent with Memory

#### Python Implementation
```python
# agent_with_memory.py
from typing import List, Dict
from config import client, MODEL

class ConversationalAgent:
    def __init__(self, system_prompt: str = "You are a helpful assistant."):
        self.messages: List[Dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]
    
    def chat(self, user_message: str) -> str:
        """Send a message and maintain conversation history."""
        
        # Add user message to history
        self.messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model=MODEL,
            messages=self.messages,
            temperature=0.7,
            max_tokens=500
        )
        
        # Extract assistant's response
        assistant_message = response.choices[0].message.content
        
        # Add assistant response to history
        self.messages.append({
            "role": "assistant",
            "content": assistant_message
        })
        
        return assistant_message
    
    def clear_history(self):
        """Clear conversation history, keeping system prompt."""
        self.messages = [self.messages[0]]

# Usage
if __name__ == "__main__":
    agent = ConversationalAgent()
    
    # Multi-turn conversation
    print("Agent:", agent.chat("My name is Alice"))
    print("Agent:", agent.chat("What's my name?"))
    print("Agent:", agent.chat("Tell me a joke"))
```

#### TypeScript Implementation
```typescript
// conversationalAgent.ts
import { client, MODEL } from './config';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class ConversationalAgent {
  private messages: Message[];

  constructor(systemPrompt: string = "You are a helpful assistant.") {
    this.messages = [
      { role: "system", content: systemPrompt }
    ];
  }

  async chat(userMessage: string): Promise<string> {
    // Add user message
    this.messages.push({
      role: "user",
      content: userMessage
    });

    // Get response
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: this.messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const assistantMessage = response.choices[0].message.content || '';

    // Add assistant response
    this.messages.push({
      role: "assistant",
      content: assistantMessage
    });

    return assistantMessage;
  }

  clearHistory(): void {
    this.messages = [this.messages[0]];
  }
}

// Usage
(async () => {
  const agent = new ConversationalAgent();
  
  console.log("Agent:", await agent.chat("My name is Alice"));
  console.log("Agent:", await agent.chat("What's my name?"));
  console.log("Agent:", await agent.chat("Tell me a joke"));
})();
```

### Step 3: Agent with Function Calling (Tools)

Function calling allows agents to execute external functions and use real-time data.

#### Python Implementation
```python
# agent_with_tools.py
import json
from datetime import datetime
from config import client, MODEL

# Define tools/functions
def get_current_weather(location: str, unit: str = "celsius") -> str:
    """Simulate getting weather data."""
    return json.dumps({
        "location": location,
        "temperature": "22",
        "unit": unit,
        "forecast": "sunny"
    })

def get_current_time(timezone: str = "UTC") -> str:
    """Get current time."""
    return json.dumps({
        "timezone": timezone,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

# Define tool schemas for OpenAI
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_time",
            "description": "Get the current time in a specific timezone",
            "parameters": {
                "type": "object",
                "properties": {
                    "timezone": {
                        "type": "string",
                        "description": "The timezone, e.g. UTC, America/New_York"
                    }
                },
                "required": []
            }
        }
    }
]

# Map function names to actual functions
available_functions = {
    "get_current_weather": get_current_weather,
    "get_current_time": get_current_time
}

class FunctionCallingAgent:
    def __init__(self):
        self.messages = [
            {"role": "system", "content": "You are a helpful assistant with access to tools."}
        ]
    
    def chat(self, user_message: str) -> str:
        """Chat with function calling support."""
        
        # Add user message
        self.messages.append({"role": "user", "content": user_message})
        
        # Initial API call
        response = client.chat.completions.create(
            model=MODEL,
            messages=self.messages,
            tools=tools,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls
        
        # Check if the model wants to call a function
        if tool_calls:
            # Add assistant's response to messages
            self.messages.append(response_message)
            
            # Execute each tool call
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_functions[function_name]
                function_args = json.loads(tool_call.function.arguments)
                
                # Call the function
                function_response = function_to_call(**function_args)
                
                # Add function response to messages
                self.messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": function_response
                })
            
            # Get final response from the model
            second_response = client.chat.completions.create(
                model=MODEL,
                messages=self.messages
            )
            
            return second_response.choices[0].message.content
        
        # No function call needed
        self.messages.append(response_message)
        return response_message.content

# Usage
if __name__ == "__main__":
    agent = FunctionCallingAgent()
    
    print("Agent:", agent.chat("What's the weather like in London?"))
    print("Agent:", agent.chat("What time is it in New York?"))
```

#### TypeScript Implementation
```typescript
// functionCallingAgent.ts
import { client, MODEL } from './config';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat';

// Define tools
function getCurrentWeather(location: string, unit: string = "celsius"): string {
  return JSON.stringify({
    location,
    temperature: "22",
    unit,
    forecast: "sunny"
  });
}

function getCurrentTime(timezone: string = "UTC"): string {
  return JSON.stringify({
    timezone,
    time: new Date().toISOString()
  });
}

// Define tool schemas
const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_current_weather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA"
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"]
          }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current time in a specific timezone",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description: "The timezone, e.g. UTC, America/New_York"
          }
        }
      }
    }
  }
];

const availableFunctions: { [key: string]: Function } = {
  get_current_weather: getCurrentWeather,
  get_current_time: getCurrentTime
};

class FunctionCallingAgent {
  private messages: ChatCompletionMessageParam[];

  constructor() {
    this.messages = [
      { role: "system", content: "You are a helpful assistant with access to tools." }
    ];
  }

  async chat(userMessage: string): Promise<string> {
    // Add user message
    this.messages.push({ role: "user", content: userMessage });

    // Initial API call
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: this.messages,
      tools: tools,
      tool_choice: "auto"
    });

    const responseMessage = response.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    // Check if function calling is needed
    if (toolCalls && toolCalls.length > 0) {
      // Add assistant's response
      this.messages.push(responseMessage);

      // Execute each tool call
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Call the function
        const functionResponse = functionToCall(...Object.values(functionArgs));

        // Add function response
        this.messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: functionResponse
        });
      }

      // Get final response
      const secondResponse = await client.chat.completions.create({
        model: MODEL,
        messages: this.messages
      });

      return secondResponse.choices[0].message.content || '';
    }

    // No function call needed
    this.messages.push(responseMessage);
    return responseMessage.content || '';
  }
}

// Usage
(async () => {
  const agent = new FunctionCallingAgent();
  
  console.log("Agent:", await agent.chat("What's the weather like in London?"));
  console.log("Agent:", await agent.chat("What time is it in New York?"));
})();
```

---

## Advanced Agent Features

### 1. Streaming Responses

Stream responses for better UX with long outputs.

#### Python
```python
# streaming_agent.py
from config import client, MODEL

def stream_chat(user_message: str):
    """Stream agent responses token by token."""
    
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_message}
        ],
        stream=True
    )
    
    print("Agent: ", end="")
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
    print()

# Usage
if __name__ == "__main__":
    stream_chat("Tell me a long story about space exploration")
```

#### TypeScript
```typescript
// streamingAgent.ts
import { client, MODEL } from './config';

async function streamChat(userMessage: string): Promise<void> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userMessage }
    ],
    stream: true
  });

  process.stdout.write("Agent: ");
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
  
  console.log();
}

// Usage
streamChat("Tell me a long story about space exploration");
```

### 2. Agent with RAG (Retrieval-Augmented Generation)

Enhance agents with external knowledge.

#### Python
```python
# rag_agent.py
from config import client, MODEL
from openai import OpenAI

class RAGAgent:
    def __init__(self, knowledge_base: list):
        """Initialize with a knowledge base (list of documents)."""
        self.knowledge_base = knowledge_base
        self.client = client
    
    def retrieve_relevant_docs(self, query: str, top_k: int = 3) -> list:
        """Retrieve relevant documents using embeddings."""
        
        # Get query embedding
        query_embedding = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        ).data[0].embedding
        
        # Get embeddings for all documents
        doc_embeddings = []
        for doc in self.knowledge_base:
            embedding = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=doc
            ).data[0].embedding
            doc_embeddings.append(embedding)
        
        # Calculate similarity (simplified - use cosine similarity in production)
        from numpy import dot
        from numpy.linalg import norm
        
        similarities = []
        for i, doc_emb in enumerate(doc_embeddings):
            similarity = dot(query_embedding, doc_emb) / (norm(query_embedding) * norm(doc_emb))
            similarities.append((i, similarity))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [self.knowledge_base[i] for i, _ in similarities[:top_k]]
    
    def chat(self, user_message: str) -> str:
        """Chat with RAG support."""
        
        # Retrieve relevant documents
        relevant_docs = self.retrieve_relevant_docs(user_message)
        
        # Create context from retrieved documents
        context = "\n\n".join(relevant_docs)
        
        # Create prompt with context
        system_message = f"""You are a helpful assistant. Use the following context to answer questions:

Context:
{context}

If the answer is not in the context, say so."""
        
        response = self.client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ]
        )
        
        return response.choices[0].message.content

# Usage
if __name__ == "__main__":
    knowledge_base = [
        "Python is a high-level programming language created by Guido van Rossum.",
        "JavaScript was created by Brendan Eich in 1995.",
        "TypeScript is a superset of JavaScript developed by Microsoft."
    ]
    
    agent = RAGAgent(knowledge_base)
    print(agent.chat("Who created Python?"))
```

### 3. Multi-Agent System

Coordinate multiple agents for complex tasks.

#### Python
```python
# multi_agent_system.py
from config import client, MODEL

class SpecializedAgent:
    def __init__(self, name: str, specialty: str):
        self.name = name
        self.specialty = specialty
    
    def process(self, task: str) -> str:
        """Process a task based on specialty."""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"You are {self.name}, specialized in {self.specialty}."
                },
                {
                    "role": "user",
                    "content": task
                }
            ]
        )
        
        return response.choices[0].message.content

class Orchestrator:
    def __init__(self):
        self.agents = {
            "researcher": SpecializedAgent("Research Agent", "finding information and facts"),
            "writer": SpecializedAgent("Writing Agent", "creating well-written content"),
            "critic": SpecializedAgent("Critic Agent", "reviewing and improving content")
        }
    
    def route_task(self, user_request: str) -> str:
        """Route task to appropriate agent."""
        
        # Use LLM to determine which agent should handle the task
        routing_response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a task router. Given a user request, decide which agent should handle it: researcher, writer, or critic. Respond with only the agent name."
                },
                {
                    "role": "user",
                    "content": user_request
                }
            ]
        )
        
        agent_name = routing_response.choices[0].message.content.strip().lower()
        return agent_name
    
    def execute(self, user_request: str) -> str:
        """Execute task using appropriate agent(s)."""
        
        agent_name = self.route_task(user_request)
        
        if agent_name not in self.agents:
            agent_name = "researcher"  # Default
        
        print(f"Routing to: {agent_name}")
        result = self.agents[agent_name].process(user_request)
        
        return result

# Usage
if __name__ == "__main__":
    orchestrator = Orchestrator()
    
    response = orchestrator.execute("Write a blog post about AI agents")
    print(f"\nResponse:\n{response}")
```

### 4. Agent with Structured Output

Use structured outputs for consistent responses.

#### Python
```python
# structured_output_agent.py
from pydantic import BaseModel
from config import client, MODEL

class TaskAnalysis(BaseModel):
    """Structured output for task analysis."""
    complexity: str  # low, medium, high
    estimated_time: str
    required_skills: list[str]
    steps: list[str]
    confidence: float

def analyze_task(task_description: str) -> TaskAnalysis:
    """Analyze a task and return structured output."""
    
    response = client.beta.chat.completions.parse(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a task analysis expert. Analyze tasks and provide structured breakdowns."
            },
            {
                "role": "user",
                "content": f"Analyze this task: {task_description}"
            }
        ],
        response_format=TaskAnalysis
    )
    
    return response.choices[0].message.parsed

# Usage
if __name__ == "__main__":
    result = analyze_task("Build a web scraper for e-commerce sites")
    
    print(f"Complexity: {result.complexity}")
    print(f"Estimated Time: {result.estimated_time}")
    print(f"Required Skills: {', '.join(result.required_skills)}")
    print(f"Steps:")
    for i, step in enumerate(result.steps, 1):
        print(f"  {i}. {step}")
    print(f"Confidence: {result.confidence}")
```

---

## Best Practices

### 1. System Prompt Engineering

Create effective system prompts:

```python
# Good system prompts
system_prompts = {
    "customer_service": """You are a professional customer service agent for XYZ Company.
    - Always be polite and empathetic
    - Prioritize solving the customer's issue
    - Escalate to human agent if unable to resolve
    - Never make promises about refunds without approval
    """,
    
    "code_assistant": """You are an expert programming assistant.
    - Provide clear, well-commented code
    - Explain your reasoning
    - Suggest best practices and optimizations
    - Ask clarifying questions when requirements are unclear
    """,
    
    "data_analyst": """You are a data analysis expert.
    - Break down complex analyses into steps
    - Explain statistical concepts clearly
    - Provide visualizations when helpful
    - Always cite your data sources
    """
}
```

### 2. Error Handling

Implement robust error handling:

```python
# error_handling.py
from openai import OpenAIError, RateLimitError, APIError
import time

def robust_chat(user_message: str, max_retries: int = 3) -> str:
    """Chat with retry logic and error handling."""
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message}
                ],
                timeout=30.0  # 30 second timeout
            )
            return response.choices[0].message.content
            
        except RateLimitError:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limit hit. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                return "Error: Rate limit exceeded. Please try again later."
                
        except APIError as e:
            print(f"API error: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)
            else:
                return "Error: API is currently unavailable."
                
        except Exception as e:
            print(f"Unexpected error: {e}")
            return "Error: An unexpected error occurred."
    
    return "Error: Maximum retries exceeded."
```

### 3. Cost Management

Monitor and control costs:

```python
# cost_management.py
from config import client, MODEL

def estimate_cost(text: str, model: str = MODEL) -> dict:
    """Estimate cost for processing text."""
    
    # Rough token estimation (1 token ≈ 4 characters)
    estimated_tokens = len(text) / 4
    
    # Pricing (as of 2024 - check current pricing)
    pricing = {
        "gpt-4o": {"input": 0.005, "output": 0.015},  # per 1K tokens
        "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03}
    }
    
    model_pricing = pricing.get(model, pricing["gpt-4o"])
    
    return {
        "estimated_tokens": estimated_tokens,
        "estimated_input_cost": (estimated_tokens / 1000) * model_pricing["input"],
        "model": model
    }

class CostTrackingAgent:
    def __init__(self, budget_usd: float = 10.0):
        self.budget = budget_usd
        self.spent = 0.0
        self.messages = []
    
    def chat(self, user_message: str) -> str:
        """Chat with cost tracking."""
        
        # Check budget
        if self.spent >= self.budget:
            return "Budget exceeded. Please increase budget to continue."
        
        # Add message
        self.messages.append({"role": "user", "content": user_message})
        
        # Make API call
        response = client.chat.completions.create(
            model=MODEL,
            messages=self.messages
        )
        
        # Track usage
        usage = response.usage
        input_cost = (usage.prompt_tokens / 1000) * 0.005
        output_cost = (usage.completion_tokens / 1000) * 0.015
        self.spent += (input_cost + output_cost)
        
        assistant_message = response.choices[0].message.content
        self.messages.append({"role": "assistant", "content": assistant_message})
        
        print(f"Cost this request: ${input_cost + output_cost:.4f}")
        print(f"Total spent: ${self.spent:.4f} / ${self.budget:.2f}")
        
        return assistant_message
```

### 4. Testing and Validation

Test your agents thoroughly:

```python
# test_agent.py
import unittest
from your_agent import ConversationalAgent

class TestAgent(unittest.TestCase):
    def setUp(self):
        self.agent = ConversationalAgent()
    
    def test_basic_response(self):
        """Test that agent provides a response."""
        response = self.agent.chat("Hello")
        self.assertIsNotNone(response)
        self.assertGreater(len(response), 0)
    
    def test_memory(self):
        """Test that agent remembers context."""
        self.agent.chat("My name is Alice")
        response = self.agent.chat("What's my name?")
        self.assertIn("Alice", response)
    
    def test_function_calling(self):
        """Test function calling capability."""
        response = self.agent.chat("What's the weather in London?")
        self.assertIsNotNone(response)
        # Add more specific assertions based on expected behavior

if __name__ == "__main__":
    unittest.run()
```

### 5. Security Best Practices

- **Never hardcode API keys** - Use environment variables
- **Validate user inputs** - Prevent injection attacks
- **Rate limiting** - Implement user-level rate limits
- **Content filtering** - Use moderation API for user inputs
- **Logging** - Log interactions for debugging (respect privacy)

```python
# security.py
from openai import OpenAI
import re

client = OpenAI()

def sanitize_input(user_input: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    # Remove potential system prompt injections
    blocked_patterns = [
        r"ignore previous instructions",
        r"disregard",
        r"system:",
        r"<\|.*?\|>"
    ]
    
    for pattern in blocked_patterns:
        user_input = re.sub(pattern, "", user_input, flags=re.IGNORECASE)
    
    return user_input.strip()

def moderate_content(text: str) -> dict:
    """Check if content violates OpenAI policies."""
    response = client.moderations.create(input=text)
    return response.results[0]

def safe_chat(user_message: str) -> str:
    """Chat with security measures."""
    # Sanitize input
    sanitized = sanitize_input(user_message)
    
    # Check content moderation
    moderation = moderate_content(sanitized)
    if moderation.flagged:
        return "I cannot process this request as it violates content policies."
    
    # Proceed with chat
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": sanitized}
        ]
    )
    
    return response.choices[0].message.content
```

---

## Production Deployment

### 1. Architecture Considerations

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│  API Server  │─────▶│   OpenAI    │
│ (Frontend)  │      │   (Backend)  │      │     API     │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │   Database   │
                     │ (Chat History)│
                     └──────────────┘
```

### 2. FastAPI Backend Example

```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from agent_with_memory import ConversationalAgent

app = FastAPI(title="AI Agent API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store agents per session (use Redis in production)
agents = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint."""
    try:
        # Get or create agent for session
        if request.session_id not in agents:
            system_prompt = request.system_prompt or "You are a helpful assistant."
            agents[request.session_id] = ConversationalAgent(system_prompt)
        
        agent = agents[request.session_id]
        response = agent.chat(request.message)
        
        return ChatResponse(
            session_id=request.session_id,
            response=response
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a chat session."""
    if session_id in agents:
        del agents[session_id]
    return {"message": "Session cleared"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV OPENAI_API_KEY=${OPENAI_API_KEY}

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  agent-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

### 4. Monitoring and Logging

```python
# monitoring.py
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class MonitoredAgent:
    def __init__(self):
        self.agent = ConversationalAgent()
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_tokens": 0
        }
    
    def chat(self, user_message: str) -> str:
        """Chat with monitoring."""
        self.metrics["total_requests"] += 1
        start_time = datetime.now()
        
        try:
            logger.info(f"User message: {user_message[:100]}...")
            
            response = self.agent.chat(user_message)
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            self.metrics["successful_requests"] += 1
            
            logger.info(f"Response generated in {duration:.2f}s")
            logger.info(f"Response: {response[:100]}...")
            
            return response
            
        except Exception as e:
            self.metrics["failed_requests"] += 1
            logger.error(f"Error: {str(e)}")
            raise
    
    def get_metrics(self) -> dict:
        """Get current metrics."""
        return self.metrics
```

---

## Additional Resources

### Official Documentation
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)

### Libraries and Frameworks
- **LangChain**: Framework for building LLM applications
- **LlamaIndex**: Data framework for LLM apps
- **AutoGen**: Microsoft's multi-agent framework
- **Semantic Kernel**: Microsoft's AI orchestration SDK

### Community Resources
- [OpenAI Community Forum](https://community.openai.com)
- [r/OpenAI](https://reddit.com/r/OpenAI)
- GitHub repositories with agent examples

---

## Next Steps

1. **Start Simple**: Begin with basic conversational agents
2. **Add Memory**: Implement conversation history
3. **Integrate Tools**: Add function calling for real-world actions
4. **Enhance with RAG**: Connect to knowledge bases
5. **Scale Up**: Build multi-agent systems
6. **Deploy**: Move to production with proper infrastructure
7. **Monitor**: Track performance and costs
8. **Iterate**: Continuously improve based on user feedback

---

## Common Pitfalls to Avoid

1. **Not handling rate limits** - Implement retry logic
2. **Ignoring costs** - Monitor token usage
3. **Poor error handling** - Always catch and handle exceptions
4. **Weak system prompts** - Invest time in prompt engineering
5. **No conversation limits** - Set max message history
6. **Exposing API keys** - Use environment variables
7. **No input validation** - Sanitize user inputs
8. **Lack of testing** - Write comprehensive tests

---

## Conclusion

Building AI agents with OpenAI involves:
- Understanding core concepts (agents, tools, memory)
- Starting with simple implementations
- Gradually adding complexity (function calling, RAG, multi-agent)
- Following best practices (security, cost management, testing)
- Deploying with proper infrastructure

Start building today and iterate based on your specific use case!

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Author**: AI Development Guide
