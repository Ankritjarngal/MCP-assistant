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

![MCP Assistant Flow Diagram](./3c8d5324-96b0-462d-9dde-a5bf4f5ba753.png)

### Core Workflow:
1. **User Query**
2. → **Service Selecting Agent**
3. → **Cypher-Alpha Reasoning** via OpenRouter
4. → **Enhanced Query with Context**
5. → Routed to:
   - 📅 **Google Calendar Service** (Each operation has a dedicated Calendar Agent)
   - 📧 **Mailing Service** (Each operation handled by a dedicated Mail Agent)
6. → **Task Executed via API**
7. → **Response Returned**

All service-specific tasks (like "create event", "edit event", "send mail", etc.) have **dedicated modular agents and API routes**, enhancing separation of logic and scaling.

---

## 🌐 Live Experience

👉 **[Try It Live](https://mcp-assistant.vercel.app)** (Google Sign-In Required)

### 📝 Tips for best results:
- ✔️ Use **full email addresses** the first time when sending mail  
- ✔️ Use **complete dates/times** at least once per session (e.g., `July 20 at 3 PM`)
- ✔️ Follow-ups like _“send it again to him”_ or _“reschedule that”_ will work **once context is set**

---

## 🧠 AI Model & Reasoning

- Powered entirely by **Cypher-Alpha** via **OpenRouter**
- Used for:
  - 🔍 Intent Detection
  - 🧠 Multi-turn Query Enrichment
  - 🧩 Context-Aware Routing
  - 📬 Calendar/Mail Agent-Level Execution
- Each agent (mailing, calendar, etc.) uses the **same model** to ensure unified reasoning quality.

---

## 🔐 Authentication

- Google OAuth 2.0 Authorization Code Flow
- Tokens securely handled
- JWTs used for frontend-backend auth sessions

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

- 🧱 Broken down into **agent + API** per operation for each service 
  - e.g., `MailAgent`, `CreateEventAgent`, `RescheduleEventAgent`
- 🔁 Plug-and-play — easily add services like Tasks, Notion, Discord  
- 🧠 Each agent uses its own **Cypher-Alpha** powered logic

This makes the assistant robust, scalable, and easy to extend with minimal changes.

---

## 🚧 Roadmap

- 🧾 Google Tasks & Reminder support  
- 🗣️ Voice command input  
- 💬 Slack/Discord bot version  
- 📊 Usage analytics and logs  
- 🌐 Session-level memory storage (opt-in)

---

## ✨ Final Notes

MCP Assistant isn’t just a chatbot — it’s a **assistant framework** with modular, intelligent agents that connect vague user input to real-world API actions.

> ✅ Key Reminders:
> - Always give full email address in your **first email command**
> - Dates like “tomorrow” or “next Friday” require a **reference date** first (e.g., “July 12”)
> - Context improves after 1-2 inputs in the same session

---

Built with modularity, clarity, and next-gen reasoning in mind — powered fully by Cypher-Alpha 🚀
