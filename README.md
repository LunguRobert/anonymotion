# Anonymotion — Anonymous Mindfulness & Emotional Journal App

This is a **Next.js 15** full-stack application built with the **App Router**, inspired by modern, privacy-focused mental-health tools.  
Users can write anonymously, receive supportive reactions, track emotional trends in a private journal, and interact in a calm, safe digital space.

The project is designed as a **portfolio-grade full-stack application**, covering real production concepts: authentication, database design, real-time streams, caching, SEO, admin tools, and analytics.

---

## Tech Stack

### **Frontend**
- **Next.js 15** (App Router, Server Components)
- **React 18**  
- **Tailwind CSS**  
- **Server Components for marketing pages**
- **Client Components only where needed** (auth, realtime, charts, admin)

### **Backend / Full-Stack**
- **Next.js Route Handlers** (`app/api/...`)
- **NextAuth.js** (Google OAuth + Email Sign-In)
- **Prisma ORM**
- **PostgreSQL**
- **SSE (Server-Sent Events)** for realtime:
  - live feed updates  
  - live notifications  
- **Rate limiting & input validation**

### **Storage / Media**
- **Cloudinary** (image hosting, automatic optimizations)

### **Admin / CMS**
- Blog system with:
  - Markdown editor  
  - Preview mode  
  - SEO-friendly blog posts  
  - ISR revalidation

### **Analytics & Insights**
- Mood tracking with:
  - private emotional journal  
  - statistics & charts  
  - mood frequency, trends, streaks  
- Charts via **Chart.js + react-chartjs-2** (lazy-loaded)

### **SEO / Technical**
- Full JSON-LD Schema: Organization, WebSite, WebPage, FAQ  
- Optimized metadata for social sharing  
- ISR (Incremental Static Regeneration)

---

## App Features

### **Public / Anonymous**
- Post anonymously (only text + mood)
- View a clean, algorithm-free feed
- React with supportive emoji  
- Report inappropriate content  
- Real-time updates (SSE)

### **Private Account**
- Private mood journal (not visible to anyone)
- Add entries, track emotions, export data
- Analytics dashboard (charts, insights)
- Notifications in real-time
- Manage your posts & entries
- Google login or Email magic link

### **Admin**
- Blog management (create/edit/delete posts)
- Markdown + syntax highlighting
- Auto-generated OpenGraph metadata
- Publish via ISR tags

---

## Getting Started

Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
