# VTU Backend API: Secure & Scalable Fintech Services 💰

## Overview
This project is a robust Node.js backend API built with Express.js, designed to power Virtual Top-Up (VTU) and bill payment services. It integrates with external payment gateways, manages user accounts, and handles transactions efficiently and securely using MongoDB and Redis for data persistence and caching.

## Features
*   **Authentication & Authorization**: Secure user registration, login, token refresh, and protected routes using JWT and Argon2 hashing.
*   **User Management**: Retrieve detailed user and account information, including transaction history.
*   **Wallet Management**: Facilitate secure funding of user wallets via external payment gateways.
*   **Data Subscription**: Enable users to purchase mobile data plans from various network providers.
*   **Airtime Top-Up**: Allow users to buy airtime for different networks.
*   **Bill Payments**: Support payment for electricity bills and cable TV subscriptions.
*   **Transaction Processing**: Robust queuing system (BullMQ) for asynchronous transaction handling and idempotency.
*   **Email Verification**: Automated email delivery for user account verification.
*   **Rate Limiting**: Protect endpoints from abuse with Redis-backed rate limiting.
*   **Centralized Logging**: Structured logging for better monitoring and debugging.

## Getting Started
To get this powerful backend running locally, follow these simple steps.

### Installation
Before you begin, ensure you have Node.js (v18+) and npm installed. Docker is optional but recommended for easy setup.

To set up the project locally:

1.  ⬇️ **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Vtu-Backend.git
    cd Vtu-Backend
    ```

2.  📦 **Install Dependencies**:
    ```bash
    npm install
    ```

3.  🐳 **(Optional) Build and Run with Docker**:
    If you have Docker installed, you can build and run the application using:
    ```bash
    docker build -t vtu-backend .
    docker run -p 5000:5000 vtu-backend
    ```
    This will start the server on port `5000` inside a Docker container.

### Environment Variables
Create a `.env` file in the root directory of the project and populate it with the following environment variables. These are crucial for the application to connect to external services and databases.

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vtudb
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your_super_secret_jwt_key
FRONTEND_DOMAIN=http://localhost:3000
EXTERNAL_BACKEND_DOMAIN=https://some-external-provider.com/api
EXTERNAL_BACKEND_API_KEY=your_external_api_key
MONNIFY_API_KEY=your_monnify_public_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
VTUAFRICA_AIRTME2_CASH_PHONE_NUMBER=08012345678
```

### Usage

Once the server is running, you can interact with the API using a tool like Postman, Insomnia, or by integrating it with your frontend application.

To start the development server:
```bash
npm run dev
```

To start the production server:
```bash
npm start
```

The API will be accessible at `http://localhost:5000` (or your configured `PORT`).

**Key Usage Flows:**

1.  **User Registration & Verification**:
    *   Register a new user via `POST /api/v1/auth/register`.
    *   The system sends a verification email. Click the link in the email to `GET /api/v1/auth/verify-email`.
    *   Once verified, the user can log in.

2.  **Authentication**:
    *   Log in with username and password via `POST /api/v1/auth/login`.
    *   Receive `accessToken` and `refreshToken` cookies. The `accessToken` should be included in the `Authorization` header for subsequent authenticated requests as `Bearer <token>`.

3.  **Wallet Funding**:
    *   Initiate a wallet funding transaction via `POST /api/v1/payment/fund-wallet`.
    *   The response will provide a `checkoutUrl` from Monnify for the user to complete the payment.
    *   Monnify's webhook (`POST /api/v1/payment/verify-payment`) will notify the backend upon successful payment, triggering wallet updates.

4.  **Purchasing Services (Data, Airtime, Bills)**:
    *   Ensure your wallet has sufficient balance (or fund it first).
    *   Use the respective `POST` endpoints (`/api/v1/subscribe/data`, `/api/v1/subscribe/airtime`, `/api/v1/subscribe/electricity`, `/api/v1/subscribe/cable`) to make purchases.
    *   Always include the authentication token in the request header.

