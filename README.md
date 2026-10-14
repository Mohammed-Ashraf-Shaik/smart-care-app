# 🏥 SmartCare — Digital Healthcare & Hospital Operations Platform

**SmartCare** is an integrated, fast, and accessible digital healthcare web platform designed to eliminate crowded hospital waiting halls, streamline clinical visits, coordinate emergency services, and give patients seamless control of their health data.

---

## 🌟 What SmartCare Does

- 📱 **Patient Care & Live Token Queue**: Book doctor appointments from home, view estimated wait times, and track live queue progress directly on mobile.
- 📋 **Digital Medical Passport**: Instant, secure access to medical history, active medications, allergies, and past visit summaries with one-click printable PDF reports.
- 🩺 **Doctor & Clinical Workspace**: Real-time consultation queue, patient vitals recording, and instant digital prescription generation.
- 🏥 **Hospital Operations & Analytics**: Real-time ward & room tracking, daily patient influx metrics, and operational performance insights.
- 🚑 **Emergency Ambulance Dispatch**: One-touch GPS ambulance request, real-time driver tracking, and pre-alert notifications sent directly to the destination hospital.
- 💊 **In-House Pharmacy**: Hospital formulary catalog, Jan Aushadhi generic savings, and quick counter pickup or local delivery fulfillment.
- 🩸 **Blood & Organ Donation Network**: Searchable community donor network matching donors and recipients by blood group and geographic area.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/Mohammed-Ashraf-Shaik/smart-care-app.git
cd smart-care-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Access (One-Click Logins)

The application includes pre-configured demo profiles for testing all roles:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@gmail.com` | `1234` | Patient Portal, Appointments, Queue & History |
| **Doctor / Hospital** | `hospital@gmail.com` | `1234` | Clinical Consultation, Queue & Prescriptions |
| **Hospital Operations** | `admin@gmail.com` | `1234` | Room Allocations, Facility Analytics & Desk |

*You can also switch roles on the fly using the built-in Role Switcher in the top navigation bar without logging out.*

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Vanilla ES Modules (zero-dependency, high performance)
- **Styling**: Modern responsive CSS with full mobile optimization & Dark/Light mode
- **Build Tool**: Vite 5 (instant Hot Module Replacement)
- **Maps**: Interactive OpenStreetMap / Leaflet integration for hospital locations and emergency dispatch
- **Storage**: Client-side reactive state engine with persistent offline-first storage

---

## 📱 Mobile Optimized

Fully responsive and mobile-first, designed to work smoothly on devices from 320px screens up to 4K displays with accessible touch targets ($\ge 48\text{px}$) and zero layout clipping.

---

## 📜 Commands

```bash
npm run dev      # Start local dev server (http://localhost:5173)
npm run lint     # Run code syntax & health checks
npm run build    # Build optimized production bundle
npm run preview  # Test production build locally
```
