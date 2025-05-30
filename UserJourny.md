# User Journey – AI-First Internal Helpdesk Portal

This document outlines the step-by-step screen flow for each type of user interacting with the portal.

---

## 👤 Employee Journey

### Screen 1: **Login / SSO Screen**

* Email / SSO login option
* Redirects to Dashboard on success

### Screen 2: **Employee Dashboard**

* View open, closed, pending tickets
* Shortcut to raise a new ticket
* FAQ & chatbot widget

### Screen 3: **Raise New Ticket**

* Form: title, description, category, priority
* Option to attach files
* AI suggests category (optional)

### Screen 4: **View Ticket Details**

* Ticket status, agent info
* Comments section
* SLA countdown bar

### Screen 5: **Knowledge Base / FAQ**

* Search or browse by category
* View detailed document/article

### Screen 6: **AI Chatbot**

* Input: natural query
* Output: instant AI response from KB / previous tickets

### Screen 7: **My Profile**

* Edit name, department
* View ticket history

---

## 🧑‍💼 Support Agent Journey

### Screen 1: **Login / SSO**

* Same as employee

### Screen 2: **Agent Dashboard**

* Tickets assigned to them
* SLA, priority filter
* AI suggestion quick-access panel

### Screen 3: **Ticket Detail View**

* AI draft suggestion
* Reply, reassign, close ticket
* Comments, timeline logs

### Screen 4: **Ticket Search / Filter**

* Full-text and advanced filter

### Screen 5: **Knowledge Base Access**

* Search articles to link in response

---

## 🤵 Team Lead Journey

### Screen 1: **Login**

### Screen 2: **Team Overview Dashboard**

* Agent-wise ticket counts
* SLA breaches
* AI efficiency metrics

### Screen 3: **Ticket Reassign Tool**

* Drag/drop interface to reassign tickets

### Screen 4: **Reports & Patterns View**

* Repeated tickets
* Overloaded agents
* Policy violations

---

## 📆 Admin Journey

### Screen 1: **Login**

### Screen 2: **Admin Control Panel**

* User management
* Role assignments
* SSO config

### Screen 3: **Knowledge Base Manager**

* Upload new docs
* Edit FAQ versions
* Access control (role-based)

### Screen 4: **System Settings**

* SLA timings
* AI provider keys
* Rate limits

### Screen 5: **Audit Logs Viewer**

* Full system logs

---

## 🤖 AI System Journey (Internal Logic)

### Event 1: **New Ticket Created**

* Run NLP routing engine
* Auto-assign to correct agent/team

### Event 2: **Agent Views Ticket**

* AI generates draft reply
* Logs suggestion

### Event 3: **User Uses Chatbot**

* Query passed to RAG system
* Fetch document embeddings
* Generate final response

### Event 4: **Daily Analysis Job**

* Run pattern detection
* Notify Team Lead / Admin if anomalies

---