5.  **Querying Transactions**:
    *   Retrieve all user transactions via `GET /api/v1/subscribe/transactions`.
    *   Query specific transaction types or individual transactions using paths like `/api/v1/subscribe/query-data/:transactionId`.

## API Documentation
### Base URL
The base URL for all API endpoints is `/api/v1`.

### Endpoints
#### POST /api/v1/auth/register
Registers a new user account.
**Request**:
```json
{
  "full_name": "John Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "phone": "08012345678",
  "address": "123 Main St, City",
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
- 422 Unprocessable Entity: All fields are required or invalid format.
- 409 Conflict: User with email or username already exists.
- 500 Internal Server Error: General server error during registration.

#### GET /api/v1/auth/me
Retrieves the authenticated user's details and associated account information.
**Request**: (Requires Authentication)
```
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "source": "redis-cache" | "database",
  "user": {
    "_id": "65b99a5e4b7c8d9e0f1a2b3c",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "08012345678",
    "address": "123 Main St, City",
    "is_verified": true,
    "last_login": "2024-07-20T10:00:00.000Z",
    "account": {
      "_id": "65b99a5e4b7c8d9e0f1a2b3d",
      "wallet_balance": 5000.00,
      "total_funding": 10000.00,
      "total_referral": 5,
      "total_referral_bonus": 1000,
      "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
      "transactions": [
        // Transaction objects
      ]
    }
  }
}
```
**Errors**:
- 400 Bad Request: User ID is missing (should be from authenticated user).
- 401 Unauthorized: Invalid or missing access token.
- 404 Not Found: User not found.
- 500 Internal Server Error: General server error.

#### GET /api/v1/auth/verify-email
Verifies a user's email address using a token received in an email.
**Request**:
```
GET /api/v1/auth/verify-email?token=<emailVerificationToken>
```
**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```
**Errors**:
- 400 Bad Request: Missing token or user already verified.
- 404 Not Found: Invalid verification link (user not found).
- 400 Bad Request: Invalid or expired token.

#### POST /api/v1/auth/login
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
  "accessToken": "eyJhbGciOiJIUzI1Ni..."
}
```
**Errors**:
- 422 Unprocessable Entity: Username and password are required.
- 404 Not Found: User not found.
- 401 Unauthorized: Invalid password or account not verified.
- 500 Internal Server Error: General server error during login.

#### POST /api/v1/auth/logout
Logs out the authenticated user by invalidating their refresh tokens.
**Request**: (Requires Authentication)
```
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```
**Errors**:
- 500 Internal Server Error: General server error during logout.

#### POST /api/v1/auth/refresh-token
Refreshes an expired access token using a valid refresh token.
**Request**: (Requires `refreshToken` cookie)
```
POST /api/v1/auth/refresh-token
```
**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1Ni..."
}
```
**Errors**:
- 400 Bad Request: Missing refresh token.
- 401 Unauthorized: Invalid or expired refresh token, or user not found.
- 500 Internal Server Error: General server error during token refresh.

