# VTU Global Backend API

## Overview
This is a robust and scalable backend API for a Virtual Top-Up (VTU) and bill payment application, built using Node.js with the Express framework. It facilitates user authentication, wallet management, and seamless integration with third-party VTU and payment gateways.

## Features
- **Node.js & Express**: High-performance API server for handling requests.
- **MongoDB & Mongoose**: Flexible NoSQL database for data storage and ODM for schema management.
- **Redis & BullMQ**: Caching for frequently accessed data and a robust queueing system for asynchronous transaction processing.
- **Argon2**: Secure password hashing for strong user authentication.
- **JSON Web Tokens (JWT)**: Secure and stateless authentication mechanisms for access and refresh tokens.
- **Joi**: Powerful schema validation for incoming request payloads.
- **Paystack Integration**: Seamless wallet funding and payment verification.
- **VTU Africa Integration**: Comprehensive services for data, airtime, electricity, and cable subscriptions.
- **Email Service (Nodemailer)**: Account verification and communication.
- **Pino Logger**: Structured and performant logging for development and production.
- **CORS & Helmet**: Enhanced API security with Cross-Origin Resource Sharing and HTTP header protection.
- **Rate Limiting**: Protection against abuse and DoS attacks.
- **Transaction Queues**: Asynchronous processing of wallet funding transactions for reliability.
- **Comprehensive Transaction History**: Tracking of all user transactions.

## Getting Started

### Installation
To get this project up and running on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Vtu-Backend.git
    cd Vtu-Backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

### Environment Variables
Create a `.env` file in the root directory of the project and populate it with the following environment variables:

```
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/vtu-backend
REDIS_URL=redis://localhost:6379

JWT_SECRET_KEY=your_super_secret_jwt_key

FRONTEND_DOMAIN=http://localhost:3000

GMAIL_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

VTU_AFRICA_DOMAIN=https://vtuafrica.com.ng/api
VTUAFRICA_API_KEY=your_vtu_africa_api_key
VTUAFRICA_AIRTME2_CASH_PHONE_NUMBER=your_airtime2cash_phone_number # Note: This feature's code is currently commented out.

PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_URL=https://api.paystack.co
```

### Usage
To start the development server with hot-reloading:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

The API will be accessible at the `PORT` specified in your `.env` file (default: `http://localhost:5000`).

## API Documentation

### Base URL
`http://localhost:5000/api/v1`

### Endpoints

#### `POST /api/v1/auth/register`
Registers a new user account.
**Request**:
```json
{
  "full_name": "John Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "phone": "08012345678",
  "address": "123 Main St, City, Country",
  "password": "StrongPassword123",
  "referral_username": "referrer_user" // Optional
}
```
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully. Kindly check your email and verify your account"
}
```
**Errors**:
- `422 Unprocessable Entity`: All required fields are missing.
- `409 Conflict`: User or username already exists.
- `500 Internal Server Error`: Server-side error during registration.

#### `GET /api/v1/auth/verify-email`
Verifies a user's email address using a token sent to their email.
**Request**:
Query Parameter:
`?token=your_email_verification_token`
**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```
**Errors**:
- `400 Bad Request`: Missing token or invalid/expired token.
- `404 Not Found`: User not found for the given token.
- `400 Bad Request`: User already verified.
- `500 Internal Server Error`: Server-side error during verification.

#### `POST /api/v1/auth/login`
Authenticates a user and issues access and refresh tokens.
**Request**:
```json
{
  "username": "johndoe",
  "password": "StrongPassword123"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "your_access_token_jwt"
}
```
*Note: `accessToken` and `refreshToken` are also set as HTTP-only cookies.*
**Errors**:
- `422 Unprocessable Entity`: Username or password missing.
- `404 Not Found`: User not found.
- `401 Unauthorized`: Invalid password or account not verified.
- `500 Internal Server Error`: Server-side error during login.

#### `POST /api/v1/auth/logout`
Logs out the currently authenticated user by invalidating their refresh token and clearing cookies.
**Request**:
No payload. Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `500 Internal Server Error`: Server-side error during logout.

