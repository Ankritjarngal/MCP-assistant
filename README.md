![image](https://github.com/user-attachments/assets/37e91a49-2314-422e-8fc4-e4726795692c)
Model Context Protocol Server
This project is a modular system that processes user queries and routes them to appropriate services like Google Calendar or Email through a structured flow of agents and APIs.

Overview
The server handles user queries by:

Identifying the type of service requested.

Enhancing the query with contextual information.

Routing the query to the correct service agent.

Executing the task via APIs.

Flow Breakdown
User Query

The user sends a query, such as "Schedule a meeting" or "Send an email".

Service Selecting Agent

Determines which type of service the query belongs to (calendar, mailing, etc.).

Enhanced Query Agent Based on Service

Enhances the query with contextual details.

Stores the query in the main database.

Database for All Queries

Stores raw and enhanced queries.

Categorizes queries (calendar queries, mailing queries, etc.).

Service Routing

Calendar Queries

Handled by Google Calendar Service and Google Calendar Service Selector.

Mailing Queries

Handled by Mailing Service and Mailing Service Agent.

More To Be Added Soon

Placeholder for future service integrations.

Agents for Particular Services

These agents handle logic specific to each service type.

API Setup for All Particular Services

Final interaction point where actual API calls are made to perform the requested tasks.

