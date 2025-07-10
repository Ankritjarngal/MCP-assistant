
# 🤖 MCP Assistant

**MCP Assistant** is a modular, intelligent AI-powered framework that connects natural language queries to real-world services like **Google Calendar** and **Gmail**. Built on a stateless, agent-based architecture, it converts vague, multi-step human instructions into actionable operations using contextual awareness and memory.

---

## 🧠 What It Does

- 🧭 Detects user intent (e.g., mailing, scheduling).
- 🔍 Enhances vague queries using context (e.g., previous messages, dates).
- 🔁 Routes queries to the correct service pipeline (calendar, email, etc.).
- 🛠️ Executes the action through real Google services.

> Example:
> - _“Send an email to prof.john@example.com saying I’ll miss today’s lecture”_ → Gmail
> - _“Move tomorrow’s meeting with Alex to 4 PM”_ → Calendar rescheduling

---

## 🧱 Architecture

MCP Assistant is built on modular components that handle each stage of query understanding, enhancement, and execution.

### 🔄 High-Level Flow

![MCP Assistant Flow Diagram](https://github.com/user-attachments/assets/37e91a49-2314-422e-8fc4-e4726795692c)

### Core Workflow:
1. **User Query** →  
2. **Service Selecting Agent**  
3. **Cypher-Alpha Reasoning** via OpenRouter → Enhances the Query  
4. **Query Execution** via:
   - 📅 Google Calendar API
   - 📧 Gmail API
5. **Response Returned**

All interactions are routed through an **agent-based pipeline** with logic to handle fallbacks, vague inputs, and service switching.

---

## 🌐 Live Experience

👉 **[Try It Live](https://mcp-assistant.vercel.app)** (Google Sign-In Required)

### 📝 Tips for best results:
- ✔️ Use **full email addresses** the first time when sending mail  
- ✔️ Use **complete dates/times** at least once per session (e.g., `July 20 at 3 PM`)
- ✔️ Follow-ups like _“send it again to him”_ or _“reschedule that”_ will work **once context is set**

---

## 🧠 AI Model & Reasoning

- Powered by **Cypher-Alpha** via **OpenRouter**
- Performs dynamic intent detection, multi-turn memory reasoning, and query expansion
- Augments vague queries (e.g., “Send that again” → “Send previous mail to john@example.com again”)

---

## 🔐 Authentication

- Google OAuth 2.0 Authorization Code Flow
- Tokens stored securely on backend
- JWTs issued for session management

---

## 🔩 Tech Stack

| Layer        | Tech                         |
|--------------|------------------------------|
| Frontend     | React, Tailwind CSS, Vite    |
| Backend      | Node.js, Express             |
| Auth         | Google OAuth 2.0             |
| AI Engine    | Cypher-Alpha via OpenRouter  |
| DB           | MongoDB                      |
| Hosting      | Vercel (Frontend), Render (Backend) |

---

## 🔌 Modularity

Each supported service (Mail, Calendar, etc.) is:
- Isolated in its own module
- Extendable by plugging in new agents
- Controlled through an intelligent routing system

---

## 🚧 Roadmap

- 🧾 Google Tasks & Reminder support  
- 🗣️ Voice command input  
- 💬 Slack/Discord bot version  
- 📊 Usage analytics and logs  

---


## ✨ Final Notes

MCP Assistant isn’t just a chatbot — it’s a **modular, production-ready assistant** capable of acting on your behalf through intelligent understanding and real-world service integration.

> ✅ Key Reminders:
> - Always give full email address in your **first email command**
> - Dates like “tomorrow” or “next Friday” require a **reference date** first (e.g., “July 12”)
> - Context improves after 1-2 inputs in the same session

---

