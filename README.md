# TripBudddyGo

TripBudddyGo is a modern travel planning and social platform built with Next.js, TypeScript, Express, MongoDB, and Tailwind CSS. It allows users to create, join, and manage trip plans, connect with fellow travelers, and explore new destinations together.

## Features

- User authentication and registration
- Create, edit, and delete trip plans
- Join trips created by other users
- Dashboard with trip statistics and credits
- Premium/free user management (trip creation/join limits)
- Responsive UI with Tailwind CSS
- Admin dashboard for managing users and plans

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js API routes, Express (for custom APIs), MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Token, via jose), bcryptjs (password hashing), custom session management
- **Other:** ESLint, Prettier, PostCSS, Lucide Icons

## Project Structure

```
├── app/
│   ├── (protected)/dashboard/page.tsx
│   ├── (protected)/travel-plans/add/page.tsx
│   ├── api/
├── pages/
│   └── api/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── ...
├── models/
│   └── TravelPlan.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── README.md
```

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up environment variables:**
   - Create a `.env.local` file with the following fields (example/mock values):

```env
# Stripe and App Environment Variables (mock values)
STRIPE_PRICE_EXPLORER=price_mock_explorer
STRIPE_PRICE_ADVENTURER=price_mock_adventurer
STRIPE_SECRET_KEY=sk_test_mock_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://mockuser:mockpassword@localhost:27017/mockdb

# NextAuth
NEXTAUTH_SECRET=mock_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_mock_publishable_key

# JWT   
JWT_SECRET=mock_jwt_secret_key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Run the development server:**
   ```sh
   npm run dev
   ```
4. **Access the app:**
   - Visit `https://tripbuddygo.vercel.app/` in your browser.

## Premium & Free Users
- Free users can create and join up to 3 trips.
- Premium users have unlimited trip creation and joining.

## Admin Features
- Admin dashboard for managing users and trip plans.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


**TripBudddyGo** — Plan adventures, find companions, and explore the world together!
