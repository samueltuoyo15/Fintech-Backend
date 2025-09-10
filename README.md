# VTU Backend API

## Overview
This project is a robust Node.js and Express.js backend API designed for Virtual Top-Up (VTU) services. It integrates with MongoDB via Mongoose for data persistence, uses Redis for caching and asynchronous task management with BullMQ, and handles secure user authentication with JWT. The API facilitates various financial transactions, including data and airtime purchases, bill payments, and wallet funding via Paystack.

## Features
-   **Node.js**: Asynchronous event-driven JavaScript runtime for scalable network applications.
-   **Express.js**: Fast, unopinionated, minimalist web framework for building RESTful APIs.
-   **MongoDB & Mongoose**: NoSQL database for flexible data storage with Mongoose ODM for structured schema definitions and interactions.
-   **Redis**: High-performance in-memory data store used for caching API responses and managing BullMQ queues.
-   **BullMQ**: Robust, high-performance Node.js library for managing distributed job queues, ensuring reliable background processing of transactions.
-   **JWT Authentication**: Secure user authentication and authorization using JSON Web Tokens, including access token and refresh token mechanisms.
-   **Argon2**: Industry-standard password hashing algorithm for strong password security.
-   **Paystack Integration**: Seamless integration with Paystack for secure wallet funding, including webhook verification for transaction processing.
-   **External VTU API Integration**: Connects with third-party VTU service providers to enable purchases of data, airtime, electricity bills, cable subscriptions, bulk SMS, result checker pins, and recharge card pins.
-   **Email Verification**: Ensures account security and validity through an email verification process for new user registrations.
-   **Joi Validation**: Comprehensive request payload validation to maintain data integrity and prevent malformed requests.
-   **Rate Limiting**: Protects API endpoints from abuse and brute-force attacks by limiting the number of requests within a time window.
-   **Pino Logger**: Structured and performant logging for enhanced observability and debugging in development and production environments.

## Getting Started
To get this project up and running locally, follow these steps.

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Vtu-Backend.git
    cd Vtu-Backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables
Create a `.env` file in the root directory and populate it with the following required environment variables:

```ini
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/vtu_db
REDIS_URL=redis://localhost:6379

FRONTEND_DOMAIN=http://localhost:3000

JWT_SECRET_KEY=your_jwt_secret_key_very_long_and_secure

EXTERNAL_BACKEND_DOMAIN=https://some-external-vtu-api.com/api
EXTERNAL_BACKEND_API_KEY=your_external_vtu_api_key

GMAIL_SERVICE=Gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

PAYSTACK_SECRET_KEY=sk_test_********************
PAYSTACK_PUBLIC_KEY=pk_test_********************
PAYSTACK_URL=https://api.paystack.co

VTU_AFRICA_DOMAIN=https://vtu.africa/api
VTUAFRICA_API_KEY=your_vtuafrica_api_key
```

### Running the Project
To start the development server:
```bash
npm run dev
```

To start the production server:
```bash
npm start
```

## API Documentation

### Base URL
`https://your-domain.com/api/v1`

### Endpoints

#### GET /
**Overview**: Checks if the API server is running.
**Request**: No payload.
**Response**:
```json
{
  "message": "Welcome to the API and server is running on port 5000",
  "status": "success"
}
```

#### POST /api/v1/auth/register
**Overview**: Registers a new user account.
**Request**:
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
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully. Kindly check your email (inbox or spam) and verify your account"
}
```
**Errors**:
- `422 Unprocessable Entity`: All fields are required.
- `409 Conflict`: User already exists or username already taken.
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/auth/verify-email
**Overview**: Verifies a user's email address using a token sent to their email.
**Request**: Query parameter `token`.
`GET /api/v1/auth/verify-email?token=eyJ...`
**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```
**Errors**:
- `400 Bad Request`: Missing token.
- `404 Not Found`: Invalid verification link (user not found).
- `400 Bad Request`: User already verified.
- `400 Bad Request`: Invalid or expired token.

