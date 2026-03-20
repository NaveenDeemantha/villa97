# 🏡 Villa 97 Bolgoda - Luxury Lakeside Retreat

A **full-stack web application** for Villa 97, a luxury villa on Bolgoda Lake, Sri Lanka. Built with **React**, **Node.js**, **Express**, and **PostgreSQL**.

> ✅ **Single villa showcase website**  
> ✅ **Package-based booking system**  
> ✅ **Gallery with photo categories**  
> ✅ **JWT Authentication**  
> ✅ **REST API with Express**  
> ✅ **PostgreSQL Database**

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **PostgreSQL** (v12+)
- **npm** or **yarn**

### 1. Install Dependencies

```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup PostgreSQL Database

```powershell
# Create database
psql -U postgres
CREATE DATABASE villa97_db;
\q

# Run schema
psql -U postgres -d villa97_db -f backend/config/dbSchema.sql
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=villa97_db
DB_USER=postgres
DB_PASSWORD=your_password_here

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Create Admin User (🆕 New Step)

Create the default admin account for accessing admin features:

```powershell
cd backend
npm run seed:admin
```

**Default Admin Credentials:**
- Email: `admin@villa97.com`
- Password: `admin123`

⚠️ **Change the password after first login!**

### 5. Run the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

🎉 **Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin API: http://localhost:5000/api/admin (requires login)

---

## 📁 Project Structure

```
villa97/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection
│   │   └── dbSchema.sql       # Database schema + seed data
│   ├── controllers/           # Business logic
│   │   ├── userController.js
│   │   ├── villaController.js
│   │   └── bookingController.js
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/                # API routes
│   │   ├── userRoutes.js
│   │   ├── villaRoutes.js
│   │   └── bookingRoutes.js
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env
│
└── frontend/                   # React Application
    ├── public/
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── Navbar.js
    │   │   └── Footer.js
    │   ├── pages/              # Page components
    │   │   ├── Home.js
    │   │   ├── VillaList.js
    │   │   ├── VillaDetail.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Profile.js
    │   │   └── Bookings.js
    │   ├── context/
    │   │   └── AuthContext.js  # Authentication context
    │   ├── services/
    │   │   └── api.js          # Axios API calls
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env
```

---

## ✨ Features

- **🏠 Villa Showcase**: Complete villa information with amenities, features, and location
- **📦 Package System**: Pre-configured stay packages (Weekend, Weekly, Honeymoon, Monthly)
- **🖼️ Photo Gallery**: Organized photo collection with category filters
- **🔐 User Authentication**: Secure registration and login with JWT
- **📅 Booking System**: Package-based or custom date bookings
- **✅ Availability Check**: Real-time availability checking for dates
- **👤 User Profile**: Manage account and view booking history
- **📱 Responsive Design**: Works seamlessly on all devices
- **🎯 REST API**: Complete RESTful API with Express
- **👨‍💼 Admin Backend**: Complete admin management system (🆕)
  - Dashboard with analytics and statistics
  - Booking management and tracking
  - User management with role-based access
  - Package and gallery management
  - Villa information updates

### Villa
```
GET    /api/villa                    # Get Villa 97 information
GET    /api/villa/availability       # Check date availability
PUT    /api/villa                    # Update villa info (admin)
```

### Packages
```
GET    /api/packages                 # Get all packages
GET    /api/packages/:id             # Get package by ID
POST   /api/packages                 # Create package (admin)
PUT    /api/packages/:id             # Update package (admin)
DELETE /api/packages/:id             # Delete package (admin)
```

### Gallery
```
GET    /api/gallery                  # Get all images (with filters)
GET    /api/gallery/categories       # Get image categories
GET    /api/gallery/:id              # Get image by ID
POST   /api/gallery                  # Add image (admin)
PUT    /api/gallery/:id              # Update image (admin)
DELETE /api/gallery/:id              # Delete image (admin)
```

### Authentication
```
POST   /api/users/register           # Register new user
POST   /api/users/login              # Login user
GET    /api/users/profile            # Get profile (protected)
PUT    /api/users/profile            # Update profile (protected)
DELETE /api/users/profile            # Delete account (protected)
```

### Bookings (All Protected)
```
GET    /api/bookings                 # Get all bookings
GET    /api/bookings/:id             # Get booking by ID
POST   /api/bookings                 # Create booking (with package_id)
PUT    /api/bookings/:id             # Update booking
DELETE /api/bookings/:id             # Cancel booking
GET    /api/bookings/user/:id        # Get user bookings
```

### Admin API (Protected - Admin Only) 🆕
```
# Dashboard & Analytics
GET    /api/admin/dashboard/stats                - Overview statistics
GET    /api/admin/dashboard/analytics/bookings   - Booking analytics
GET    /api/admin/dashboard/analytics/revenue    - Revenue analytics
GET    /api/admin/dashboard/analytics/users      - User statistics
GET    /api/admin/dashboard/system               - System health

# Booking Management
GET    /api/admin/bookings                       - All bookings with filters
POST   /api/admin/bookings                       - Create booking
PUT    /api/admin/bookings/:id                   - Update booking
PATCH  /api/admin/bookings/:id/status            - Update status
PATCH  /api/admin/bookings/:id/payment           - Update payment
DELETE /api/admin/bookings/:id                   - Delete booking

# User Management
GET    /api/admin/users                          - All users
POST   /api/admin/users                          - Create user
PUT    /api/admin/users/:id                      - Update user
PATCH  /api/admin/users/:id/role                 - Change role
DELETE /api/admin/users/:id                      - Delete user

# Package Management
GET    /api/admin/packages                       - All packages with stats
POST   /api/admin/packages                       - Create package
PUT    /api/admin/packages/:id                   - Update package
DELETE /api/admin/packages/:id                   - Delete package

# Gallery Management
GET    /api/admin/gallery                        - All images
POST   /api/admin/gallery                        - Add image
POST   /api/admin/gallery/bulk                   - Bulk upload
PUT    /api/admin/gallery/:id                    - Update image
DELETE /api/admin/gallery/:id                    - Delete image

# Villa Management
GET    /api/admin/villa                          - Villa info
PUT    /api/admin/villa                          - Update villa
PATCH  /api/admin/villa/availability             - Toggle availability
```