#### GET /api/v1/subscribe/transactions
Retrieves all transactions for the authenticated user.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/transactions
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "success": true,
  "transactions": {
    "_id": "65b99a5e4b7c8d9e0f1a2b3d",
    "user": "65b99a5e4b7c8d9e0f1a2b3c",
    "wallet_balance": 5000,
    "total_funding": 10000,
    "total_referral": 5,
    "total_referral_bonus": 1000,
    "wallet_summary": {},
    "account_number": null,
    "account_name": null,
    "bank_name": null,
    "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
    "transactions": [
      {
        "_id": "65b99a6f4b7c8d9e0f1a2b3e",
        "user": "65b99a5e4b7c8d9e0f1a2b3c",
        "type": "data",
        "amount": 785,
        "status": "success",
        "reference": "REF_randomid1",
        "metadata": {
          "status": "successful",
          "plan": 358,
          "network": "MTN",
          "plan_amount": 785,
          "plan_name": "MTN 1.0 GB",
          "date": "2024-07-20T09:30:00.000Z",
          "ported_number": false
        },
        "createdAt": "2024-07-20T09:30:00.000Z",
        "updatedAt": "2024-07-20T09:30:00.000Z",
        "__v": 0
      }
    ]
  }
}
```
**Errors**:
- 404 Not Found: Account not found for the user.
- 500 Internal Server Error: General server error.


#### POST /api/v1/subscribe/bulk-sms
Bulk sms service.
**Request**: (Requires Authentication)
```json
{
  "message": "Your message here",        
  "phone_numbers": ["08012345678", "08012345678"]
}
```
**Response**:
```json
{
  "success": true,
  "message": "Message sent successfully to all the provided numbers",
  "charge" totalCharges,  
}
```
**Errors**:
- 400 Bad Request: phone_numbers and message are missing/invalid, or insufficient wallet balance.
- 404 Not Found: Account not found.
- 500 Internal Server Error: Failed to connect to bulk sms provider or general server error.


#### POST /api/v1/subscribe/data
Purchases a data subscription for a specified mobile number.
**Request**: (Requires Authentication)
```json
{
  "network": 1,        // MTN
  "phone": "08012345678",
  "plan": 358,          // Example plan ID for MTN 1.0 GB
  "ported_number": false
}
```
**Response**:
```json
{
  "success": true,
  "message": "You successfully purchased data of plan MTN 1.0 GB"
}
```
**Errors**:
- 400 Bad Request: Network, phone, plan, or ported\_number are missing/invalid, or insufficient wallet balance, or data plan not available.
- 404 Not Found: Account not found.
- 500 Internal Server Error: Failed to connect to data provider or general server error.

#### POST /api/v1/subscribe/airtime
Purchases airtime for a specified mobile number.
**Request**: (Requires Authentication)
```json
{
  "network": 1,         // MTN
  "phone": "08012345678",
  "amount": 500,
  "airtime_type": "VTU", // VTU, Awuf4U, or Share and Sell
  "ported_number": false
}
```
**Response**:
```json
{
  "network": "MTN",
  "mobile_number": "08012345678",
  "amount": 500,
  "status": "successful",
  "create_date": "2024-07-20T10:00:00.000Z"
}
```
**Errors**:
- 400 Bad Request: Network, phone, amount, airtime\_type, or ported\_number are missing/invalid, or amount < 100, or insufficient wallet balance.
- 404 Not Found: Account not found.
- 500 Internal Server Error: Failed to subscribe to airtime or general server error.

#### GET /api/v1/subscribe/data-history
Retrieves all data transactions for the authenticated user.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/data-history
Authorization: Bearer <accessToken>
```
**Response**:
```json
[
  {
    "_id": "65b99a6f4b7c8d9e0f1a2b3e",
    "user": "65b99a5e4b7c8d9e0f1a2b3c",
    "type": "data",
    "amount": 785,
    "status": "success",
    "reference": "REF_randomid1",
    "metadata": {
      "status": "successful",
      "plan": 358,
      "network": "MTN",
      "plan_amount": 785,
      "plan_name": "MTN 1.0 GB",
      "date": "2024-07-20T09:30:00.000Z",
      "ported_number": false
    },
    "createdAt": "2024-07-20T09:30:00.000Z",
    "updatedAt": "2024-07-20T09:30:00.000Z",
    "__v": 0
  }
]
```
**Errors**:
- 404 Not Found: Account not found.
- 500 Internal Server Error: General server error.

