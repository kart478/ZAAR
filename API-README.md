# Secure Email Password Reset API

A production-ready, secure email password reset API built with Node.js, Express, and TypeScript. Implements industry best practices for security, rate limiting, and user experience.

## 🚀 Features

- **Secure Code Generation**: 6-digit numeric codes with bcrypt hashing
- **JWT Reset Tokens**: Short-lived tokens for password reset
- **Rate Limiting**: Prevents abuse and brute force attacks
- **Email Integration**: Support for Nodemailer, SendGrid, and Resend
- **Security Best Practices**: Generic responses, HTTPS-safe, environment variables
- **Database Abstraction**: Works with any database (MongoDB, SQL, Convex)
- **Frontend Ready**: React hooks and client service included
- **Professional Email Templates**: Beautiful HTML email templates
- **Comprehensive Error Handling**: Graceful error responses
- **TypeScript**: Full type safety throughout

## 📋 API Endpoints

### 1. Request Password Reset
```
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with this email exists, a verification code has been sent."
}
```

### 2. Verify Reset Code
```
POST /api/auth/verify-reset-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Code verified successfully. You can now reset your password."
}
```

### 3. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

## 🛡️ Security Features

### Rate Limiting
- **Password Reset Requests**: 3 requests per 15 minutes per IP
- **Code Verification Attempts**: 10 attempts per 15 minutes per IP
- **Automatic Cleanup**: Expired codes/tokens cleaned every 5 minutes

### Security Measures
- **Generic Responses**: Never reveals if email exists
- **Code Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short-lived (15 minutes) reset tokens
- **Input Validation**: Comprehensive input sanitization
- **HTTPS Safe**: Secure headers and practices
- **Environment Variables**: Sensitive data in environment

### Password Security
- **Minimum Length**: 8 characters
- **Complexity Requirements**: Uppercase, lowercase, numbers
- **Secure Hashing**: bcrypt with 10 salt rounds
- **One-time Use**: Codes and tokens invalidated after use

## 📧 Email Integration

### Nodemailer (Default)
```javascript
// Configure in .env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

### SendGrid
```javascript
// Configure in .env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourapp.com
```

### Resend
```javascript
// Configure in .env
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourapp.com
```

## 🗄️ Database Integration

### MongoDB Example
```javascript
class MongoDBService extends DatabaseService {
  private db: Db;

  async findUserByEmail(email: string): Promise<any> {
    return this.db.collection('users').findOne({ email });
  }

  async storeResetCode(resetCode: ResetCode): Promise<void> {
    await this.db.collection('resetCodes').insertOne(resetCode);
  }

  // ... implement other methods
}
```

### SQL Example
```javascript
class SQLService extends DatabaseService {
  async findUserByEmail(email: string): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    return result.rows[0];
  }

  // ... implement other methods
}
```

## 📱 Frontend Integration

### React Hook Usage
```javascript
import { usePasswordReset } from './services/passwordResetClient';

function PasswordResetComponent() {
  const { 
    loading, 
    error, 
    requestReset, 
    verifyCode, 
    resetPassword,
    validators 
  } = usePasswordReset();

  const handleRequestReset = async () => {
    try {
      await requestReset('user@example.com');
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  // ... component implementation
}
```

### Client Service Usage
```javascript
import { PasswordResetClient } from './services/passwordResetClient';

const client = new PasswordResetClient('/api');

// Request password reset
const result1 = await client.requestPasswordReset('user@example.com');

// Verify code
const result2 = await client.verifyResetCode('user@example.com', '123456');

// Reset password
const result3 = await client.resetPassword('token', 'newPassword');
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Copy API package.json to package.json
cp api-package.json package.json

# Install dependencies
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp api-env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm run build
npm start
```

## 📋 Environment Variables

### Required
- `JWT_SECRET`: Secret key for JWT signing
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password

### Optional
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3001)
- `EMAIL_HOST`: SMTP host
- `EMAIL_PORT`: SMTP port
- `EMAIL_FROM`: From email address

## 🔧 Configuration

### Rate Limiting
```javascript
// Custom rate limits
const resetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});
```

### Email Templates
```javascript
// Customize email template
private getPasswordResetTemplate(code: string): string {
  return `
    <div class="container">
      <h1>Password Reset</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
}
```

## 🧪 Testing

### API Testing
```bash
# Request password reset
curl -X POST http://localhost:3001/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify code
curl -X POST http://localhost:3001/api/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Reset password
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken":"token","newPassword":"newPassword123"}'
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

## 📊 Monitoring & Logging

### Request Logging
```javascript
// Add to your Express app
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Error Monitoring
```javascript
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});
```

## 🔒 Security Checklist

- [ ] JWT secret is strong and unique
- [ ] Email credentials are secure
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured
- [ ] Input validation is implemented
- [ ] Error messages are generic
- [ ] Environment variables are used
- [ ] Database connections are secure
- [ ] CORS is properly configured
- [ ] Security headers are set

## 📈 Production Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/password-reset.js"]
```

### Environment Setup
```bash
# Production environment variables
export NODE_ENV=production
export JWT_SECRET=your-production-secret
export EMAIL_HOST=your-smtp-host
export EMAIL_USER=your-production-email
export EMAIL_PASS=your-production-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email support@yourapp.com
- Check the documentation

---

**Built with ❤️ for secure password management**
