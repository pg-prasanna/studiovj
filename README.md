# Studio VJ Photography Portfolio - Documentation Index

## 📚 Documentation Overview

Complete guides for running, managing, and using the photography portfolio system.

---

## 🚀 Getting Started

### For Quick Setup (5 minutes)
👉 **[QUICK_START.md](QUICK_START.md)**
- Prerequisites and one-time setup
- Start 3 services in 3 terminals
- Access URLs and service ports
- Common issues and fixes

### For Complete Setup (30 minutes)
👉 **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)**
- Detailed step-by-step instructions
- Database configuration
- Environment variables
- API endpoints reference
- Performance tips
- Security notes

---

## 🏢 System Components

### Backend API (Spring Boot 3)
👉 **[BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)**
- System architecture overview
- Database schema and ERD
- 18 REST API endpoints explained
- Data flow examples
- Architecture layers (Controller → Service → Repository)
- Cloudinary integration
- Error handling
- Performance optimizations

**Quick Reference:**
- **Language:** Java 21
- **Framework:** Spring Boot 3.2.0
- **Database:** MySQL 8.0+
- **Port:** 8080
- **API Base:** http://localhost:8080/api

### Admin Dashboard (React + Vite)
👉 **[ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md)**
- Step-by-step UI walkthrough
- Form layouts with example screenshots
- Create events workflow
- Manage albums workflow
- Upload photos workflow
- Publish events workflow
- Tips & tricks
- Troubleshooting

**Quick Reference:**
- **Language:** React 18 + Vite
- **Features:** Create/Edit/Delete Events, Albums, Photos
- **Port:** 3001
- **URL:** http://localhost:3001

### Viewer Website (React + Vite)
- **Language:** React 18 + Vite
- **Features:** Browse published events, view galleries, switch albums
- **Port:** 5173
- **URL:** http://localhost:5173

---

## 📸 Workflows

### Complete Workflow: Add Event with Photos

**Time:** ~15 minutes per event

1. **Create Event** (Admin Dashboard)
   - Go to Create Event page
   - Fill title, date, location, description
   - Upload cover image
   - Click Create → Status: DRAFT

2. **Add Albums** (Admin Dashboard)
   - Go to Albums section
   - Create multiple albums (e.g., Reception, Candid, Portraits)
   - Albums ready for photos

3. **Upload Photos** (Admin Dashboard)
   - Go to Photo Upload
   - Select event and album
   - Drag & drop 20-50 images
   - Wait for upload to complete
   - Photos automatically stored on Cloudinary

4. **Publish Event** (Admin Dashboard)
   - Go to Events list
   - Click menu (⋮) on your event
   - Click Publish → Status: PUBLISHED

5. **View in Viewer** (Public Website)
   - Open http://localhost:5173
   - See published event card
   - Click to view gallery
   - See album tabs
   - Click tabs to switch albums
   - All photos display with Cloudinary optimization

---

## 🧪 Testing & Verification

👉 **[TESTING_GUIDE.md](TESTING_GUIDE.md)**
- 7-phase verification workflow
- Backend health checks
- Admin dashboard tests
- Photo upload verification
- Viewer display verification
- API endpoint tests
- Complete test scenarios
- Troubleshooting tests
- Performance testing
- Sign-off checklist

**Phases:**
1. Backend Verification (5 min)
2. Admin Dashboard Verification (10 min)
3. Album Management Verification (5 min)
4. Photo Upload Verification (10 min)
5. Publish Event Verification (2 min)
6. Viewer Website Verification (5 min)
7. API Verification (5 min)

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────┐
│     Admin Dashboard (Port 3001)     │
│        Create & Manage Content      │
└────────────────────┬────────────────┘
                     │
                     ↓ HTTP Requests
┌─────────────────────────────────────┐
│    Spring Boot Backend (Port 8080)  │
│    REST API + Business Logic        │
│    - Events: 8 endpoints            │
│    - Albums: 5 endpoints            │
│    - Photos: 5 endpoints            │
└────┬──────────────────────────┬─────┘
     │                          │
     ↓                          ↓
┌──────────────┐         ┌──────────────┐
│ MySQL 8.0    │         │  Cloudinary  │
│ Database     │         │  (CDN)       │
└──────────────┘         └──────────────┘
     ↑
     │ API Responses
┌─────────────────────────────────────┐
│    Viewer Website (Port 5173)       │
│    Browse Published Galleries       │
└─────────────────────────────────────┘
```

---

## 🔑 Key Features

### Backend
- ✅ RESTful API with 18 endpoints
- ✅ MySQL database with Flyway migrations
- ✅ Cloudinary integration for image hosting
- ✅ MapStruct for type-safe DTO mapping
- ✅ Global exception handling
- ✅ Constructor injection (no field injection)
- ✅ Transaction management
- ✅ Database indexes for performance

### Admin Dashboard
- ✅ Create/Edit/Delete events
- ✅ Manage albums per event
- ✅ Drag & drop photo upload
- ✅ Batch upload support
- ✅ Publish/Unpublish events
- ✅ Real-time preview
- ✅ Album name management (fully dynamic)
- ✅ Photo reordering

### Viewer Website
- ✅ Browse published events
- ✅ Event cards with cover images
- ✅ Dynamic gallery pages
- ✅ Album switching (tabs)
- ✅ Responsive image grid
- ✅ Cloudinary optimization
- ✅ Lazy image loading
- ✅ Loading/error states

---

## 💾 Data Flow

### From Admin to Viewer

```
User fills form in Admin
         ↓
