# TechFix Pro — MERN Multi-Device Repair Shop Management System

A production-ready full-stack MERN (MongoDB, Express.js, React, Node.js) web application built for laptop, desktop, and mobile repair centers.

## 🚀 Key Features

1. **Shop Setup Onboarding**: Enter Shop Name, Address, Gmail ID, Phone, and UPI ID on first login.
2. **Interactive Analytics Dashboard**: 7-day trend volume bar charts, device category distribution, stage funnel, and revenue meters.
3. **28-Day Free Trial Subscription**: 28-day 100% free trial for all admins, with renewal tiers of ₹599 for 1 month and ₹1,699 for 3 months (enforced via paywall middleware).
4. **Direct Inventory (+ / -) Stock Control**: 1-click addition and subtraction of product quantities with low-stock alert thresholds.
5. **Itemized Billing & Invoicing**: Parts, labor fees, 18% GST calculation, balance tracking, and printable A4 invoice with live UPI QR code (`upi://pay?pa=...`).
6. **WhatsApp & Email Alerts**: Automated intake receipt with tracking link and ready-for-delivery alert with payable total and store pickup details.
7. **Customer Live Tracking Portal**: Device tracking by Ticket ID or phone number.
8. **Dark Mode & Light Mode**: Instant theme toggle persistent across sessions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Nodemailer
- **Database**: MongoDB (Mongoose) with automatic resilient embedded JSON store fallback

---

## 💻 Local Development

### 1. Backend Server
```bash
cd server
npm install
npm run dev # or npm start
```
Running on: `http://localhost:5000`

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
Running on: `http://localhost:5173`

---

## 🌐 Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions to deploy to **Render** (Backend) and **Vercel** (Frontend) using GitHub.
