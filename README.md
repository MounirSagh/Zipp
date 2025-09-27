# ZIPP - Restaurant Ordering System

A modern, multilingual restaurant ordering platform that enables customers to order directly from their tables using QR codes, with real-time order management for restaurant staff.

## 🚀 Features

### For Customers

- **QR Code Ordering**: Scan QR code at table to access menu
- **Multilingual Support**: Available in English, French, and Arabic
- **Simple Ordering**: Add items to cart and place orders without registration
- **Real-time Updates**: Get SMS notifications about order status
- **Mobile Optimized**: Responsive design for all devices

### For Restaurant Staff

- **Order Management**: View and manage all incoming orders
- **Kitchen Panel**: Dedicated interface for kitchen staff
- **Status Updates**: Update order status (Pending → Confirmed → Ready)
- **SMS Notifications**: Automatic customer notifications
- **Analytics Dashboard**: Track sales and order metrics
- **Menu Management**: Add, edit, and organize menu items

## 🛠 Tech Stack

### Frontend

- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **React Router** for navigation
- **i18next** for internationalization
- **Clerk** for authentication

### Backend

- **Node.js** with Express
- **TypeScript**
- **Prisma** ORM
- **PostgreSQL** database
- **Cloudinary** for image storage
- **SMS API** for notifications

## 📁 Project Structure

```
Zipp/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── locales/        # Translation files
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── Backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema & migrations
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for image uploads)
- SMS service account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Zipp
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd Frontend
   npm install
   ```

3. **Install Backend Dependencies**

   ```bash
   cd ../Backend
   npm install
   ```

4. **Environment Setup**

   Create `.env` file in the Backend directory:

   ```env
   DATABASE_URL="your-postgresql-connection-string"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
   SMS_API_KEY="your-sms-service-api-key"
   ```

   Create `.env.local` file in the Frontend directory:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   ```

5. **Database Setup**

   ```bash
   cd Backend
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start Development Servers**

   Backend:

   ```bash
   cd Backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd Frontend
   npm run dev
   ```

## 🔧 Configuration

### Database Schema

The system uses PostgreSQL with Prisma ORM. Key tables include:

- `orders` - Customer orders
- `menu_categories` - Menu organization
- `menu_items` - Individual menu items
- `feedback` - Customer feedback

### QR Code URL Format

Customers access menus via: `yoursite.com/RESTAURANT_CODE/TABLE_NUMBER`

- `RESTAURANT_CODE`: Base64 encoded restaurant ID
- `TABLE_NUMBER`: Physical table number

### SMS Integration

The system sends automatic SMS notifications for:

- Order confirmations
- Order ready notifications
- Order rejections

## 📱 Usage

### For Restaurant Owners

1. Sign up and create restaurant profile
2. Add menu categories and items
3. Generate QR codes for tables
4. Monitor orders through admin panel
5. Use kitchen panel for order preparation

### For Customers

1. Scan QR code at restaurant table
2. Browse menu in preferred language
3. Add items to cart
4. Place order with optional special instructions
5. Receive SMS updates on order status

## 🌐 API Endpoints

### Orders

- `GET /api/orders/:restaurantId` - Get restaurant orders
- `POST /api/orders/create` - Create new order
- `POST /api/orders/update-status` - Update order status

### Menu

- `GET /api/menu/:restaurantId` - Get restaurant menu
- `POST /api/menu/category` - Create menu category
- `POST /api/menu/item` - Create menu item

### Analytics

- `GET /api/analytics/:restaurantId` - Get restaurant analytics

### SMS

- `POST /api/sms/send-sms` - Send SMS notification

## 🎨 Customization

### Styling

- Modify Tailwind CSS classes in components
- Update theme colors in `tailwind.config.js`
- Custom components in `src/components/ui/`

### Translations

Add new languages by:

1. Creating new JSON file in `Frontend/src/locales/`
2. Adding language option to `LanguageSelector` component
3. Configuring i18next in `i18n.ts`

## 🚀 Deployment

### Frontend (Vercel)

1. Connect repository to Vercel
2. Set environment variables
3. Deploy with automatic builds



---

**ZIPP** - Simplifying restaurant ordering, one QR code at a time! 🍽️