#### GET /api/v1/subscribe/query-data/:transactionId
Queries a specific data transaction by its ID for the authenticated user.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/query-data/65b99a6f4b7c8d9e0f1a2b3e
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "_id": "65b99a6f4b7c8d9e0f1a2b3e",
  "user": "65b99a5e4b7c8d9e0f1a2b3c",
  "type": "data",
  "amount": 785,
  "status": "success",
  "reference": "REF_randomid1",
  "metadata": {
    "status": "successful",
    "plan": 358,
    "network": "MTN",
    "plan_amount": 785,
    "plan_name": "MTN 1.0 GB",
    "date": "2024-07-20T09:30:00.000Z",
    "ported_number": false
  },
  "createdAt": "2024-07-20T09:30:00.000Z",
  "updatedAt": "2024-07-20T09:30:00.000Z",
  "__v": 0
}
```
**Errors**:
- 404 Not Found: Data transaction not found.
- 500 Internal Server Error: General server error.

#### GET /api/v1/subscribe/query-airtime/:transactionId
Queries a specific airtime transaction by its ID for the authenticated user.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/query-airtime/65b99a6f4b7c8d9e0f1a2b3e
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "_id": "65b99a6f4b7c8d9e0f1a2b3e",
  "user": "65b99a5e4b7c8d9e0f1a2b3c",
  "type": "airtime",
  "amount": 500,
  "status": "success",
  "reference": "REF_randomid2",
  "metadata": {
    "status": "successful",
    "network": "MTN",
    "date": "2024-07-20T10:00:00.000Z",
    "ported_number": false
  },
  "createdAt": "2024-07-20T10:00:00.000Z",
  "updatedAt": "2024-07-20T10:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- 404 Not Found: Airtime transaction not found.
- 500 Internal Server Error: General server error.

#### POST /api/v1/subscribe/electricity
Pays an electricity bill.
**Request**: (Requires Authentication)
```json
{
  "disco_name": "Ikeja Electric",
  "amount": 1500,
  "meter_number": 1234567890,
  "meter_type": "prepaid" // or "postpaid"
}
```
**Response**:
```json
{
  "status": "successful",
  "disco_name": "Ikeja Electric",
  "amount": 1500,
  "meter_number": 1234567890,
  "meter_type": "prepaid",
  "transaction_id": "tx_xyz123"
}
```
**Errors**:
- 400 Bad Request: Missing/invalid fields, amount < 100, or insufficient wallet balance.
- 404 Not Found: Account not found.
- 500 Internal Server Error: Failed to pay electricity bill or general server error.

#### GET /api/v1/subscribe/query-electricity-bill/:transactionId
Queries a specific electricity bill payment transaction by its ID for the authenticated user.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/query-electricity-bill/65b99a6f4b7c8d9e0f1a2b3e
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "_id": "65b99a6f4b7c8d9e0f1a2b3e",
  "user": "65b99a5e4b7c8d9e0f1a2b3c",
  "type": "electricity",
  "amount": 1500,
  "status": "success",
  "reference": "REF_randomid3",
  "metadata": {},
  "createdAt": "2024-07-20T11:00:00.000Z",
  "updatedAt": "2024-07-20T11:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- 404 Not Found: Electricity transaction not found.
- 500 Internal Server Error: General server error.

#### POST /api/v1/subscribe/airtime-2-cash
Initiates a request to convert airtime to cash.
**Request**: (Requires Authentication)
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
- 400 Bad Request: Incomplete request body or insufficient wallet balance.
- 404 Not Found: Account not found.
- 429 Too Many Requests: Rate limit exceeded.
- 500 Internal Server Error: Failed to purchase airtime to cash service or general server error.

#### POST /api/v1/subscribe/cable
Purchases a cable TV subscription.
**Request**: (Requires Authentication)
```json
{
  "cable_name": "DSTV",
  "cable_plan": "DStv Compact", // e.g., "DStv Compact" or "basic" / "premium" based on schema
  "smart_card_number": 9876543210,
  "amount": 19000
}
```
**Response**:
```json
{
  "status": "successful",
  "cable_name": "DSTV",
  "cable_plan": "DStv Compact",
  "smart_card_number": 9876543210,
  "transaction_id": "tx_xyz456"
}
```
**Errors**:
- 400 Bad Request: Missing/invalid fields, amount < 100, or insufficient wallet balance.
- 404 Not Found: Account not found.
- 500 Internal Server Error: Failed to subscribe to cable or general server error.

#### GET /api/v1/subscribe/query-cable/:transactionId
Queries a specific cable subscription transaction by its ID for the authenticated user.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/query-cable/65b99a6f4b7c8d9e0f1a2b3e
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "_id": "65b99a6f4b7c8d9e0f1a2b3e",
  "user": "65b99a5e4b7c8d9e0f1a2b3c",
  "type": "cable",
  "amount": 19000,
  "status": "success",
  "reference": "REF_randomid4",
  "metadata": {},
  "createdAt": "2024-07-20T12:00:00.000Z",
  "updatedAt": "2024-07-20T12:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- 404 Not Found: Cable transaction not found.
- 500 Internal Server Error: General server error.

#### GET /api/v1/subscribe/validate-uic
Validates a Smart Card Number (IUC) for a given cable provider.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/validate-uic?smart_card_number=9876543210&cable_name=DSTV
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "customerName": "John Doe",
  "customerStatus": "Active"
}
```
**Errors**:
- 400 Bad Request: Smart card number or cable name are missing.
- 500 Internal Server Error: General server error.

