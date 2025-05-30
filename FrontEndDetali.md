# AI-First Internal Helpdesk Portal – Frontend README

This document outlines the frontend design system and technology guidelines for the AI-First Internal Helpdesk Portal. Use this as the blueprint for building all UI components. Please User Resuable components

---

## 🌐 Tech Stack

* **Framework**: React + Vite
* **Styling**: Tailwind CSS (3 x)
* **Component Library**: ShadCN UI
* **Icons**: Lucide Icons
* **Fonts**: Google Fonts (`Inter`, `Sora`)
* **Animations**: Framer Motion
* **Design Reference**: Figma

---

## 🖊️ Design System

### 🌟 Primary & Secondary Colors

* **Primary**: Indigo 500 (`#6366F1`)
* **Secondary**: Amber 400 (`#FACC15`)

### 💡 Accent Colors (for states)

| Purpose    | Color Name | Hex     |
| ---------- | ---------- | ------- |
| Info       | Sky        | #38BDF8 |
| Success    | Emerald    | #10B981 |
| Warning    | Amber      | #F59E0B |
| Error      | Rose       | #F43F5E |
| Background | Zinc       | #F9FAFB |
| Border     | Slate      | #CBD5E1 |

---

### 📃 Typography

* **Primary Font**: Inter
* **Secondary Font**: Sora (for headings)
* **Font Source**: Google Fonts

### ⚖️ Spacing System

* Based on Tailwind's spacing scale (4px grid): `p-4`, `gap-6`, `mt-8`, etc.

### 🏛️ Layout & Patterns

* Sidebar layout (sticky)
* Top navigation bar
* Responsive design (mobile-first)
* Reusable components: Cards, Tables, Forms
* Dark Mode with Tailwind

---

## 📊 Components to Build

* Ticket Table & Details Panel
* Knowledge Base Viewer (with version switch)
* Chatbot (floating or inline)
* Dashboard Cards & KPI Charts
* AI Suggestions Panel for Tickets

---

## 💪 Icons

* Use [Lucide Icons](https://lucide.dev/)
* Must be consistent, modern, and semantic

---

## 🔍 Design References

* [Linear](https://linear.app/) — Ticket interface
* [Raycast](https://raycast.com/) — Chat-style interactions
* [Superhuman](https://superhuman.com/) — Clean layouts
* [ShadCN UI](https://ui.shadcn.dev/docs/examples/dashboard) — Ready-made components

---

## 🏠 Accessibility & UX

* Use `aria-labels` where needed
* Keyboard navigation support (Tab, Enter, Esc)
* Add focus states & high contrast

---

## 🔧 🔗 Links

* Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
* ShadCN UI: [https://ui.shadcn.dev/](https://ui.shadcn.dev/)
* Lucide Icons: [https://lucide.dev/](https://lucide.dev/)
* Framer Motion: [https://www.framer.com/motion/](https://www.framer.com/motion/)
* Google Fonts: [https://fonts.google.com/](https://fonts.google.com/)

---

> This README is intended for frontend AI agents or developers to build consistent, high-quality UIs aligned with the helpdesk portal vision.
