# FIMS - Farmers Information Management System

A comprehensive React Native mobile application for registering and managing farmer information in Nigeria, built for the CCSA (Cooperative Credit Society of Agriculture).

## 📱 Features

### Authentication
- **Agent Login**: Secure authentication for enrolment agents
- **Firebase Integration**: User management and authentication
- **Firebase Auth Tokens**: Secure API communication

### Farmer Registration
- **Multi-step Registration Form**: Streamlined farmer onboarding
- **NIN Lookup**: Automatic data population from National Identity Number
- **Validation**: Comprehensive form validation with Zod
- **Unique Constraints**: Prevents duplicate entries (NIN, Phone, Email, BVN)

### Data Management
- **CRUD Operations**: Create, Read, Update, Delete farmer records
- **Search Functionality**: Search by NIN, name, phone, or email
- **Pagination**: Efficient data loading and navigation
- **Real-time Updates**: Live data synchronization

### Geolocation
- **GPS Integration**: Capture farmer and farm locations
- **Map Integration**: Interactive maps with react-native-maps
- **Polygon Mapping**: Define farm boundaries (planned)

### Certificate Generation
- **PDF Certificates**: Generate official farmer certificates
- **QR Code Integration**: Unique QR codes for verification
- **Digital Signatures**: Secure certificate validation

### Analytics & Reporting
- **Dashboard Analytics**: Registration statistics and trends
- **Data Visualization**: Charts and graphs for insights
- **Export Capabilities**: Data export for reporting

## 🛠 Tech Stack

### Frontend (React Native)
- **Framework**: Expo SDK 49+
- **Navigation**: React Navigation (Stack, Bottom Tabs, Drawer)
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **UI Components**: Native components with custom styling
- **Maps**: react-native-maps, expo-location
- **QR/Barcode**: react-native-qrcode-svg
- **PDF Generation**: react-native-html-to-pdf

### Backend (Next.js)
- **Framework**: Next.js 13+ with App Router
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **Authentication**: Firebase Auth + Firebase Admin SDK
- **API**: RESTful API with server actions
- **Validation**: Zod schemas

### Database Schema
- **Users**: Enrolment agents management
- **Farmers**: Core farmer information
- **Referees**: Farmer references (up to 3 per farmer)
- **Certificates**: Digital certificates with QR codes
- **Analytics**: Usage statistics and metrics
- **Audit Logs**: System activity tracking

## 📱 App Structure

```
src/
├── components/
│   └── forms/           # Form step components
├── navigation/          # Navigation configuration
├── screens/            # Main app screens
├── services/           # API and external services
├── store/              # State management (Zustand)
├── types/              # TypeScript definitions
└── utils/              # Utility functions and validation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- PostgreSQL database (NeonDB recommended)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ccsa-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   # Terminal 1: Start React Native
   npm start

   # Terminal 2: Start backend API
   cd backend
   npm run dev
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=your-neondb-connection-string

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# External APIs
NIN_API_URL=https://e-nvs.digitalpulseapi.net/api/lookup/nin
NIN_API_KEY=your-nin-api-key
```

## 📱 Screen Flow

### Authentication Flow
1. **Welcome Screen** → Login/Register options
2. **Login Screen** → Agent authentication
3. **Register Screen** → New agent registration (if enabled)

### Main App Flow
1. **Add Farmer** → Multi-step registration form
2. **View Farmers** → List of registered farmers
3. **Search** → Search farmers by various criteria
4. **Certificate** → Generate and manage certificates
5. **Profile** → Agent profile and settings
6. **Analytics** → Registration statistics

### Form Steps
1. **NIN Lookup** → Validate and fetch NIN data
2. **Personal Info** → Basic farmer details
3. **Contact Info** → Address and location
4. **Bank Info** → Banking details
5. **Referee Info** → Reference contacts (optional)
6. **Farm Info** → Farm details and location (optional)

## 🔧 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Agent login
- `POST /api/auth/register` - Agent registration
- `POST /api/auth/logout` - Logout

### Farmers
- `GET /api/farmers` - List farmers (with pagination)
- `POST /api/farmers` - Create farmer
- `GET /api/farmers/:id` - Get farmer details
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer
- `GET /api/farmers/search` - Search farmers
- `GET /api/farmers/validate` - Validate unique fields

### Certificates
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Generate certificate
- `GET /api/certificates/:id` - Get certificate

### Analytics
- `GET /api/analytics` - Get analytics data

### External Services
- `GET /api/nin/lookup` - NIN lookup service

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **CORS Protection**: Configured cross-origin resource sharing
- **Data Encryption**: Sensitive data encryption at rest

## 📝 Business Rules

### Farmer Registration
- NIN must be unique and exactly 11 digits
- Phone number must be unique and exactly 11 digits
- Email must be unique (if provided)
- BVN must be unique and exactly 11 digits (if provided)
- Account number must be exactly 10 digits (if provided)

### Certificate Generation
- Only active farmers can receive certificates
- Each certificate has a unique QR code
- Certificates are linked to the issuing agent

### Data Integrity
- All operations are logged for audit purposes
- Referees are automatically deleted when farmer is deleted
- Certificates are automatically deleted when farmer is deleted

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: abdulrahman.dauda@cosmopolitan.edu.ng
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic farmer registration
- ✅ Authentication system
- ✅ Search functionality
- ✅ Certificate generation

### Phase 2 (Planned)
- 🔄 Farm polygon mapping
- 🔄 Offline capability
- 🔄 Batch data import/export
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 Multi-language support
- 📋 Push notifications
- 📋 Integration with government APIs
- 📋 Mobile payments integration

---

**Built with ❤️ for Nigerian Farmers**