#### GET /api/v1/subscribe/validate-meter
Validates an electricity meter number for a given disco and meter type.
**Request**: (Requires Authentication)
```
GET /api/v1/subscribe/validate-meter?meternumber=1234567890&disconame=Ikeja Electric&metertype=prepaid
Authorization: Bearer <accessToken>
```
**Response**:
```json
{
  "customerName": "Jane Smith",
  "customerAddress": "456 Oak Ave",
  "meterStatus": "Active"
}
```
**Errors**:
- 400 Bad Request: Meter number, disco name, or meter type are missing.
- 500 Internal Server Error: General server error.

#### POST /api/v1/payment/fund-wallet
Initiates a funding transaction for the user's wallet via Monnify.
**Request**: (Requires Authentication)
```json
{
  "email": "user@example.com",
  "amount": 5000
}
```
**Response**:
```json
{
  "message": "Transaction initialized. Please complete payment.",
  "checkoutUrl": "https://sandbox.monnify.com/checkout/init?reference=...",
  "reference": "REF_randomid5"
}
```
**Errors**:
- 400 Bad Request: Email or amount are missing/invalid, or amount < 100.
- 404 Not Found: Account not found.
- 500 Internal Server Error: Failed to initialize transaction or general server error.

#### POST /api/v1/payment/verify-payment
Monnify webhook endpoint for verifying successful transactions.
**Request**: (Called by Monnify, includes `monnify-signature` header)
```json
{
  "eventType": "SUCCESSFUL_TRANSACTION",
  "eventData": {
    "paymentReference": "REF_randomid5",
    "amountPaid": 5000.00,
    // ... other Monnify event data
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
- 430 Invalid signature: `monnify-signature` header does not match expected signature.
- 404 Not Found: Transaction not found in local database.
- 500 Internal Server Error: Error processing webhook.

#### GET /api/v1/plans/data-plans
Retrieves a list of available data plans.
**Request**: (No authentication required)
```
GET /api/v1/plans/data-plans
```
**Response**:
```json
[
  { "id": 367, "network": "GLO", "type": "SME", "amount": 1885, "size": "10.0 GB", "validity": "7days" },
  { "id": 365, "network": "GLO", "type": "SME", "amount": 290, "size": "1.5 GB", "validity": "2days" }
  // ... more data plans
]
```

#### GET /api/v1/plans/networks
Retrieves a list of supported mobile networks.
**Request**: (No authentication required)
```
GET /api/v1/plans/networks
```
**Response**:
```json
[
  { "id": 1, "name": "MTN" },
  { "id": 2, "name": "GLO" },
  { "id": 3, "name": "9MOBILE" }
  // ... more networks
]
```

#### GET /api/v1/plans/cables
Retrieves a list of supported cable TV providers.
**Request**: (No authentication required)
```
GET /api/v1/plans/cables
```
**Response**:
```json
[
  { "id": 1, "name": "GOTV" },
  { "id": 2, "name": "DSTV" },
  { "id": 3, "name": "STARTIME" }
]
```

#### GET /api/v1/plans/cable-plans
Retrieves a list of available cable TV plans.
**Request**: (No authentication required)
```
GET /api/v1/plans/cable-plans
```
**Response**:
```json
[
  { "id": 2, "name": "GOtv Max", "amount": 8500 },
  { "id": 5, "name": "Asian Bouqet", "amount": 24250 }
  // ... more cable plans
]
```

#### GET /api/v1/plans/discos
Retrieves a list of supported electricity distribution companies (DISCOs).
**Request**: (No authentication required)
```
GET /api/v1/plans/discos
```
**Response**:
```json
[
  { "id": 1, "name": "Ikeja Electric" },
  { "id": 2, "name": "Eko Electric" },
  { "id": 3, "name": "Abuja Electric" }
  // ... more discos
]
```

## Technologies Used
| Technology | Description | Link |
| :--------- | :---------- | :--- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | A JavaScript runtime built on Chrome's V8 JavaScript engine. | [nodejs.org](https://nodejs.org/) |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | A fast, unopinionated, minimalist web framework for Node.js. | [expressjs.com](https://expressjs.com/) |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) | A NoSQL database that provides high performance, high availability, and easy scalability. | [mongodb.com](https://www.mongodb.com/) |
| ![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white) | An ODM library for MongoDB and Node.js. | [mongoosejs.com](https://mongoosejs.com/) |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) | An in-memory data structure store, used as a database, cache, and message broker. | [redis.io](https://redis.io/) |
| ![BullMQ](https://img.shields.io/badge/BullMQ-FF4081?style=for-the-badge&logo=bullmq&logoColor=white) | A powerful job queueing system built on Redis for Node.js. | [docs.bullmq.io](https://docs.bullmq.io/) |
| ![Joi](https://img.shields.io/badge/Joi-E44D26?style=for-the-badge&logo=joi&logoColor=white) | A powerful schema description language and data validator for JavaScript. | [joi.dev](https://joi.dev/) |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white) | JSON Web Tokens for secure authentication. | [jwt.io](https://jwt.io/) |
| ![Argon2](https://img.shields.io/badge/Argon2-F4D03F?style=for-the-badge&logo=argon&logoColor=black) | A robust hashing algorithm used for password storage. | [argon2.org](https://argon2.org/) |
| ![Nodemailer](https://img.shields.io/badge/Nodemailer-008080?style=for-the-badge&logo=nodemailer&logoColor=white) | Module for Node.js applications to allow easy email sending. | [nodemailer.com](https.nodemailer.com/) |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) | Promise-based HTTP client for the browser and Node.js. | [axios-http.com](https://axios-http.com/) |
| ![Pino](https://img.shields.io/badge/Pino-5D8C1B?style=for-the-badge&logo=pino&logoColor=white) | A very low overhead Node.js logger. | [getpino.io](https://getpino.io/) |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) | Platform for developing, shipping, and running applications in containers. | [docker.com](https://www.docker.com/) |

## License
This project is licensed under the ISC License.

## Author
**Samuel Tuoyo**
A passionate software engineer focused on building robust and scalable backend systems.

*   LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/samueltuoyo/)
*   Twitter: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle)

---

[![Repo Size](https://img.shields.io/github/repo-size/samueltuoyo15/Vtu-Backend?style=for-the-badge&label=Repo%20Size)](https://github.com/samueltuoyo15/Vtu-Backend)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)
[![Technologies](https://img.shields.io/badge/Node.js%20%7C%20Express.js%20%7C%20MongoDB%20%7C%20Redis%20%7C%20BullMQ-blue?style=for-the-badge)](https://github.com/samueltuoyo15/Vtu-Backend)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)