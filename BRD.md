1. Product Overview

A unified medical appointment and queue management platform enabling patients to book appointments with doctors using a small booking fee, while clinics manage schedules and live queues efficiently.

2. User Roles & Access
Patient

Book appointment

Pay booking fee

View token & live queue

Receive reminders

Doctor

Manage schedule

Set booking fee

View appointments

Control queue

Clinic Staff

Manage daily queue

Mark visit status

Handle walk-ins

Admin

Platform oversight

Manual corrections

Dispute handling

3. Functional Requirements
3.1 Appointment Booking

Slot-based booking

Auto-expiry if unpaid

Max bookings per patient/day

Walk-in support

3.2 Payment (Mandatory)

Partial booking fee

Razorpay integration

UPI + Cards

Payment verification via webhook

Refund only if doctor cancels

3.3 Queue Management

Token generation on payment

Live queue updates

Doctor pause/resume

Delay handling

“You’re next” notification

3.4 Notifications

Booking confirmation

Payment success/failure

Queue alerts

Cancellation alerts

4. Non-Functional Requirements

Mobile-first

<2s page load

99% uptime

Secure payment handling

Role-based access

5. UX / UI Requirements
Patient UX

Minimal steps

Clear payment explanation

Visible queue status

No app install required

Doctor UX

One-screen daily view

Queue controls always visible

Large fonts for clinic use

Staff UX

Tablet-friendly

One-click actions

Zero clutter

6. Success Metrics

No-show rate reduction

Avg queue waiting time

Repeat bookings

Doctor retention