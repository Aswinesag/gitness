# GITNESS - Futuristic Gaming Store

A modern, cinematic gaming store built with Next.js 14, Tailwind CSS, Framer Motion, and InsForge backend.

## Features

- 🎮 **Home Page** - Hero section with Spline 3D background
- 🛒 **Store** - Browse all games with glowing product cards
- 🔥 **Deals** - Limited-time deals with countdown timer
- 📖 **About** - Mission and information page
- 👤 **Authentication** - Sign up, sign in, and user management via InsForge
- 🛍️ **Shopping Cart** - Add items to cart and checkout
- 🔐 **Admin Dashboard** - Product management (admin only)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: InsForge (PostgreSQL, Authentication, Storage)
- **Styling**: Custom neon gradients, glowing effects, dark cinematic theme

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- InsForge account and backend URL

### Installation

1. Install dependencies:
```bash
cd gitness
npm install
```

2. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_INSFORGE_BASE_URL=https://975jhimv.us-west.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The project uses the following PostgreSQL tables:

- **users** - User accounts (id, name, email, password_hash, created_at)
- **products** - Game products (id, name, description, price, image, category, is_on_deal, discount_percent, created_at)
- **cart_items** - Shopping cart items (id, user_id, product_id, quantity, added_at)
- **orders** - Order history (id, user_id, total_amount, status, created_at)

## Admin Access

The admin dashboard is accessible at `/admin` and is restricted to:
- Email: `aswineye10@gmail.com`

Admin features:
- View all products
- Add new products
- Edit existing products
- Delete products
- Settings page

## Pages

- `/` - Home page (public)
- `/store` - Game store (requires authentication)
- `/deals` - Deals page (requires authentication)
- `/about` - About page (public)
- `/admin` - Admin dashboard (admin only)

## Design

- **Colors**: Dark background (#0a0a0a), neon cyan/blue gradients (#00ffff → #0000ff), neon green gradients (#39ff14 → #2f4f4f)
- **Fonts**: Orbitron/Rajdhani for headings, Inter for body text
- **Effects**: Glowing borders, gradient text, smooth animations, hover effects

## License

MIT