#### `POST /api/v1/auth/refresh-token`
Refreshes access token using a valid refresh token.
**Request**:
No payload. Requires `refreshToken` cookie.
**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "new_access_token_jwt"
}
```
*Note: New `accessToken` and `refreshToken` are also set as HTTP-only cookies.*
**Errors**:
- `400 Bad Request`: Missing refresh token.
- `401 Unauthorized`: Invalid or expired refresh token, or user not found.
- `500 Internal Server Error`: Server-side error during token refresh.

#### `GET /api/v1/auth/me`
Retrieves details of the currently authenticated user and their account.
**Request**:
No payload. Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "source": "redis-cache", // or "database"
  "user": {
    "_id": "65b75017c6b9d62d29b207a9",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "08012345678",
    "address": "123 Main St, City",
    "is_verified": true,
    "createdAt": "2024-01-29T15:26:47.348Z",
    "updatedAt": "2024-01-29T15:26:47.348Z",
    "account": {
      "_id": "65b75017c6b9d62d29b207aa",
      "user": "65b75017c6b9d62d29b207a9",
      "wallet_balance": 10000,
      "total_funding": 10000,
      "total_referral": 0,
      "total_referral_bonus": 0,
      "wallet_summary": {},
      "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
      "transactions": [
        // Array of populated transaction objects
      ],
      "createdAt": "2024-01-29T15:26:47.456Z",
      "updatedAt": "2024-01-29T15:26:47.456Z",
      "__v": 0
    },
    "last_login": "2024-01-29T15:26:47.456Z",
    "__v": 0
  }
}
```
**Errors**:
- `400 Bad Request`: User ID missing (should be extracted from token).
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: Server-side error.

