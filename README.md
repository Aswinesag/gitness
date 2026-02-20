# GITNESS: Futuristic Gaming Store

GITNESS is a high-performance, cinematic e-commerce platform for digital game distribution. Built with a focus on immersive user experience, it leverages a modern technology stack to deliver a seamless shopping journey from discovery to instant delivery.

## Key Features

### User Experience
*   **Immersive Home Page**: Features high-fidelity 3D hero sections (Spline integration) and smooth scroll animations.
*   **Interactive Preloader**: A HUD-style system initialization sequence that enhances the gaming aesthetic while assets load.
*   **Global Layout**: Cinematic dark theme with glassmorphic elements and neon glowing gradients.

### Store and Inventory
*   **Curated Catalog**: Browse game titles across multiple genres with dynamic product cards and real-time stock availability.
*   **Discount & Deals System**: Specialized deals section for promotional items with discount percentage displays.
*   **Shopping Cart**: Persistent cart management allowing users to aggregate items before proceeding to payment.

### Payments and Fulfillment
*   **Stripe Integration**: Secure payment processing via Stripe Checkout, supporting global payment methods and PCI compliance.
*   **Post-Payment Verification**: Server-side session retrieval to verify transaction status before clearing the cart.
*   **Gamified Success Page**: Immersive "Thank You" experience featuring animated XP rewards, confetti effects, and digital order summaries.

### Administration Panel
*   **Secure Access**: Restricted to authorized administrative accounts (e.g., aswineye10@gmail.com).
*   **Inventory CRUD**: Full capability to Create, Read, Update, and Delete products, prices, and descriptions.
*   **Promotion Management**: Dynamic control over promotional flags and discount percentages.
*   **Futuristic HUD Sidebar**: Specialized navigation for administrative staff.

## Tech Stack

*   **Frontend**: Next.js 14/15 (App Router), TypeScript, React 18
*   **Styling**: Tailwind CSS (v3), Framer Motion (Animations)
*   **Backend**: InsForge (PostgreSQL, Real-time Database, Auth, Storage)
*   **Payments**: Stripe SDK & Stripe Checkout

## Getting Started

### Prerequisites
*   Node.js 18 or higher
*   An active InsForge project
*   Stripe API keys (Test or Live)

### Installation

1.  Clone the repository and navigate to the project directory:
    ```bash
    cd gitness
    ```

2.  Install the required dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables in `.env.local`:
    ```env
    NEXT_PUBLIC_INSFORGE_BASE_URL=your_insforge_url
    NEXT_PUBLIC_INSFORGE_ANON_KEY=your_insforge_key
    STRIPE_SECRET_KEY=your_stripe_secret
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Project Structure

*   `/app`: Next.js App Router pages and API routes.
*   `/components`: Reusable UI components including HUD elements and layouts.
*   `/lib`: Core utility functions, SDK initializations, and context providers.
*   `/public`: Static assets and game media.

## Administrative Access

The admin panel is located at `/admin`. Authorization is performed via email verification against established administrative credentials. Unauthorized access attempts are automatically redirected to the secure gateway.

## License

This project is licensed under the MIT License.
