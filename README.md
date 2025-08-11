# Ife-Elroiglobal VTU API 💸

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF5A5F?style=for-the-badge&logo=bullmq&logoColor=white)](https://docs.bullmq.io/)
[![Joi](https://img.shields.io/badge/Joi-589636?style=for-the-badge&logo=joi&logoColor=white)](https://joi.dev/)
[![Paystack](https://img.shields.io/badge/Paystack-00C3F7?style=for-the-badge&logo=paystack&logoColor=white)](https://paystack.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9D4D?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Overview

This is a robust and scalable Virtual Top-Up (VTU) backend API built with Node.js and the Express framework. It facilitates seamless transactions for data, airtime, electricity, and cable TV subscriptions, integrating with external service providers and payment gateways. The system leverages MongoDB for data persistence, Redis for high-performance caching and background job processing with BullMQ, ensuring a reliable and efficient financial service platform.

## Features

-   **User Authentication & Authorization**: Secure registration, login, email verification, and token management (JWT, Refresh Tokens).
-   **Account Management**: Dedicated user accounts with wallet balances, transaction history, and referral tracking.
-   **VTU Services**:
    -   **Data Subscription**: Purchase data plans across multiple networks.
    -   **Airtime Top-Up**: Recharge mobile airtime for various networks.
    -   **Electricity Bill Payment**: Pay for prepaid and postpaid electricity across different distribution companies.
    -   **Cable TV Subscription**: Subscribe to popular cable TV packages (DStv, GOtv, Startimes).
-   **Airtime to Cash Conversion**: Facilitates converting airtime balance to wallet funds.
-   **Bulk SMS Service**: Send bulk SMS messages to multiple recipients.
-   **External API Integrations**: Seamlessly connects with third-party VTU providers and payment gateways (Paystack).
-   **Asynchronous Processing**: Utilizes BullMQ with Redis for managing background tasks like transaction processing, enhancing system responsiveness.
-   **Data Validation**: Comprehensive input validation using Joi to maintain data integrity and prevent malformed requests.
-   **Rate Limiting**: Implements rate limiting using `express-rate-limit` and Redis to protect against abuse and ensure fair usage.
-   **Structured Logging**: Employs Pino for detailed and production-ready logging.
-   **Error Handling**: Centralized error handling middleware for consistent and informative error responses.

## Getting Started

Follow these steps to set up the project locally on your machine.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Vtu-Backend.git
    cd Vtu-Backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the root directory and configure the following variables:

### Environment Variables

List ALL required variables with examples:

```dotenv
PORT=5000
NODE_ENV=development

MONGODB_URI="mongodb://localhost:27017/vtu_db"
REDIS_URL="redis://localhost:6379"

JWT_SECRET_KEY="YOUR_SUPER_SECRET_JWT_KEY"

FRONTEND_DOMAIN="http://localhost:3000"

# External VTU Provider API (Example: VTU Africa or similar)
EXTERNAL_BACKEND_DOMAIN="https://example-vtu-api.com/api"
EXTERNAL_BACKEND_API_KEY="your_external_vtu_api_key"

# Email Service (Nodemailer with SMTP)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_smtp_user"
SMTP_PASS="your_smtp_password"

# Paystack Configuration
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key"
PAYSTACK_URL="https://api.paystack.co"

# VTU Africa (if used for specific services, e.g., Airtime2Cash, Bulk SMS)
VTUAFRICA_API_KEY="your_vtu_africa_api_key"
VTUAFRICA_AIRTME2_CASH_PHONE_NUMBER="08012345678" # Phone number registered with VTUAfrica for airtime-to-cash
```

### Usage

1.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    The server will typically run on `http://localhost:5000` (or your configured `PORT`).

2.  **Accessing the API**:
    You can use tools like Postman, Insomnia, or integrate directly with a frontend application. The API's root path is `/api/v1`.

    **Example: Registering a new user**
    Send a `POST` request to `http://localhost:5000/api/v1/auth/register` with the following JSON body:

    ```json
    {
      "full_name": "Jane Doe",
      "username": "janedoe",
      "email": "jane.doe@example.com",
      "phone": "08012345678",
      "address": "456 Oak Ave, Town",
      "password": "SecurePassword123!",
      "referral_username": "existinguser"
    }
    ```

    Upon successful registration, you will receive a verification email. Click the link in the email to verify your account before logging in.

    **Example: Logging in**
    Send a `POST` request to `http://localhost:5000/api/v1/auth/login` with:

    ```json
    {
      "username": "janedoe",
      "password": "SecurePassword123!"
    }
    ```
    On successful login, you'll receive an `accessToken` in the response body and both `accessToken` and `refreshToken` in HTTP-only cookies. These cookies should be automatically managed by your client for subsequent authenticated requests.

3.  **Running Tests**:
    To execute the test suite, use:
    ```bash
    npm test
    ```

## API Documentation

### Base URL
`http://localhost:5000/api/v1` (or your deployed domain)

### Endpoints

#### POST `/api/v1/auth/register`
**Description**: Registers a new user account.
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
  "message": "User registered successfully. Kindly check you email and verify your account"
}
```
**Errors**:
- `422 Unprocessable Entity`: Required fields missing.
- `409 Conflict`: User with email or username already exists.
- `500 Internal Server Error`: Server-side error during registration.

#### GET `/api/v1/auth/verify-email`
**Description**: Verifies a user's email address using a provided token.
**Request**:
Query Parameters:
- `token` (string, required): The verification token received in the email.
Example: `GET /api/v1/auth/verify-email?token=your_verification_token`
**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```
**Errors**:
- `400 Bad Request`: Missing `token` or user already verified.
- `404 Not Found`: Invalid verification link (user not found).
- `400 Bad Request`: Invalid or expired token.
- `500 Internal Server Error`: Server-side error during verification.

#### POST `/api/v1/auth/login`
**Description**: Authenticates a user and issues access and refresh tokens.
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
(Access and Refresh tokens are also set as HTTP-only cookies)
**Errors**:
- `422 Unprocessable Entity`: Username or password missing.
- `404 Not Found`: User not found.
- `401 Unauthorized`: Invalid password or account not verified.
- `500 Internal Server Error`: Server-side error during login.

#### POST `/api/v1/auth/logout`
**Description**: Logs out the authenticated user by invalidating their refresh tokens and clearing cookies.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>` (or `accessToken` in cookie)
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `500 Internal Server Error`: Server-side error during logout.

#### POST `/api/v1/auth/refresh-token`
**Description**: Refreshes the access token using the refresh token.
**Request**:
Cookies:
- `refreshToken`: The refresh token.
**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1Ni..."
}
```
(New access and refresh tokens are also set as HTTP-only cookies)
**Errors**:
- `400 Bad Request`: Missing refresh token.
- `401 Unauthorized`: Invalid or expired refresh token.
- `500 Internal Server Error`: Server-side error during token refresh.

#### GET `/api/v1/auth/me`
**Description**: Retrieves the details of the authenticated user, including their associated account and transactions.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>` (or `accessToken` in cookie)
**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "source": "database",
  "user": {
    "_id": "65f02c4b5d2e0f0c9c7f1e7d",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "08012345678",
    "address": "123 Main St, City",
    "is_verified": true,
    "account": {
      "_id": "65f02c4b5d2e0f0c9c7f1e7e",
      "wallet_balance": 15000,
      "total_funding": 20000,
      "total_referral": 5,
      "total_referral_bonus": 1000,
      "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
      "transactions": [
        {
          "_id": "65f02c4b5d2e0f0c9c7f1e7f",
          "type": "funding",
          "amount": 5000,
          "status": "success",
          "reference": "REF_xyz123"
        }
      ]
    }
  }
}
```
**Errors**:
- `400 Bad Request`: User ID missing.
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: Server-side error.

#### GET `/api/v1/subscribe/transactions`
**Description**: Retrieves all transactions associated with the authenticated user's account.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
**Response**:
```json
{
  "suceess": true,
  "transactions": {
    "_id": "65f02c4b5d2e0f0c9c7f1e7e",
    "user": "65f02c4b5d2e0f0c9c7f1e7d",
    "wallet_balance": 15000,
    "total_funding": 20000,
    "total_referral": 5,
    "total_referral_bonus": 1000,
    "wallet_summary": {},
    "account_number": null,
    "account_name": null,
    "bank_name": null,
    "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
    "transactions": [
      {
        "_id": "65f02c4b5d2e0f0c9c7f1e7f",
        "user": "65f02c4b5d2e0f0c9c7f1e7d",
        "type": "data",
        "amount": 785,
        "status": "success",
        "reference": "REF_abc",
        "metadata": {
          "status": "successful",
          "plan": 358,
          "network": "MTN",
          "plan_amount": 785,
          "plan_name": "1.0 GB",
          "date": "2024-01-01T12:00:00.000Z",
          "ported_number": false
        }
      },
      {
        "_id": "65f02c4b5d2e0f0c9c7f1e80",
        "user": "65f02c4b5d2e0f0c9c7f1e7d",
        "type": "funding",
        "amount": 5000,
        "status": "success",
        "reference": "REF_xyz",
        "metadata": {
          "status": "successful",
          "date": "2024-01-02T10:00:00.000Z"
        }
      }
    ]
  }
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: Account not found for the user.
- `500 Internal Server Error`: Server-side error.

#### POST `/api/v1/subscribe/data`
**Description**: Purchases a data subscription for a specified phone number.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
```json
{
  "network": 1,         // MTN (refer to /api/v1/plans/networks)
  "phone": "08012345678",
  "plan": 358,         // 1.0 GB for MTN (refer to /api/v1/plans/data-plans)
  "ported_number": false
}
```
**Response**:
```json
{
  "success": true,
  "message": "You successfully purchased data of plan 1.0 GB"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Missing required fields, invalid network/plan, or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error or external API failure.

#### POST `/api/v1/subscribe/airtime`
**Description**: Purchases an airtime top-up for a specified phone number.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
```json
{
  "network": 1,          // MTN (refer to /api/v1/plans/networks)
  "phone": "08012345678",
  "amount": 500,
  "airtime_type": "VTU", // "VTU", "Awuf4U", "Share and Sell"
  "ported_number": false
}
```
**Response**:
```json
{
  "status": "successful",
  "network": "MTN",
  "mobile_number": "08012345678",
  "amount": 500,
  "create_date": "2024-01-01T12:00:00.000Z",
  "transaction_id": "TRANS_ID_12345",
  "reference": "REF_abcde"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Missing required fields, invalid `airtime_type`, amount less than 100NGN, or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error or external API failure.

#### GET `/api/v1/subscribe/data-history`
**Description**: Retrieves all data transactions for the authenticated user.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
**Response**:
```json
[
  {
    "_id": "65f02c4b5d2e0f0c9c7f1e7f",
    "user": "65f02c4b5d2e0f0c9c7f1e7d",
    "type": "data",
    "amount": 785,
    "status": "success",
    "reference": "REF_abc",
    "metadata": {
      "status": "successful",
      "plan": 358,
      "network": "MTN",
      "plan_amount": 785,
      "plan_name": "1.0 GB",
      "date": "2024-01-01T12:00:00.000Z",
      "ported_number": false
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "__v": 0
  }
]
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error.

#### GET `/api/v1/subscribe/query-data/:transactionId`
**Description**: Retrieves a specific data transaction by its ID for the authenticated user.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Path Parameters:
- `transactionId` (string, required): The ID of the data transaction.
Example: `GET /api/v1/subscribe/query-data/65f02c4b5d2e0f0c9c7f1e7f`
**Response**:
```json
{
  "_id": "65f02c4b5d2e0f0c9c7f1e7f",
  "user": "65f02c4b5d2e0f0c9c7f1e7d",
  "type": "data",
  "amount": 785,
  "status": "success",
  "reference": "REF_abc",
  "metadata": {
    "status": "successful",
    "plan": 358,
    "network": "MTN",
    "plan_amount": 785,
    "plan_name": "1.0 GB",
    "date": "2024-01-01T12:00:00.000Z",
    "ported_number": false
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: Data transaction not found.
- `500 Internal Server Error`: Server-side error.

#### GET `/api/v1/subscribe/query-airtime/:transactionId`
**Description**: Retrieves a specific airtime transaction by its ID for the authenticated user.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Path Parameters:
- `transactionId` (string, required): The ID of the airtime transaction.
**Response**:
```json
{
  "_id": "65f02c4b5d2e0f0c9c7f1e7f",
  "user": "65f02c4b5d2e0f0c9c7f1e7d",
  "type": "airtime",
  "amount": 500,
  "status": "success",
  "reference": "REF_xyz",
  "metadata": {
    "status": "successful",
    "network": "MTN",
    "date": "2024-01-01T12:00:00.000Z",
    "ported_number": false
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: Airtime transaction not found.
- `500 Internal Server Error`: Server-side error.

#### POST `/api/v1/subscribe/electricity`
**Description**: Pays an electricity bill for a specified meter number.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
```json
{
  "disco_name": "Ikeja Electric", // Refer to /api/v1/plans/discos
  "amount": 2000,
  "meter_number": "12345678901",
  "meter_type": "prepaid"        // "prepaid" or "postpaid"
}
```
**Response**:
```json
{
  "status": "successful",
  "disco_name": "Ikeja Electric",
  "meter_number": "12345678901",
  "amount": 2000,
  "token": "YOUR_ELECTRICITY_TOKEN",
  "reference": "REF_abcdef"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Missing required fields, amount less than 100NGN, or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error or external API failure.

#### GET `/api/v1/subscribe/query-electricity-bill/:transactionId`
**Description**: Retrieves a specific electricity bill transaction by its ID for the authenticated user.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Path Parameters:
- `transactionId` (string, required): The ID of the electricity transaction.
**Response**:
```json
{
  "_id": "65f02c4b5d2e0f0c9c7f1e7f",
  "user": "65f02c4b5d2e0f0c9c7f1e7d",
  "type": "electricity",
  "amount": 2000,
  "status": "success",
  "reference": "REF_xyz",
  "metadata": {
    "status": "successful",
    "disco_name": "Ikeja Electric",
    "meter_number": "12345678901",
    "meter_type": "prepaid",
    "date": "2024-01-01T12:00:00.000Z"
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: Electricity transaction not found.
- `500 Internal Server Error`: Server-side error.

#### POST `/api/v1/subscribe/airtime-2-cash`
**Description**: Initiates a process to convert airtime to cash (funds wallet).
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
```json
{
  "network": "mtn",         // "mtn", "airtel", "glo", "9mobile"
  "phone_number": "08012345678",
  "amount": 5000
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
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Incomplete request body or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `429 Too Many Requests`: Rate limit exceeded (1 request per 5 minutes).
- `500 Internal Server Error`: Server-side error.

#### POST `/api/v1/subscribe/bulk-sms`
**Description**: Sends bulk SMS messages to a list of phone numbers.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
```json
{
  "message": "Hello from Ife-Elroiglobal VTU! Your transaction is complete.",
  "phone_numbers": ["08011122233", "07044455566"]
}
```
**Response**:
```json
{
  "success": true,
  "data": "Message sent successfully to all the provided numbers",
  "charge": 8 // Total charge for 2 SMS @ 4 NGN each
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Message or phone numbers missing, or insufficient wallet balance.
- `402 Payment Required`: External SMS API indicates insufficient credit.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error or external API failure.

#### POST `/api/v1/subscribe/cable`
**Description**: Subscribes to a cable TV plan.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
```json
{
  "cable_name": "DSTV",     // "GOTV", "DSTV", "STARTIME" (refer to /api/v1/plans/cables)
  "cable_plan": "DStv Compact", // Refer to /api/v1/plans/cable-plans
  "smart_card_number": "1234567890",
  "amount": 19000
}
```
**Response**:
```json
{
  "status": "successful",
  "cable_name": "DSTV",
  "cable_plan": "DStv Compact",
  "smart_card_number": "1234567890",
  "reference": "REF_xyzabc"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Missing required fields, amount less than 100NGN, or insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error or external API failure.

#### GET `/api/v1/subscribe/query-cable/:transactionId`
**Description**: Retrieves a specific cable TV subscription transaction by its ID for the authenticated user.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Path Parameters:
- `transactionId` (string, required): The ID of the cable transaction.
**Response**:
```json
{
  "_id": "65f02c4b5d2e0f0c9c7f1e7f",
  "user": "65f02c4b5d2e0f0c9c7f1e7d",
  "type": "cable",
  "amount": 19000,
  "status": "success",
  "reference": "REF_xyz",
  "metadata": {
    "status": "successful",
    "cable_name": "DSTV",
    "cable_plan": "DStv Compact",
    "smart_card_number": "1234567890",
    "date": "2024-01-01T12:00:00.000Z"
  },
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "__v": 0
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `404 Not Found`: Cable transaction not found.
- `500 Internal Server Error`: Server-side error.

#### GET `/api/v1/subscribe/validate-uic/:smart_card_number/:cable_name`
**Description**: Validates a smart card number against a cable TV provider.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Path Parameters:
- `smart_card_number` (string, required): The smart card number to validate.
- `cable_name` (string, required): The name of the cable provider (e.g., "DSTV").
Example: `GET /api/v1/subscribe/validate-uic/1234567890/DSTV`
**Response**:
```json
{
  "status": "successful",
  "customer_name": "John Doe",
  "balance": "N/A"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Missing smart card number or cable name.
- `500 Internal Server Error`: Server-side error or external API failure.

#### GET `/api/v1/subscribe/validate-meter/:meter_number/:disco_name/:meter_type`
**Description**: Validates an electricity meter number against a disco provider.
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Path Parameters:
- `meter_number` (string, required): The meter number to validate.
- `disco_name` (string, required): The name of the electricity distribution company (e.g., "Ikeja Electric").
- `meter_type` (string, required): The type of meter ("prepaid" or "postpaid").
Example: `GET /api/v1/subscribe/validate-meter/12345678901/Ikeja%20Electric/prepaid`
**Response**:
```json
{
  "status": "successful",
  "customer_name": "Jane Doe",
  "address": "789 Pine St, Lagos"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Missing meter number, disco name, or meter type.
- `500 Internal Server Error`: Server-side error or external API failure.

#### POST `/api/v1/payment/fund-wallet`
**Description**: Initiates a wallet funding transaction via a payment gateway (Paystack).
**Request**:
Headers:
- `Authorization`: `Bearer <accessToken>`
Body:
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
  "checkoutUrl": "https://checkout.paystack.com/...",
  "reference": "REF_abcdef"
}
```
**Errors**:
- `401 Unauthorized`: Invalid or missing access token.
- `400 Bad Request`: Email or amount missing, or amount less than 100NGN.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: Server-side error or payment gateway initialization failure.

#### POST `/api/v1/payment/verify-payment`
**Description**: Paystack webhook endpoint to verify successful payment transactions and update user wallets.
**Request**:
Headers:
- `X-Paystack-Signature`: HMAC SHA512 signature of the request body.
Body: (Paystack webhook payload, `charge.success` event)
```json
{
  "event": "charge.success",
  "data": {
    "id": 12345,
    "domain": "test",
    "status": "success",
    "reference": "REF_abcdef",
    "amount": 500000,
    "message": null,
    "gateway_response": "Successful",
    "paid_at": "2024-01-01T12:00:00.000Z",
    "created_at": "2024-01-01T12:00:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "ip_address": "192.168.1.1",
    "metadata": {
      "description": "Wallet Funding"
    },
    "customer": {
      "id": 67890,
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone": null
    },
    "plan": null,
    "requested_amount": 500000,
    "transaction_date": "2024-01-01T12:00:00.000Z",
    "authorization": { /* ... */ },
    "paymentReference": "REF_abcdef",
    "amountPaid": 500000
  }
}
```
**Response**:
- `200 OK`: Acknowledged successfully. (For `charge.success` events, the payment will be processed asynchronously by BullMQ worker).
**Errors**:
- `430 Invalid Signature`: Paystack webhook signature verification failed.
- `404 Not Found`: Transaction not found.
- `500 Internal Server Error`: Server-side error during webhook processing.

#### GET `/api/v1/plans/data-plans`
**Description**: Retrieves a list of available data plans.
**Request**: No authentication required.
**Response**:
```json
[
  { "id": 367, "network": "GLO", "type": "SME", "amount": 1885, "size": "10.0 GB", "validity": "7days" },
  { "id": 365, "network": "GLO", "type": "SME", "amount": 290, "size": "1.5 GB", "validity": "2days" }
  // ... more plans
]
```

#### GET `/api/v1/plans/networks`
**Description**: Retrieves a list of supported mobile networks.
**Request**: No authentication required.
**Response**:
```json
[
  { "id": 1, "name": "MTN" },
  { "id": 2, "name": "GLO" },
  { "id": 3, "name": "9MOBILE" },
  { "id": 4, "name": "AIRTEL" },
  { "id": 5, "name": "SMILE" }
]
```

#### GET `/api/v1/plans/cables`
**Description**: Retrieves a list of supported cable TV providers.
**Request**: No authentication required.
**Response**:
```json
[
  { "id": 1, "name": "GOTV" },
  { "id": 2, "name": "DSTV" },
  { "id": 3, "name": "STARTIME" }
]
```

#### GET `/api/v1/plans/cable-plans`
**Description**: Retrieves a list of available cable TV plans.
**Request**: No authentication required.
**Response**:
```json
[
  { "id": 2, "name": "GOtv Max", "amount": 8500 },
  { "id": 5, "name": "Asian Bouqet", "amount": 24250 }
  // ... more plans
]
```

#### GET `/api/v1/plans/discos`
**Description**: Retrieves a list of supported electricity distribution companies (discos).
**Request**: No authentication required.
**Response**:
```json
[
  { "id": 1, "name": "Ikeja Electric" },
  { "id": 2, "name": "Eko Electric" },
  // ... more discos
]
```

## Technologies Used

| Technology         | Description                                                                 | Link                                                           |
| :----------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Node.js**        | JavaScript runtime environment for server-side execution.                   | [nodejs.org](https://nodejs.org/)                              |
| **Express.js**     | Fast, unopinionated, minimalist web framework for Node.js.                  | [expressjs.com](https://expressjs.com/)                        |
| **MongoDB**        | NoSQL database for flexible and scalable data storage.                      | [mongodb.com](https://www.mongodb.com/)                        |
| **Mongoose**       | MongoDB object modeling for Node.js.                                        | [mongoosejs.com](https://mongoosejs.com/)                      |
| **Redis**          | In-memory data store, used for caching and message queuing.                  | [redis.io](https://redis.io/)                                  |
| **BullMQ**         | Robust queueing system for Node.js, built on Redis.                         | [docs.bullmq.io](https://docs.bullmq.io/)                      |
| **Joi**            | Powerful schema description language and data validator.                    | [joi.dev](https://joi.dev/)                                    |
| **JSON Web Tokens**| Securely transmits information between parties as a JSON object.            | [jwt.io](https://jwt.io/)                                      |
| **Argon2**         | Password hashing function for secure user authentication.                   | [argon2.org](https://argon2.org/)                              |
| **Axios**          | Promise-based HTTP client for making API requests.                          | [axios-http.com](https://axios-http.com/)                      |
| **Nodemailer**     | Module for sending emails from Node.js applications.                        | [nodemailer.com](https://nodemailer.com/about/)                |
| **Pino**           | Extremely fast Node.js logger.                                              | [getpino.io](https://getpino.io/)                              |
| **Helmet**         | Secures Express apps by setting various HTTP headers.                       | [helmetjs.com](https://helmetjs.com/)                          |
| **CORS**           | Middleware to enable Cross-Origin Resource Sharing.                         | [expressjs.com](https://expressjs.com/en/resources/middleware/cors.html) |
| **Express Rate Limit** | Basic rate limiting middleware for Express.js.                              | [npmjs.com/package/express-rate-limit](https://www.npmjs.com/package/express-rate-limit) |
| **Vitest**         | Fast and modern unit testing framework powered by Vite.                     | [vitest.dev](https://vitest.dev/)                              |

## License

This project is licensed under the ISC License. See the [LICENSE](https://opensource.org/licenses/ISC) file for details.

## Author Info

Connect with the project author:

-   **Samuel Tuoyo**:
    -   LinkedIn: [https://www.linkedin.com/in/tuoyo-samuel-8568b62b6/](https://www.linkedin.com/in/tuoyo-samuel-8568b62b6/)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)