#### POST /api/v1/auth/login
**Overview**: Authenticates a user and issues access and refresh tokens.
**Request**:
```json
{
  "username": "johndoe",
  "password": "StrongPassword123"
}
```
**Response**: (Cookies `accessToken` and `refreshToken` are set)
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJ..."
}
```
**Errors**:
- `422 Unprocessable Entity`: Username and password are required.
- `404 Not Found`: User not found.
- `401 Unauthorized`: Invalid password or account not verified yet.
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/auth/me
**Overview**: Retrieves the authenticated user's details and their associated account.
**Request**: Authenticated request (requires `accessToken` cookie or `Authorization` header).
**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "source": "database",
  "user": {
    "_id": "65b2d0a0d20d4f3b8c7c9c0b",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "08012345678",
    "address": "123 Main St, City",
    "is_verified": true,
    "last_login": "2024-07-20T10:00:00.000Z",
    "account": {
      "_id": "65b2d0a0d20d4f3b8c7c9c0c",
      "wallet_balance": 1500.00,
      "total_funding": 2000.00,
      "total_referral": 10,
      "total_referral_bonus": 5,
      "total_spent": 500.00,
      "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
      "transactions": [],
      "createdAt": "2024-01-25T12:00:00.000Z",
      "updatedAt": "2024-07-20T10:00:00.000Z"
    },
    "createdAt": "2024-01-25T12:00:00.000Z",
    "updatedAt": "2024-07-20T10:00:00.000Z"
  }
}
```
**Errors**:
- `401 Unauthorized`: Invalid access token or no token provided.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/auth/logout
**Overview**: Logs out the authenticated user by clearing tokens and cookies.
**Request**: Authenticated request (requires `accessToken` cookie or `Authorization` header). No payload.
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```
**Errors**:
- `401 Unauthorized`: Invalid access token or no token provided.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/auth/refresh-token
**Overview**: Refreshes expired access tokens using a refresh token.
**Request**: `refreshToken` should be present in cookies. No payload.
**Response**: (New `accessToken` and `refreshToken` cookies are set)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJ..."
}
```
**Errors**:
- `400 Bad Request`: Missing refresh token.
- `401 Unauthorized`: Invalid or expired refresh token.
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/subscribe/transactions
**Overview**: Retrieves a list of all transactions for the authenticated user.
**Request**: Authenticated request. Query parameters:
- `page`: (Optional) Page number for pagination, default is 1.
- `limit`: (Optional) Number of items per page, default is 50.
- `type`: (Optional) Filter transactions by type (e.g., "data", "funding", "airtime", "electricity", "cable", "result-checker", "referral"). Default is "All".
**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "65f2d0a0d20d4f3b8c7c9c0f",
      "user": "65b2d0a0d20d4f3b8c7c9c0b",
      "type": "funding",
      "amount": 1000,
      "status": "success",
      "reference": "REF_xyz123abc",
      "createdAt": "2024-07-19T09:00:00.000Z",
      "updatedAt": "2024-07-19T09:05:00.000Z",
      "metadata": {
        "status": "successful",
        "date": "2024-07-19T09:00:00.000Z"
      }
    }
  ],
  "cached": false
}
```
**Errors**:
- `401 Unauthorized`: Invalid access token or no token provided.
- `404 Not Found`: Transactions not found.
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/subscribe/referrals
**Overview**: Retrieves a list of referrals made by the authenticated user.
**Request**: Authenticated request. Query parameters:
- `page`: (Optional) Page number for pagination, default is 1.
- `limit`: (Optional) Number of items per page, default is 10.
- `search`: (Optional) Search by referee username.
**Response**:
```json
{
  "success": true,
  "referrals": [
    {
      "username": "referree1",
      "email": "referree1@example.com",
      "full_name": "Referree One"
    },
    {
      "username": "referree2",
      "email": "referree2@example.com",
      "full_name": "Referree Two"
    }
  ],
  "total": 2,
  "cached": false
}
```
**Errors**:
- `401 Unauthorized`: Invalid access token or no token provided.
- `404 Not Found`: No referrals found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/data
**Overview**: Allows the authenticated user to buy a data subscription.
**Request**: Authenticated request.
```json
{
  "phone": "08012345678",
  "network_id": 1,
  "id": 414,
  "ported_number": true
}
```
**Response**:
```json
{
  "success": true,
  "message": "You successfully purchased data plan of MTN - 3.5 GB valid for: 7days"
}
```
**Errors**:
- `400 Bad Request`: Validation error (e.g., missing fields, invalid phone number, `network_id` not 1,2,3,4,5, `amount` < 50), Insufficient wallet balance.
- `404 Not Found`: Data plan or user account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/airtime
**Overview**: Allows the authenticated user to buy airtime.
**Request**: Authenticated request.
```json
{
  "network_id": 1,
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
- `400 Bad Request`: Validation error (e.g., missing fields, invalid phone number, `network_id` not 1,2,3,4,5, `amount` < 100), Insufficient wallet balance.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/electricity
**Overview**: Allows the authenticated user to pay electricity bills.
**Request**: Authenticated request.
```json
{
  "disco_name": "Ikeja Electric",
  "amount": 1000,
  "meter_number": "12345678901",
  "meter_type": "prepaid"
}
```
**Response**:
```json
{
  "success": true,
  "message": "success"
}
```
**Errors**:
- `400 Bad Request`: Validation error (e.g., missing fields, `amount` < 100), Insufficient wallet balance.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/recharge-card-pins
**Overview**: Allows the authenticated user to purchase recharge card pins.
**Request**: Authenticated request.
```json
{
  "network": "mtn",
  "quantity": 1,
  "variation": "100"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Result checked successfully",
  "pins": [
    "1234-5678-9012-3456",
    "9876-5432-1098-7654"
  ],
  "charge": 98.0
}
```
**Errors**:
- `400 Bad Request`: Validation error (e.g., missing fields), Insufficient wallet balance (< 100 NGN).
- `402 Payment Required`: External API indicates funding is needed.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/bulk-sms
**Overview**: Allows the authenticated user to send bulk SMS messages.
**Request**: Authenticated request.
```json
{
  "message": "Hello from Ife-Elroiglobal!",
  "phone_numbers": ["08011112222", "09033334444"]
}
```
**Response**:
```json
{
  "success": true,
  "message": "Message sent successfully to all the provided numbers",
  "charge": 8
}
```
**Errors**:
- `400 Bad Request`: Message and phone numbers are required, Insufficient wallet balance.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/buy-result-checker
**Overview**: Allows the authenticated user to purchase result checker pins (e.g., WAEC, NECO).
**Request**: Authenticated request.
```json
{
  "quantity": 1,
  "service": "waec",
  "product_code": 1
}
```
**Response**:
```json
{
  "success": true,
  "message": "Result checked successfully",
  "pins": [
    {
      "serial": "SN12345",
      "pin": "PIN67890"
    }
  ],
  "charge": 3850
}
```
**Errors**:
- `400 Bad Request`: Quantity, service, and product code are required, Insufficient wallet balance.
- `402 Payment Required`: External API indicates funding is needed.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/subscribe/cable
**Overview**: Allows the authenticated user to subscribe to cable TV plans.
**Request**: Authenticated request.
```json
{
  "cable_name": "DStv",
  "cable_plan": "Yanga",
  "smart_card_number": "12345678901",
  "amount": 6000
}
```
**Response**:
```json
{
  "status": "success",
  "message": "Cable subscription successful"
}
```
**Errors**:
- `400 Bad Request`: Validation error (e.g., missing fields, `amount` < 100), Insufficient wallet balance.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/subscribe/validate-uic/:smart_card_number/:cable_name
**Overview**: Validates a smart card number against a given cable name.
**Request**: Authenticated request. Path parameters:
- `smart_card_number`: The smart card number to validate.
- `cable_name`: The name of the cable provider (e.g., `DStv`, `GOtv`).
**Response**:
```json
{
  "status": "success",
  "customer_name": "Jane Doe",
  "status_code": "200"
}
```
**Errors**:
- `400 Bad Request`: Smart card number and cable name are required.
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/subscribe/validate-meter/:meter_number/:disco_name/:meter_type
**Overview**: Validates a meter number against a given disco name and meter type.
**Request**: Authenticated request. Path parameters:
- `meter_number`: The meter number to validate.
- `disco_name`: The name of the electricity distribution company (e.g., `Ikeja Electric`).
- `meter_type`: The type of meter (`prepaid` or `postpaid`).
**Response**:
```json
{
  "status": "success",
  "customer_name": "John Doe",
  "address": "123 Main Street",
  "status_code": "200"
}
```
**Errors**:
- `400 Bad Request`: Meter number, disco name, and meter type are required.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/payment/fund-wallet
**Overview**: Initiates a Paystack transaction to fund the user's wallet.
**Request**: Authenticated request.
```json
{
  "amount": 5000
}
```
**Response**:
```json
{
  "message": "Transaction initialized. Please complete payment.",
  "checkoutUrl": "https://paystack.co/pay/some_reference",
  "reference": "REF_nanoid123"
}
```
**Errors**:
- `400 Bad Request`: Amount is required or amount must be greater than 100NGN.
- `404 Not Found`: User account not found.
- `500 Internal Server Error`: Generic server error.

#### POST /api/v1/payment/verify-payment
**Overview**: Webhook endpoint for Paystack to verify successful transactions and update user wallets.
**Request**: This endpoint is called by Paystack's webhook. The payload is a `charge.success` event.
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "test",
    "status": "success",
    "reference": "REF_nanoid123",
    "amount": 500000,
    "message": null,
    "gateway_response": "Successful",
    "paid_at": "2024-07-20T10:30:00.000Z",
    "created_at": "2024-07-20T10:25:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "ip_address": "192.168.1.1",
    "metadata": {
      "description": "Wallet Funding"
    },
    "customer": {
      "id": 123456,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "customer_code": "CUS_xxxxxx"
    }
  }
}
```
**Response**:
- `200 OK`: If the webhook is acknowledged and processed (or already processed).
- `430 Invalid Signature`: If the `x-paystack-signature` header does not match the expected signature.
- `404 Not Found`: If the transaction reference is not found in the database.
- `500 Internal Server Error`: Generic server error during processing.

#### GET /api/v1/plans/data-plans
**Overview**: Retrieves a list of available data plans, optionally filtered by network.
**Request**: Optional query parameter `network` (e.g., `MTN`, `AIRTEL`, `GLO`, `9MOBILE`).
`GET /api/v1/plans/data-plans?network=MTN`
**Response**:
```json
{
  "success": true,
  "message": "List of Data Plans",
  "data": [
    {
      "id": 414,
      "network": "MTN",
      "network_id": 1,
      "planType": "GIFTING",
      "amount": 1800.0,
      "size": "3.5 GB",
      "validity": "7days"
    }
  ],
  "source": "database"
}
```
**Errors**:
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/plans/cable-plans
**Overview**: Retrieves a list of available cable subscription plans.
**Request**: No payload.
**Response**:
```json
[
  { "id": 2, "name": "GOtv Max", "amount": 8500 },
  { "id": 6, "name": "DStv Yanga", "amount": 6000 }
]
```
**Errors**:
- `500 Internal Server Error`: Generic server error.

#### GET /api/v1/plans/electricity-plans
**Overview**: Retrieves a list of available electricity distribution companies.
**Request**: No payload.
**Response**:
```json
[
  { "id": 1, "name": "Ikeja Electric" },
  { "id": 2, "name": "Eko Electric" }
]
```
**Errors**:
- `500 Internal Server Error`: Generic server error.

## Technologies Used
| Technology         | Version    | Description                                                      | Link                                                     |
| :----------------- | :--------- | :--------------------------------------------------------------- | :------------------------------------------------------- |
| Node.js            | 20.x       | JavaScript runtime environment                                   | [nodejs.org](https://nodejs.org/en/)                     |
| Express.js         | ^5.1.0     | Web application framework                                        | [expressjs.com](https://expressjs.com/)                  |
| MongoDB            | 6.0+       | NoSQL document database                                          | [mongodb.com](https://www.mongodb.com/)                  |
| Mongoose           | ^8.16.1    | MongoDB object data modeling (ODM) for Node.js                   | [mongoosejs.com](https://mongoosejs.com/)                |
| Redis              | 7.x        | In-memory data store, cache, and message broker                  | [redis.io](https://redis.io/)                            |
| BullMQ             | ^5.56.4    | Fast and robust queueing system for Node.js                      | [docs.bullmq.io](https://docs.bullmq.io/)                |
| JSON Web Tokens    | ^9.0.2     | Compact, URL-safe means of representing claims                   | [jwt.io](https://jwt.io/)                                |
| Argon2             | ^0.43.0    | Password hashing function                                        | [argon2.org](https://argon2.org/)                        |
| Joi                | ^17.13.3   | Schema description language and data validator                   | [joi.dev](https://joi.dev/)                              |
| Axios              | ^1.10.0    | Promise-based HTTP client for the browser and Node.js            | [axios-http.com](https://axios-http.com/)                |
| Pino               | ^9.7.0     | Extremely fast Node.js logger                                    | [getpino.io](https://getpino.io/)                        |
| Nodemailer         | ^7.0.5     | Send emails from Node.js applications                            | [nodemailer.com](https://nodemailer.com/)                |
| Cookie-parser      | ^1.4.7     | Parse Cookie header and populate `req.cookies`                   | [expressjs.com/en/resources/middleware/cookie-parser.html](https://expressjs.com/en/resources/middleware/cookie-parser.html) |
| CORS               | ^2.8.5     | Provides a Connect/Express middleware that can be used to enable CORS with various options | [expressjs.com/en/resources/middleware/cors.html](https://expressjs.com/en/resources/middleware/cors.html) |
| Dotenv             | ^17.0.1    | Loads environment variables from a `.env` file                   | [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv) |
| Helmet             | ^8.1.0     | Helps secure Express apps by setting various HTTP headers        | [helmetjs.github.io](https://helmetjs.github.io/)        |
| Express Rate Limit | ^7.5.1     | Basic rate-limiting middleware for Express                       | [github.com/express-rate-limit/express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| Nanoid             | ^5.1.5     | Tiny, secure, URL-friendly, unique string ID generator           | [github.com/ai/nanoid](https://github.com/ai/nanoid)     |
| Vitest             | ^3.2.4     | Blazing fast unit-test framework powered by Vite                 | [vitest.dev](https://vitest.dev/)                        |

## License
This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

## Author Info
**Samuel Tuoyo**
A passionate backend developer with a keen eye for robust and scalable API solutions.

-   **LinkedIn**: [Link to Samuel Tuoyo's LinkedIn]
-   **Twitter**: [Link to Samuel Tuoyo's Twitter]
-   **Portfolio**: [Link to Samuel Tuoyo's Portfolio]

---
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.x%20%7C%205.x%20%7C%206.x-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red?logo=redis&logoColor=white)](https://redis.io/)
[![ISC License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Top Language](https://img.shields.io/github/languages/top/samueltuoyo15/Vtu-Backend)](https://github.com/samueltuoyo15/Vtu-Backend)
[![Last Commit](https://img.shields.io/github/last-commit/samueltuoyo15/Vtu-Backend)](https://github.com/samueltuoyo15/Vtu-Backend)
[![Stars](https://img.shields.io/github/stars/samueltuoyo15/Vtu-Backend?style=social)](https://github.com/samueltuoyo15/Vtu-Backend)
[![Forks](https://img.shields.io/github/forks/samueltuoyo15/Vtu-Backend?style=social)](https://github.com/samueltuoyo15/Vtu-Backend)

---
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)