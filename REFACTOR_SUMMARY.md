# 🔄 Villa 97 - Single Villa Architecture Refactor

## Summary of Changes

The project has been **completely refactored** from a multi-villa marketplace to a **single villa showcase website** for **Villa 97 Bolgoda**, as per the original project proposal.

---

## 🎯 What Changed

### **Database Schema (BREAKING CHANGES)**
**Old Structure:**
- `villas` table - Multiple villa records
- `bookings` → `villa_id` foreign key
- `reviews` → `villa_id` foreign key

**New Structure:**
- `villa_info` table - Single record for Villa 97
- `packages` table - Different stay options (Weekend, Weekly, Honeymoon, Monthly)
- `gallery` table - Photo collection
- `bookings` → `package_id` foreign key (optional)
- `reviews` - No villa_id needed

### **Backend API Changes**

#### **Removed Endpoints:**
- ❌ `GET /api/villas` (list all villas)
- ❌ `POST /api/villas` (create villa)
- ❌ `PUT /api/villas/:id` (update specific villa)
- ❌ `DELETE /api/villas/:id` (delete villa)

#### **New Endpoints:**
```
Villa Info (Single):
  GET /api/villa                    - Get Villa 97 information
  GET /api/villa/availability       - Check availability for dates
  PUT /api/villa (admin)            - Update villa information

Packages:
  GET /api/packages                 - Get all packages
  GET /api/packages/:id             - Get package by ID
  POST /api/packages (admin)        - Create package
  PUT /api/packages/:id (admin)     - Update package
  DELETE /api/packages/:id (admin)  - Delete package

Gallery:
  GET /api/gallery                  - Get all images (filter by category)
  GET /api/gallery/categories       - Get all categories
  GET /api/gallery/:id              - Get image by ID
  POST /api/gallery (admin)         - Add image
  PUT /api/gallery/:id (admin)      - Update image
  DELETE /api/gallery/:id (admin)   - Delete image

Bookings (Updated):
  POST /api/bookings                - Now accepts package_id instead of villa_id
  All other booking endpoints remain the same
```

### **Frontend Changes**

#### **File Structure:**
```
REMOVED:
- src/pages/VillaList.jsx

RENAMED:
- src/pages/VillaDetail.jsx → Packages.jsx

ADDED:
- src/pages/Gallery.jsx

UPDATED:
- src/pages/Home.jsx    - Full villa showcase with amenities, features, location
- src/App.jsx           - Updated routes
- src/components/Navbar.jsx - Updated navigation links
- src/services/api.js   - New API endpoints
```

#### **Route Changes:**
```
OLD:                      NEW:
/                      →  / (Villa 97 showcase)
/villas                →  /packages
/villas/:id            →  Removed
                          /gallery (New)
/login                 →  /login (Same)
/register              →  /register (Same)
/profile               →  /profile (Same)
/bookings              →  /bookings (Updated)
```

---

## 🗄️ Database Migration Required

### **Step 1: Backup Current Database**
```bash
pg_dump -U postgres villa97_db > villa97_backup.sql
```

### **Step 2: Drop and Recreate**
```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE villa97_db;"

# Run new schema
psql -U postgres -c "CREATE DATABASE villa97_db;"
psql -U postgres -d villa97_db -f backend/config/dbSchema.sql
```

### **New Database Includes:**
- ✅ Villa 97 Bolgoda complete information
- ✅ 4 pre-configured packages (Weekend, Weekly, Honeymoon, Monthly)
- ✅ 8 sample gallery images
- ✅ Updated schema with proper indexes

---

## 📦 What's Included in Default Data

### **Villa Information:**
- Name: Villa 97 Bolgoda
- Location: Bolgoda Lake, Sri Lanka
- 5 Bedrooms, 4 Bathrooms
- Up to 12 Guests
- 450m² property
- Full amenities & features
- Nearby attractions

### **Packages:**
1. **Weekend Escape** - LKR 35,000 (2 nights)
2. **Week-Long Retreat** - LKR 110,000 (7 nights)
3. **Romantic Honeymoon Package** - LKR 58,000 (3 nights)
4. **Monthly Stay** - LKR 400,000 (30 nights with 25% discount)

