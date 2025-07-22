This is still in development and the core structures are developed, still the UI needs to be done properly

# 🔐 Authentication System with JWT, OTP, Redis, and DynamoDB

A complete Node.js-based authentication system built using **Express.js**, **JWT**, **bcrypt**, **Redis**, **Nodemailer**, and **DynamoDB**. This project covers secure login, signup, email-based OTP verification, session management, and protected routes.

---

## 📦 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** AWS DynamoDB  
- **Session Store:** Redis (via ioredis + connect-redis)  
- **Authentication:** JWT + OTP via Email  
- **Password Security:** Bcrypt  
- **Templating Engine:** EJS  
- **UI Framework:** Bootstrap 4.1  
- **Mail Service:** Nodemailer (Gmail SMTP)

---

## 🚀 Features

- ✅ User Signup with email & hashed password  
- ✅ Login with bcrypt password verification  
- ✅ OTP-based two-factor authentication (1-minute expiry)  
- ✅ JWT Token creation after OTP verification  
- ✅ Session storage using Redis  
- ✅ Protected dashboard route  
- ✅ Logout functionality  
- ✅ Session flash-like feedback using EJS views  

---

## 📂 Project Structure

```
project/
│
├── views/
│   ├── signup.ejs
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── userExists.ejs
│   └── verifyOtp.ejs
│
├── public/                  # (optional) for static assets
│
├── index.js                 # Main server file
├── package.json
└── README.md
```

---

## 🔧 Prerequisites

- Node.js v18 or above  
- Redis installed and running on localhost (`127.0.0.1:6379`)  
- AWS DynamoDB Table `UserTable` with fields:
  - `username` (partition key)
  - `name`
  - `password`  
- Gmail account with [App Passwords](https://support.google.com/accounts/answer/185833?hl=en) enabled for Nodemailer

---

## ⚙️ Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/your-username/authentication-system.git
cd authentication-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Start Redis**

If Redis is not already running:

```bash
redis-server
```

4. **Update Gmail credentials in `index.js`**

```js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // App password, NOT your Gmail password
  }
});
```

5. **Run the server**

```bash
node index.js
```

6. **Access the app**

Open your browser and visit:

```
http://localhost:3000
```

---

## 🧪 Demo Flow

1. Navigate to `/signup` and register a new user.
2. Then go to `/login` and enter your credentials.
3. An OTP is sent to your email.
4. Enter the OTP on `/verify-otp` page.
5. Once verified, you are redirected to the `/dashboard`.
6. Use `/logout` to end the session and clear the token.

---

## 🔐 Security Practices

- Passwords are hashed using bcrypt before storage.
- OTPs are time-limited to 1 minute.
- JWT tokens are signed with a secret and expire in 7 hours.
- Sessions are stored securely using Redis.
- Cookies are marked as `httpOnly` for protection against XSS.

---

## ✅ API Summary

| Method | Route         | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/signup`     | Render signup page             |
| POST   | `/signup`     | Create a new user              |
| GET    | `/login`      | Render login page              |
| POST   | `/login`      | Login and send OTP             |
| GET    | `/verify-otp` | Enter OTP for verification     |
| POST   | `/verify-otp` | Verify OTP and issue JWT token |
| GET    | `/dashboard`  | Protected dashboard route      |
| GET    | `/logout`     | Clear session and logout       |

---

## 📜 License

This project is for educational purposes only. You are free to fork and use it in your own applications.

---

## 🤝 Credits

Built with ❤️ by Prasanna
