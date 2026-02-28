# CampusBook React Frontend

A modern, fully-featured React frontend for the Campus Facility Booking System.  
Built to integrate seamlessly with the Spring Boot backend.

---

## Features

- **Authentication** — Session-based login/register with role-aware routing
- **User Dashboard** — Upcoming bookings, facility overview, quick actions
- **Admin Dashboard** — System-wide stats, recent bookings, facility utilization charts, quick actions
- **Facilities** — Grid/list view, search, CRUD (admin only), capacity display
- **Bookings** — Tabbed view (Upcoming / All / Cancelled), real-time availability check, create/edit/cancel
- **User Management** — Admin-only table with edit and delete
- **Profile** — Edit name/email/password, booking history

---

## Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Vite | Build tool + dev server |
| Lucide React | Icon set |
| date-fns | Date formatting |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Spring Boot backend running on `http://localhost:8080`

### Development

```bash
cd campus-booking-frontend
npm install
npm run dev
```

Vite runs on `http://localhost:3000` and proxies all API calls (`/auth`, `/users`, `/facilities`, `/bookings`) to `http://localhost:8080`.

### Production Build

**Option A — Standalone (SPA)**
```bash
npm run build
# Outputs to: dist/
# Deploy dist/ behind a web server configured for SPA routing
```

**Option B — Embed into Spring Boot (Recommended)**
```bash
npm run build:spring
# Builds directly into: ../Bookingmanagement/src/main/resources/static/
# Spring Boot then serves the React app at http://localhost:8080/
```

After `build:spring`, run `./mvnw spring-boot:run` and visit `http://localhost:8080`.

> **Note:** For SPA routing to work in Spring Boot, the `WebConfig.java` must forward unknown paths to `index.html`. See below.

---

## Spring Boot Integration

### 1. Update `WebConfig.java` for SPA routing

Add a view controller to forward all unmatched routes to React's `index.html`:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward all non-API, non-asset paths to index.html for React Router
        registry.addViewController("/{path:[^\\.]*}").setViewName("forward:/index.html");
    }
}
```

### 2. API Endpoints Used

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Session | Logout |
| POST | `/users` | Public | Register |
| GET | `/users` | Admin | List all users |
| GET | `/users/{id}` | Self/Admin | Get user |
| PUT | `/users/{id}` | Self/Admin | Update user |
| DELETE | `/users/{id}` | Admin | Delete user |
| GET | `/facilities` | Authenticated | List facilities |
| POST | `/facilities` | Admin | Create facility |
| PUT | `/facilities/{id}` | Admin | Update facility |
| DELETE | `/facilities/{id}` | Admin | Delete facility |
| GET | `/bookings` | Authenticated | List bookings |
| POST | `/bookings` | Authenticated | Create booking |
| PUT | `/bookings/{id}` | Owner/Admin | Update booking |
| DELETE | `/bookings/{id}` | Owner/Admin | Cancel booking |
| GET | `/bookings/availability` | Authenticated | Check slot availability |

### 3. Session Cookies

The frontend uses `credentials: 'include'` on all fetch calls. Spring Boot's session-based auth sets a `JSESSIONID` cookie on login. No JWT configuration needed.

Ensure Spring Security allows the React dev origin during development:

```java
// In SecurityConfig.java — add for dev:
configuration.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://localhost:8080"));
configuration.setAllowCredentials(true);
```

---

## Project Structure

```
src/
├── api/
│   └── client.js          # All API calls, error parsing
├── context/
│   └── AuthContext.jsx    # Global auth state (user, signIn, signOut, isAdmin)
├── hooks/
│   └── useToast.jsx       # Toast notification system
├── components/
│   ├── Navbar.jsx         # Top navigation
│   ├── Modal.jsx          # Reusable modal dialog
│   └── ProtectedRoute.jsx # Auth + role guard
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx      # Student/staff dashboard
│   ├── AdminDashboard.jsx # Admin overview
│   ├── Facilities.jsx     # Facility browser + CRUD
│   ├── Bookings.jsx       # Booking management + availability
│   ├── Users.jsx          # Admin: user management
│   └── Profile.jsx        # User profile + history
├── App.jsx                # Router + layout
├── main.jsx               # React entry point
└── index.css              # Design system tokens + global styles
```

---

## Customisation

All design tokens are CSS variables in `index.css`:

```css
:root {
  --navy: #0e1b2e;      /* Primary background */
  --gold: #c9a84c;      /* Accent / brand colour */
  --cream: #f5f0e8;     /* Heading text */
  /* ... */
}
```

Change `--gold` to your institution's brand colour to quickly adapt the theme.