#### `GET /api/v1/subscribe/transactions`
Retrieves all transactions for the authenticated user's account.
**Request**:
No payload. Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "suceess": true,
  "transactions": {
    "_id": "65b75017c6b9d62d29b207aa",
    "user": "65b75017c6b9d62d29b207a9",
    "wallet_balance": 10000,
    "total_funding": 10000,
    "total_referral": 0,
    "total_referral_bonus": 0,
    "wallet_summary": {},
    "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
    "transactions": [
      {
        "_id": "65c3d4e8c1b6a7f0a8d2c1e2",
        "user": "65b75017c6b9d62d29b207a9",
        "type": "data",
        "amount": 500,
        "status": "success",
        "reference": "REF_abc123",
        "metadata": {
          "status": "successful",
          "plan": "MTN SME Data - 500MB",
          "service": "MTNSME",
          "plan_amount": 490,
          "plan_name": "MTN SME Data",
          "date": "2024-02-08T10:00:00.000Z"
        },
        "createdAt": "2024-02-08T10:00:00.000Z",
        "updatedAt": "2024-02-08T10:00:00.000Z"
      }
      // ... more transactions
    ],
    "createdAt": "2024-01-29T15:26:47.456Z",
    "updatedAt": "2024-01-29T15:26:47.456Z",
    "__v": 1
  }
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: Account not found for the user.
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/subscribe/data`
Purchases a data subscription.
**Request**:
```json
{
  "phone": "08012345678",
  "service": "MTNSME",
  "plan_amount": 500,
  "network": "MTN"
}
```
**Response**:
```json
{
  "success": true,
  "message": "You successfully purchased data plan of MTN SME Data - 500MB valid for: 7-Days"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `400 Bad Request`: Validation error (e.g., missing fields, invalid network/phone format, invalid plan amount) or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error, possibly due to external API call failure.

#### `GET /api/v1/subscribe/data-history`
Retrieves all data transactions for the authenticated user.
**Request**:
No payload. Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
[
  {
    "_id": "65c3d4e8c1b6a7f0a8d2c1e2",
    "user": "65b75017c6b9d62d29b207a9",
    "type": "data",
    "amount": 500,
    "status": "success",
    "reference": "REF_abc123",
    "metadata": {
      "status": "successful",
      "plan": "MTN SME Data - 500MB",
      "service": "MTNSME",
      "plan_amount": 490,
      "plan_name": "MTN SME Data",
      "date": "2024-02-08T10:00:00.000Z"
    },
    "createdAt": "2024-02-08T10:00:00.000Z",
    "updatedAt": "2024-02-08T10:00:00.000Z"
  }
  // ... more data transactions
]
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: Account not found for the user.
- `500 Internal Server Error`: Server-side error.

#### `GET /api/v1/subscribe/query-data/:transactionId`
Queries a specific data transaction by its ID.
**Request**:
Path Parameter:
`transactionId`: The ID of the data transaction.
Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "_id": "65c3d4e8c1b6a7f0a8d2c1e2",
  "user": "65b75017c6b9d62d29b207a9",
  "type": "data",
  "amount": 500,
  "status": "success",
  "reference": "REF_abc123",
  "metadata": {
    "status": "successful",
    "plan": "MTN SME Data - 500MB",
    "service": "MTNSME",
    "plan_amount": 490,
    "plan_name": "MTN SME Data",
    "date": "2024-02-08T10:00:00.000Z"
  },
  "createdAt": "2024-02-08T10:00:00.000Z",
  "updatedAt": "2024-02-08T10:00:00.000Z"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: Data transaction not found for the given ID and user.
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/subscribe/airtime`
Purchases airtime.
**Request**:
```json
{
  "network": "mtn",
  "phone": "08012345678",
  "amount": 500
}
```
**Response**:
```json
{
  "success": true,
  "message": "Airtime sent successfully"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `400 Bad Request`: Validation error (e.g., missing fields, invalid network/phone format, amount less than 100 NGN) or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error, possibly due to external API call failure.

#### `GET /api/v1/subscribe/query-airtime/:transactionId`
Queries a specific airtime transaction by its ID.
**Request**:
Path Parameter:
`transactionId`: The ID of the airtime transaction.
Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "_id": "65c3d5f8c1b6a7f0a8d2c1e3",
  "user": "65b75017c6b9d62d29b207a9",
  "type": "airtime",
  "amount": 500,
  "status": "success",
  "reference": "REF_xyz456",
  "metadata": {
    "network": "mtn",
    "date": "2024-02-08T10:05:00.000Z"
  },
  "createdAt": "2024-02-08T10:05:00.000Z",
  "updatedAt": "2024-02-08T10:05:00.000Z"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: Airtime transaction not found for the given ID and user.
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/subscribe/electricity`
Pays electricity bills.
**Request**:
```json
{
  "disco_name": "eko-electric",
  "meter_number": 1234567890,
  "meter_type": "prepaid",
  "amount": 1000
}
```
**Response**:
```json
{
  "success": true,
  "message": "electricity bill payment was successful"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `400 Bad Request`: Validation error (e.g., missing fields, invalid disco name/meter type, amount less than 100 NGN) or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error, possibly due to external API call failure.

#### `GET /api/v1/subscribe/query-electricity-bill/:transactionId`
Queries a specific electricity bill payment transaction by its ID.
**Request**:
Path Parameter:
`transactionId`: The ID of the electricity transaction.
Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "_id": "65c3d708c1b6a7f0a8d2c1e4",
  "user": "65b75017c6b9d62d29b207a9",
  "type": "electricity",
  "amount": 1000,
  "status": "success",
  "reference": "REF_def789",
  "metadata": {
    "date": "2024-02-08T10:10:00.000Z",
    "disco_name": "eko-electric",
    "meter_type": "prepaid",
    "meter_number": 1234567890
  },
  "createdAt": "2024-02-08T10:10:00.000Z",
  "updatedAt": "2024-02-08T10:10:00.000Z"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: Electricity transaction not found for the given ID and user.
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/subscribe/airtime-2-cash`
Initiates a conversion of airtime to cash.
**Request**:
```json
{
  "network": "mtn",
  "phone_number": "08012345678",
  "amount": 1000
}
```
**Response**:
```json
{
  "success": true,
  "message": "Airtime to Cash was successful!"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `429 Too Many Requests`: Rate limit exceeded (1 request per 5 minutes).
- `400 Bad Request`: Incomplete request body, insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/subscribe/bulk-sms`
Sends bulk SMS messages.
**Request**:
```json
{
  "message": "Hello from VTU Global! Your account balance is low.",
  "phone_numbers": ["08012345678", "07098765432"]
}
```
**Response**:
```json
{
  "success": true,
  "data": "Message sent successfully to all the provided numbers",
  "charge": 8 // Total charge for the SMS messages
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `400 Bad Request`: Message or phone numbers missing, insufficient wallet balance.
- `404 Not Found`: Account not found.
- `402 Payment Required`: External API indicated an issue (e.g., insufficient balance on VTU Africa side).
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/subscribe/cable`
Subscribes to cable TV.
**Request**:
```json
{
  "cable_name": "DSTV",
  "smart_card_number": 9876543210,
  "variation": "DStv Compact"
}
```
**Response**:
```json
{
  "success": true,
  "description": {
    "Amount_Charged": 19000,
    "productName": "DStv Compact",
    // ... other data from VTU Africa API
  },
  // ... other data
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `400 Bad Request`: Validation error (e.g., missing fields) or insufficient wallet balance (must be > 100 NGN).
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error, possibly due to external API call failure.

#### `GET /api/v1/subscribe/query-cable/:transactionId`
Queries a specific cable TV subscription transaction by its ID.
**Request**:
Path Parameter:
`transactionId`: The ID of the cable transaction.
Requires `Authorization` header with Access Token or `accessToken` cookie.
**Response**:
```json
{
  "_id": "65c3d818c1b6a7f0a8d2c1e5",
  "user": "65b75017c6b9d62d29b207a9",
  "type": "cable",
  "amount": 19000,
  "status": "success",
  "reference": "REF_ghi101",
  "metadata": {
    "cable_name": "DSTV",
    "smart_card_number": 9876543210,
    "product_name": "DStv Compact",
    "date": "2024-02-08T10:15:00.000Z"
  },
  "createdAt": "2024-02-08T10:15:00.000Z",
  "updatedAt": "2024-02-08T10:15:00.000Z"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `404 Not Found`: Cable transaction not found for the given ID and user.
- `500 Internal Server Error`: Server-side error.

#### `POST /api/v1/payment/fund-wallet`
Initiates a wallet funding transaction via Paystack.
**Request**:
```json
{
  "amount": 5000
}
```
**Response**:
```json
{
  "message": "Transaction initialized. Please complete payment.",
  "checkoutUrl": "https://checkout.paystack.com/your_checkout_url",
  "reference": "REF_payment_reference"
}
```
**Errors**:
- `401 Unauthorized`: Missing or invalid access token.
- `400 Bad Request`: Amount is missing or less than 100 NGN.
- `404 Not Found`: Account not found for the user.
- `500 Internal Server Error`: Server-side error, possibly due to Paystack API failure.

#### `POST /api/v1/payment/verify-payment`
Webhook endpoint for Paystack to verify and process successful transactions.
**Request**:
Paystack webhook payload (example `charge.success` event):
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "test",
    "status": "success",
    "reference": "REF_payment_reference",
    "amount": 500000, // Amount in kobo (5000 NGN)
    "currency": "NGN",
    "channel": "card",
    "gateway_response": "Successful",
    "message": null,
    "customer": {
      "id": 987654321,
      "email": "john.doe@example.com",
      "customer_code": "CUS_xxxxxx",
      "phone": null
    },
    "metadata": {
      "description": "Wallet Funding",
      "custom_fields": []
    },
    "paid_at": "2024-02-08T10:20:00.000Z",
    "created_at": "2024-02-08T10:19:00.000Z",
    "requested_amount": 500000,
    // ... other Paystack data
  }
}
```
**Response**:
```json
{
  "success": true,
  "message": "Transaction verified successfully"
}
```
**Errors**:
- `430 Invalid Signature`: Paystack webhook signature mismatch.
- `404 Not Found`: Transaction not found for the given reference.
- `500 Internal Server Error`: Server-side error during webhook processing.

---

## Technologies Used

| Category         | Technology                 | Description                                      |
| :--------------- | :------------------------- | :----------------------------------------------- |
| **Backend**      | [Node.js](https://nodejs.org/)             | JavaScript runtime for server-side execution.    |
|                  | [Express](https://expressjs.com/)          | Fast, unopinionated, minimalist web framework.   |
| **Database**     | [MongoDB](https://www.mongodb.com/)        | NoSQL database for flexible data storage.        |
|                  | [Mongoose](https://mongoosejs.com/)        | MongoDB object data modeling (ODM) for Node.js.  |
| **Caching/Queueing** | [Redis](https://redis.io/)             | In-memory data store for caching and messaging.  |
|                  | [BullMQ](https://docs.bullmq.io/)          | Robust, fast, and reliable queueing for Redis.   |
| **Authentication** | [Argon2](https://www.npmjs.com/package/argon2) | Modern password hashing function.                |
|                  | [jsonwebtoken](https://jwt.io/)            | JSON Web Token implementation for Node.js.       |
| **Validation**   | [Joi](https://joi.dev/)                    | Powerful schema description language and validator. |
| **External APIs** | [Axios](https://axios-http.com/)           | Promise-based HTTP client for the browser and Node.js. |
|                  | [Paystack](https://paystack.com/)          | Online payment gateway integration.              |
|                  | [VTU Africa](https://vtuafrica.com.ng/)    | Virtual top-up and bill payment API.             |
| **Utilities**    | [Pino](https://getpino.io/)                | Extremely fast Node.js logger.                   |
|                  | [Nodemailer](https://nodemailer.com/)      | Send emails from Node.js applications.           |
|                  | [dotenv](https://www.npmjs.com/package/dotenv) | Loads environment variables from a `.env` file.  |
|                  | [nanoid](https://zelark.github.io/nano-id-cc/) | Tiny, secure, URL-friendly, unique string ID generator. |
| **Security**     | [Helmet](https://helmetjs.github.io/)      | Helps secure Express apps by setting various HTTP headers. |
|                  | [cors](https://www.npmjs.com/package/cors) | Provides a Connect/Express middleware that can be used to enable CORS. |
|                  | [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) | Basic rate-limiting middleware for Express. |
| **Testing**      | [Vitest](https://vitest.dev/)              | Blazing fast unit-test framework powered by Vite. |
|                  | [Nodemon](https://nodemon.io/)             | Monitors for changes and restarts Node.js applications. |

---

## License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## Author Info

### Samuel Tuoyo
A passionate Backend Developer committed to building scalable and efficient web applications.

*   LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/yourusername)
*   Twitter: [Your Twitter Profile](https://twitter.com/yourusername)
*   Portfolio: [Your Portfolio Website](https://www.yourportfolio.com)

---

<!-- Badges at the bottom -->
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Top Language: JavaScript](https://img.shields.io/github/languages/top/samueltuoyo15/Vtu-Backend?color=yellowgreen)](https://github.com/samueltuoyo15/Vtu-Backend)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)