Admin sends POST request to Backend
         ↓
Backend validates data
         ↓
Backend stores in MySQL
         ↓
Backend uploads image to Cloudinary
         ↓
Backend stores Cloudinary URL in database
         ↓
User publishes event
         ↓
Event status = PUBLISHED
         ↓
Viewer fetches GET /api/events
         ↓
Backend returns published events
         ↓
Viewer displays event cards
         ↓
User clicks event
         ↓
Viewer fetches GET /api/events/{id}
         ↓
Backend returns full event with albums & photos
         ↓
Viewer displays gallery with album tabs
         ↓
User sees all photos from Cloudinary
```

---

## 🔗 Service URLs (Local Development)

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:8080/api | REST endpoints |
| **Admin Dashboard** | http://localhost:3001 | Create/Manage content |
| **Viewer Website** | http://localhost:5173 | Public portfolio |
| **MySQL** | localhost:3306 | Database |

---

## 🛠️ Technology Stack

### Backend
- Java 21 LTS
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0+
- Cloudinary HTTP Client 1.36.0
- MapStruct 1.5.5
- Lombok 1.18.30
- Maven 3.9+
- Flyway (migrations)

### Admin Frontend
- React 18
- Vite (build tool)
- React Router v6
- Axios
- React Hook Form
- React Query v4
- Tailwind CSS
- Node.js 18+

### Viewer Website
- React 18
- Vite (build tool)
- React Router v6
- Axios
- CSS3
- Node.js 18+

---

## 📋 Complete Checklist

### One-Time Setup
- [ ] Java 21 installed
- [ ] MySQL 8.0+ installed and running
- [ ] Maven 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Cloudinary account created
- [ ] MySQL database created
- [ ] Cloudinary credentials set as env vars

### Running Services
- [ ] Backend running on port 8080
- [ ] Admin dashboard running on port 3001
- [ ] Viewer website running on port 5173

### Content Creation
- [ ] Event created
- [ ] Albums added (min 1)
- [ ] Photos uploaded (min 1)
- [ ] Event published
- [ ] Visible in viewer

### Verification
- [ ] Backend API responds
- [ ] Admin dashboard accessible
- [ ] Event appears in viewer
- [ ] Photos display from Cloudinary
- [ ] Album switching works
- [ ] No console errors

---

## 🆘 Need Help?

### Common Issues

**Backend won't start**
→ See COMPLETE_SETUP_GUIDE.md → Troubleshooting

**Admin can't connect to API**
→ See QUICK_START.md → Common Issues

**Photos not uploading**
→ See TESTING_GUIDE.md → Troubleshooting Tests

**Images show broken**
→ See TESTING_GUIDE.md → Test 4: Images Show as Broken

**Event not visible in viewer**
→ See TESTING_GUIDE.md → Troubleshooting Tests → Test 2

---

## 📞 Support Resources

### Documentation
- [QUICK_START.md](QUICK_START.md) - Fast setup
- [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) - Detailed guide
- [ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md) - UI walkthrough
- [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md) - Technical details
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Verification

### External Resources
- Spring Boot: https://spring.io/projects/spring-boot
- React: https://react.dev
- Cloudinary: https://cloudinary.com/documentation
- MySQL: https://dev.mysql.com/doc/

---

## 🎯 Next Steps After Setup

1. **Add Your Content**
   - Create multiple events
   - Upload hundreds of photos
   - Test with real wedding data

2. **Customize**
   - Update header/footer in viewer
   - Customize colors and fonts
   - Add logo and branding

3. **Production Deployment**
   - Deploy backend to Azure/AWS
   - Deploy admin to separate domain
   - Deploy viewer to CDN
   - Set up custom domain

4. **Add Authentication** (Future)
   - Add login to admin dashboard
   - Restrict access to admin
   - Add user management

5. **Enhanced Features** (Future)
   - Add search functionality
   - Add favorites/bookmarks
   - Add download options
   - Add watermarks
   - Add video support

---

## 📝 License & Credits

Built with:
- ✅ Enterprise Spring Boot 3 architecture
- ✅ Modern React 18 frontend
- ✅ Cloudinary image platform
- ✅ Production-ready patterns

---

## 🎉 You're Ready!

Start with **[QUICK_START.md](QUICK_START.md)** for fastest setup, or **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** for detailed instructions.

**Estimated time to first working system: 15 minutes**

Let's build amazing photography portfolios! 📸
