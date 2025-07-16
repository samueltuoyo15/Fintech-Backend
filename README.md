# VTU Backend API 🚀

This project delivers a robust and secure backend API for a Virtual Top-Up (VTU) application. It's built with Node.js and Express, designed to handle user authentication, account management, and seamless integration with external services for data, airtime, and bill payments. With a focus on scalability and maintainability, this API provides a solid foundation for any modern VTU platform.

## ⚙️ Installation

To get this project up and running on your local machine, follow these steps:

### 1. Clone the Repository

First, clone the project repository from GitHub:

```bash
git clone https://github.com/Minister-Isaac/Vtu-Backend.git
```

Navigate into the cloned directory:

```bash
cd Vtu-Backend
```

### 2. Install Dependencies

Install all the necessary Node.js packages using npm:

```bash
npm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root of the project directory. Populate it with the following environment variables. These are crucial for database connection, API keys, and other configurations.

```
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret for Authentication
JWT_SECRET_KEY=your_jwt_secret_key

# External VTU Backend API Details (replace with actual values)
EXTERNAL_BACKEND_DOMAIN=https://sandbox.externalvtuapi.com
EXTERNAL_BACKEND_API_KEY=your_external_vtu_api_key

# Monnify Payment Gateway Credentials
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code

# Frontend Domain for redirects and email verification links
FRONTEND_DOMAIN=http://localhost:3000

# Email Service (Nodemailer) Credentials
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port_number
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

**Note:** Replace `your_...` placeholders with your actual credentials. For `MONGODB_URI`, ensure it's a valid MongoDB connection string.

### 4. Start the Server

Once everything is configured, you can start the development server using:

```bash
npm run dev
```

Or, for a production environment:

```bash
npm start
```

The server should now be running on the port specified in your `.env` file (defaulting to `5000`).

## 🚀 Usage

This API provides various endpoints for user management and VTU services. All API endpoints are prefixed with `/api/v1`.

### Getting Started

Upon successful server startup, you can access the base endpoint:

`GET /`

This will return a welcome message indicating the server is running.

### Authentication

*   **User Registration:**
    `POST /api/v1/auth/register`
    _Body Example:_
    ```json
    {
      "full_name": "John Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "phone": "08012345678",
      "address": "123 Main St, City",
      "password": "StrongPassword123",
      "referral_username": "referrer_user"
    }
    ```

*   **Email Verification:** (Link sent to email after registration)
    `GET /api/v1/auth/verify-email?token=yourVerificationToken`

*   **User Login:**
    `POST /api/v1/auth/login`
    _Body Example:_
    ```json
    {
      "username": "johndoe",
      "password": "StrongPassword123"
    }
    ```
    Upon successful login, `accessToken` and `refreshToken` cookies will be set.

*   **Refresh Token:**
    `POST /api/v1/auth/refresh-token`
    (Requires `refreshToken` cookie)

*   **User Logout:**
    `POST /api/v1/auth/logout`
    (Requires `accessToken` in `Authorization` header or `accessToken` cookie)

### Wallet & Payments

*   **Fund Wallet:**
    `POST /api/v1/payment/fund-wallet`
    (Requires `accessToken`)
    _Body Example:_
    ```json
    {
      "email": "john.doe@example.com",
      "amount": 5000
    }
    ```
    This initiates a payment with Monnify and returns a checkout URL.

*   **Verify Payment (Webhook):**
    `POST /api/v1/payment/verify-payment`
    This is a webhook endpoint configured with Monnify to automatically verify and update wallet balances upon successful transactions.

### VTU Services (Requires `accessToken`)

*   **Buy Data Subscription:**
    `POST /api/v1/subscribe/data`
    _Body Example:_
    ```json
    {
      "network": 1,
      "phone": "08012345678",
      "plan": 358,
      "ported_number": false
    }
    ```

*   **Buy Airtime Subscription:**
    `POST /api/v1/subscribe/airtime`
    _Body Example:_
    ```json
    {
      "network": 1,
      "phone": "08012345678",
      "amount": 1000,
      "airtime_type": "VTU",
      "ported_number": false
    }
    ```

*   **Pay Electricity Bills:**
    `POST /api/v1/subscribe/electricity`
    _Body Example:_
    ```json
    {
      "disco_name": "Ikeja Electric",
      "amount": 5000,
      "meter_number": "1234567890",
      "meter_type": "Prepaid"
    }
    ```

*   **Buy Cable Subscription:**
    `POST /api/v1/subscribe/cable`
    _Body Example:_
    ```json
    {
      "cable_name": "DSTV",
      "cable_plan": "DStv Yanga",
      "smart_card_number": "1234567890",
      "amount": 6000
    }
    ```

### Utility Endpoints (Requires `accessToken`)