### **Gallery Categories:**
- exterior
- interior
- pool
- bedroom

---

## 🔧 Setup Instructions

### **1. Install Dependencies**
```bash
# Backend (no changes)
cd backend
npm install

# Frontend (no changes)
cd frontend
npm install
```

### **2. Database Setup**
```bash
# Create fresh database
psql -U postgres
CREATE DATABASE villa97_db;
\q

# Run new schema
psql -U postgres -d villa97_db -f backend/config/dbSchema.sql
```

### **3. Environment Variables**
**backend/.env** (no changes needed):
```env
DB_NAME=villa97_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret
```

**frontend/.env** (no changes needed):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### **4. Run Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 🎯 User Journey (New Flow)

### **Old Flow (Multi-Villa):**
1. Browse multiple villas
2. Filter/search villas
3. Select a villa
4. Book selected villa

### **New Flow (Single Villa):**
1. **Land on Villa 97 showcase** (homepage)
2. **Explore the villa:**
   - View amenities & features
   - Browse gallery
   - See location & nearby attractions
3. **Choose a package** (Weekend, Weekly, etc.)
4. **Select dates**
5. **Book stay**
6. **View bookings**

---

## 📱 New Pages Overview

### **Home (`/`)**
- Hero section with villa image
- About Villa 97 section
- Amenities grid
- Feature highlights
- Gallery preview
- Location & nearby attractions
- Call-to-action

### **Packages (`/packages`)**
- All available stay packages
- Package details & pricing
- Included services
- Booking form with date selection
- Guest count selection
- Special requests

### **Gallery (`/gallery`)**
- Photo grid
- Category filters (exterior, interior, pool, bedroom)
- Featured images
- Image captions

### **Bookings (`/bookings`)**
- Updated to show package name
- Cancel functionality
- Status tracking

---

## 🚀 Features

### **Implemented:**
- ✅ Single villa information system
- ✅ Package-based booking
- ✅ Gallery with categories
- ✅ Custom booking (without package)
- ✅ JWT authentication
- ✅ User profiles
- ✅ Booking management

### **Still Missing (From Proposal):**
- ❌ Google OAuth
- ❌ Booking.com iCal integration
- ❌ Admin dashboard
- ❌ Reviews submission
- ❌ Real-time notifications

---

## 📊 Architecture Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Focus** | Multiple villas | Single villa (Villa 97) |
| **Booking Model** | Villa-based | Package-based |
| **Navigation** | Browse, Filter, Select | Explore, Choose Package, Book |
| **Main Pages** | Home, VillaList, VillaDetail | Home (showcase), Packages, Gallery |
| **Database** | villas table | villa_info + packages |
| **Pricing** | Per-night rate | Package-based |

---

## ✅ Testing Checklist

After migration, verify:

- [ ] Homepage loads Villa 97 information
- [ ] Gallery displays images with categories
- [ ] Packages page shows all 4 packages
- [ ] Can select a package
- [ ] Can choose custom dates
- [ ] Booking creation works
- [ ] Bookings page shows package names
- [ ] Authentication still works
- [ ] Profile management works
- [ ] Booking cancellation works

---

## 🔄 Rollback (If Needed)

If you need to revert:
```bash
# Restore old database
psql -U postgres -d villa97_db < villa97_backup.sql

# Git revert (if committed)
git revert HEAD
```

---

## 📝 Notes

- **All React files now use `.jsx` extension** for clarity
- **Prices in LKR (Sri Lankan Rupees)** as per location
- **Base price per night**: LKR 15,000 (for custom bookings)
- **Sample images from Unsplash** - replace with actual villa photos
- **Admin routes protected** but no admin UI yet

---

## 🎉 Summary

✅ **Database**: Completely refactored for single villa
✅ **Backend**: New controllers, routes for villa_info, packages, gallery
✅ **Frontend**: New pages (Home showcase, Packages, Gallery, updated Bookings)
✅ **API**: Clean RESTful endpoints for single villa architecture
✅ **Sample Data**: Villa 97 info + 4 packages + 8 gallery images

**The project now correctly represents a single luxury villa website as per the original proposal!**