📖 **Complete Admin API Documentation**: [backend/ADMIN_API.md](backend/ADMIN_API.md)

---

## 🗄️ Database Schema

### Tables
- **villa_info**: Single record with Villa 97 details
- **packages**: Stay packages (Weekend, Weekly, Honeymoon, Monthly)
- **gallery**: Photo collection with categories
- **users**: User accounts with authentication
- **bookings**: Booking records (references packages)
- **reviews**: User reviews and ratings

---

## 📁 Project Structure

```
villa97/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection
│   │   ├── dbSchema.sql       # Database schema + seed data
│   │   └── seedAdmin.js       # 🆕 Admin user seeder
│   ├── controllers/           # Business logic
│   │   ├── admin/             # 🆕 Admin controllers
│   │   │   ├── adminDashboardController.js
│   │   │   ├── adminBookingController.js
│   │   │   ├── adminUserController.js
│   │   │   ├── adminPackageController.js
│   │   │   ├── adminGalleryController.js
│   │   │   └── adminVillaController.js
│   │   ├── villaInfoController.js
│   │   ├── packageController.js
│   │   ├── galleryController.js
│   │   ├── bookingController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js            # JWT + role-based authentication
│   ├── routes/                # API routes
│   │   ├── admin/             # 🆕 Admin routes
│   │   │   └── adminRoutes.js
│   │   ├── villaInfoRoutes.js
│   │   ├── packageRoutes.js
│   │   ├── galleryRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── userRoutes.js
│   ├── server.js              # Express server
│   ├── package.json
│   ├── ADMIN_README.md        # 🆕 Admin backend docs
│   ├── ADMIN_API.md           # 🆕 Complete API docs
│   └── .env
│
└── frontend/                   # React Application
    ├── public/
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   ├── pages/              # Page components
    │   │   ├── Home.jsx        # Villa showcase
    │   │   ├── Packages.jsx    # Stay packages & booking
    │   │   ├── Gallery.jsx     # Photo gallery
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   └── Bookings.jsx
    │   ├── context/
    │   │   └── AuthContext.js  # Authentication context
    │   ├── services/
    │   │   └── api.js          # Axios API calls
    │   ├── App.jsx
    │   └── index.jsx
    ├── package.json
    └── .env
```

---

## 🧪 Testing

1. **Visit Homepage**: Explore Villa 97 showcase at `/`
2. **Browse Gallery**: View photos by category at `/gallery`
3. **View Packages**: See stay options at `/packages`
4. **Register**: Create account at `/register`
5. **Login**: Sign in at `/login`
6. **Book**: Select package, choose dates, and book
7. **View Bookings**: Check reservations at `/bookings`
8. **Manage Profile**: Update details at `/profile`

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI library (.jsx files)
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling

---

## 📦 Pre-Configured Data

### Villa Information
- **Name**: Villa 97 Bolgoda
- **Location**: Bolgoda Lake, Sri Lanka
- **Capacity**: Up to 12 guests
- **Size**: 5 bedrooms, 4 bathrooms, 450m²
- **Amenities**: Pool, WiFi, Kitchen, BBQ, Boat Dock, etc.

### Packages
1. **Weekend Escape**: LKR 35,000 (2 nights)
2. **Week-Long Retreat**: LKR 110,000 (7 nights)
3. **Romantic Honeymoon Package**: LKR 58,000 (3 nights)
4. **Monthly Stay**: LKR 400,000 (30 nights)

### Gallery
- 8 pre-loaded images
- Categories: exterior, interior, pool, bedroom

---

## 📝 Notes

- All React components use `.jsx` extension
- Sample villa data automatically inserted from `dbSchema.sql`
- Images use Unsplash URLs (replace with actual villa photos)
- JWT tokens expire after 7 days (configurable in `.env`)
- Booking dates validated server-side
- Custom bookings available without selecting a package

---

## 🚀 Next Steps

### Missing Features (From Proposal)
- [ ] Google OAuth authentication
- [ ] Booking.com iCal integration
- [x] **Admin dashboard backend** ✅ 
- [ ] Admin dashboard frontend (UI not implemented yet)
- [ ] Staff management system
- [ ] Reviews submission functionality
- [ ] Real-time notifications
- [ ] Email notifications
- [ ] Multi-language support

---

## 📄 Additional Documentation

- [backend/ADMIN_README.md](backend/ADMIN_README.md) - 🆕 Admin backend documentation
- [backend/ADMIN_API.md](backend/ADMIN_API.md) - 🆕 Complete admin API reference
- [REFACTOR_SUMMARY.md](REFACTOR_SUMMARY.md) - Details on architecture changes
- [PROJECT_COMPARISON_ANALYSIS.md](PROJECT_COMPARISON_ANALYSIS.md) - Proposal comparison

---

**Built with ❤️ for Villa 97 Bolgoda**

🎉 **Ready to showcase your luxury lakeside retreat!**