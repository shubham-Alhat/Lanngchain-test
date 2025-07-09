// import { config } from "dotenv";
// import { z } from "zod";
// import { ChatOpenAI } from "@langchain/openai";
// import { tool } from "@langchain/core/tools";
// import { ToolExecutor } from "@langchain/langgraph";
// import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";

// config();

// // Step 1: Setup LLM
// const llm = new ChatOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   modelName: "gpt-4o",
// });

// // Step 2: Define tools
// const add = tool(async ({ a, b }) => a + b, {
//   name: "add",
//   description: "Add two numbers",
//   schema: z.object({
//     a: z.number(),
//     b: z.number(),
//   }),
// });

// const multiply = tool(async ({ a, b }) => a * b, {
//   name: "multiply",
//   description: "Multiply two numbers",
//   schema: z.object({
//     a: z.number(),
//     b: z.number(),
//   }),
// });

// const divide = tool(async ({ a, b }) => a / b, {
//   name: "divide",
//   description: "Divide two numbers",
//   schema: z.object({
//     a: z.number(),
//     b: z.number(),
//   }),
// });

// const tools = [add, multiply, divide];
// const llmWithTools = llm.bindTools(tools);

// // Step 3: Create tool node using ToolExecutor
// const toolExecutor = new ToolExecutor({ tools });

// const toolNode = async (state) => {
//   const lastMessage = state.messages[state.messages.length - 1];

//   const toolCalls = lastMessage.tool_calls ?? [];

//   const toolResults = [];

//   for (const call of toolCalls) {
//     const tool = tools.find((t) => t.name === call.name);
//     const result = await tool.invoke(call.args);

//     toolResults.push({
//       tool_call_id: call.id,
//       role: "tool",
//       name: call.name,
//       content: result.toString(),
//     });
//   }

//   return {
//     messages: toolResults,
//   };
// };

// // Step 4: LLM Node
// const llmCall = async (state) => {
//   const result = await llmWithTools.invoke([
//     {
//       role: "system",
//       content: "You are a helpful assistant that does math.",
//     },
//     ...state.messages,
//   ]);

//   return {
//     messages: [...state.messages, result],
//   };
// };

// // Step 5: Conditional Edge
// const shouldContinue = (state) => {
//   const lastMessage = state.messages.at(-1);
//   if (lastMessage?.tool_calls?.length) return "Action";
//   return "__end__";
// };

// // Step 6: Graph setup
// const agentBuilder = new StateGraph(MessagesAnnotation)
//   .addNode("llmCall", llmCall)
//   .addNode("tools", toolNode)
//   .addEdge("__start__", "llmCall")
//   .addConditionalEdges("llmCall", shouldContinue, {
//     Action: "tools",
//     __end__: "__end__",
//   })
//   .addEdge("tools", "llmCall")
//   .compile();

// // Step 7: Run it
// const messages = [
//   {
//     role: "user",
//     content: "Multiply 5 and 9",
//   },
// ];

// const result = await agentBuilder.invoke({ messages });

// console.log("🔢 Final Messages:\n", result.messages);

import { config } from "dotenv";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { create_react_agent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "langchain_core/messages";

// Load .env
config();

// Create the LLM
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
});

// Define tools
const add = tool(async ({ a, b }) => a + b, {
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
});

const multiply = tool(async ({ a, b }) => a * b, {
  name: "multiply",
  description: "Multiply two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
});

const divide = tool(async ({ a, b }) => a / b, {
  name: "divide",
  description: "Divide two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
});

// Create agent using prebuilt React-style flow
const agent = create_react_agent(llm, [add, multiply, divide], {
  prompt:
    "You are a helpful assistant that can perform arithmetic using tools.",
});

// Input from user
const result = await agent.invoke({
  messages: [
    new HumanMessage("Divide 100 by 4 and then multiply the result by 3."),
  ],
});

// Show result
console.log("🤖 Final Output:", result.messages.at(-1).content);
