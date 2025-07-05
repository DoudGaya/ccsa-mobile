# FIMS (Farmers Information Management System) - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React Native Farmers Information Management System (FIMS) for Nigerian farmer registration and management.

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Next.js with server actions
- **Database**: NeonDB (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Navigation**: React Navigation (Stack + Bottom Tabs + Drawer)
- **Geolocation**: react-native-maps, expo-location
- **PDF/Barcode**: react-native-html-to-pdf, react-native-qrcode-svg

## Key Features
1. **Authentication**: Email/password login for Enrolment Agents
2. **Farmer Registration**: Multi-step form with NIN lookup and validation
3. **Geolocation**: GPS capture and farm polygon mapping
4. **Search**: Search farmers by NIN, name, or phone
5. **Certificate Generation**: PDF certificates with QR codes
6. **Data Management**: CRUD operations for farmer data

## Validation Rules
- NIN, Email, Phone, BVN must be unique
- BVN: 11 digits
- Account Number: 10 digits
- Phone Numbers: 11 digits
- All fields validated before submission

## Navigation Structure
- **Primary Navigation (Bottom Tabs)**: Add Farmer, View Farmers, Search, Certificate
- **Secondary Navigation (Drawer)**: Profile, Analytics, Logout

## Form Structure
1. **NIN Lookup**: Auto-fill personal data
2. **Contact Information**: Address and location details
3. **Bank Information**: BVN and account details
4. **Referee Information**: Up to 3 referees
5. **Farm Information**: Optional location and crop data

## Code Style Guidelines
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Use consistent naming conventions
- Add proper validation to all forms
- Implement loading states for async operations