*   **Query All Transaction  for the user**: `GET /api/v1/subscribe/transactions`.

*   **Query Data Transaction**: `GET /api/v1/subscribe/query-data/:transactionId`.

*   **Query Airtime Transaction**: `GET /api/v1/subscribe/query-airtime/:transactionId`.

*   **Query Electricity Bill**: `GET /api/v1/subscribe/query-electricity-bill`.

*   **Validate UIC (Cable TV)**: `GET /api/v1/subscribe/validate-uic?smart_card_number={num}&cable_name={name}`.

*   **Validate Meter (Electricity)**: `GET /api/v1/subscribe/validate-meter?meternumber={num}&disconame={name}&metertype={type}`.

*   **Get Data Plans:**
    `GET /api/v1/plans/data-plans`

*   **Get Networks:**
    `GET /api/v1/plans/networks`

*   **Get Cable Providers:**
    `GET /api/v1/plans/cables`

*   **Get Cable Plans:**
    `GET /api/v1/plans/cable-plans`

*   **Get Electricity Discos:**
    `GET /api/v1/plans/discos`

## ✨ Features

This backend API is packed with functionalities to provide a seamless VTU experience:

*   🔒 **Robust User Authentication**: Secure registration, login, and email verification processes using JWT for access and refresh tokens, ensuring secure session management.
*   💼 **Comprehensive Account Management**: Users have individual accounts with wallet balances, transaction history, and referral tracking.
*   📞 **Virtual Top-Up Services**: Effortlessly purchase data and airtime across various network providers.
*   💡 **Utility Bill Payments**: Streamlined payments for electricity and cable TV subscriptions.
*   🔄 **External API Integration**: Seamlessly connects with third-party VTU and payment gateway providers (Monnify) for real-time transactions.
*   🛡️ **Input Validation**: Utilizes Joi for robust request body validation, ensuring data integrity and preventing common input-related vulnerabilities.
*   ✍️ **Centralized Logging**: Implemented Pino for efficient and structured logging, aiding in debugging and monitoring.
*   🌐 **CORS Configuration**: Properly configured Cross-Origin Resource Sharing for secure communication with frontend applications.
*   🚨 **Global Error Handling**: A centralized error handling middleware ensures a consistent and graceful response to unexpected errors.
*   Referral System: Rewards users for referring new sign-ups.

## 🛠️ Technologies Used

The project leverages a modern JavaScript ecosystem for a powerful and scalable backend.

| Technology      | Description                                                 | Link                                             |
| :-------------- | :---------------------------------------------------------- | :----------------------------------------------- |
| **Node.js**     | JavaScript runtime for server-side execution.               | [nodejs.org](https://nodejs.org/en/)             |
| **Express.js**  | Fast, unopinionated, minimalist web framework for Node.js.  | [expressjs.com](https://expressjs.com/)          |
| **MongoDB**     | NoSQL database for flexible data storage.                   | [mongodb.com](https://www.mongodb.com/)          |
| **Mongoose**    | MongoDB object data modeling (ODM) for Node.js.             | [mongoosejs.com](https://mongoosejs.com/)        |
| **Argon2**      | Powerful hashing algorithm for password security.           | [npmjs.com/package/argon2](https://www.npmjs.com/package/argon2) |
| **JSON Web Token (JWT)** | Securely transmits information between parties.        | [jwt.io](https://jwt.io/)                        |
| **Joi**         | Data validation library for JavaScript.                     | [joi.dev](https://joi.dev/)                      |
| **Axios**       | Promise-based HTTP client for making API requests.          | [axios-http.com](https://axios-http.com/)        |
| **Pino**        | Extremely fast and low overhead logger.                     | [getpino.io](https://getpino.io/)                |
| **Nodemailer**  | Module for sending emails from Node.js applications.        | [nodemailer.com](https://nodemailer.com/)        |
| **Dotenv**      | Loads environment variables from a `.env` file.             | [npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| **Helmet**      | Helps secure Express apps by setting various HTTP headers.  | [helmetjs.com](https://helmetjs.com/)            |
| **Cors**        | Provides a Connect/Express middleware that can be used to enable CORS. | [npmjs.com/package/cors](https://www.npmjs.com/package/cors) |
| **Cookie-parser** | Parse Cookie header and populate `req.cookies`.         | [npmjs.com/package/cookie-parser](https://www.npmjs.com/package/cookie-parser) |
| **Nanoid**      | Tiny, secure, URL-friendly, unique string ID generator.     | [npmjs.com/package/nanoid](https://www.npmjs.com/package/nanoid) |

---

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-brightgreen.svg)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-15-blue.svg)](./package.json)
[![Dev Dependencies](https://img.shields.io/badge/devdependencies-1-blue.svg)](./package.json)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)