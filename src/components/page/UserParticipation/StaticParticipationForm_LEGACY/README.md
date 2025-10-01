# Static Participation Form (LEGACY)

⚠️ **THIS COMPONENT IS NO LONGER USED**

This folder contains the original static participation form that was used before the dynamic form implementation.

## Why it's legacy:
- The application now uses dynamic forms based on the form selected during event creation
- Step 2 is now completely dynamic using `DynamicParticipantForm` component
- This static form had hardcoded fields and was not flexible

## Current Implementation:
- **Step 1:** Login (unchanged)
- **Step 2:** Dynamic form rendering based on selected form (`DynamicParticipantForm`)
- **Step 3:** QR/Success page (unchanged)

## If you need to reference the old implementation:
- The old form had static fields: first_name, last_name, designation, organization, contact, address, country, state, city, etc.
- Face scanner integration
- Static form validation using Formik + Yup

## Do not use this component in the application anymore.
