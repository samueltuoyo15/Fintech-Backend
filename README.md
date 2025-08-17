# VTU Backend API

## Overview
A robust and scalable Node.js backend API built with Express, designed to power a Virtual Top-Up (VTU) and bill payment application. This system efficiently handles user authentication, secure wallet management, and seamless integrations with third-party APIs for various services like data, airtime, electricity, and cable subscriptions.

## Features
- **User Authentication & Authorization**: Implements secure user registration, login, and access control using JSON Web Tokens (JWT), Argon2 for password hashing, and refresh tokens for sustained sessions. Includes email verification for new accounts.
- **Wallet Management**: Manages user wallet balances, enabling secure funding via Paystack webhooks and automatic deductions for service purchases.
- **Virtual Top-Up Services**: Facilitates the purchase of data bundles, airtime, electricity bill payments, and cable TV subscriptions through external API integrations.
- **Comprehensive Transaction History**: Provides detailed logging and retrieval of all user transactions, including funding, service purchases, and referral bonuses.
- **Referral System**: Tracks and rewards user referrals, automatically crediting referrer accounts.
- **Asynchronous Processing**: Utilizes BullMQ with Redis for robust background job processing, ensuring efficient handling of webhooks and other potentially long-running tasks.
- **API Integration**: Seamlessly communicates with external payment gateways like Paystack and Virtual Top-Up service providers like VTU Africa API.
- **Input Validation**: Employs Joi for stringent and declarative validation of all incoming request data, ensuring data integrity.
- **Rate Limiting**: Protects API endpoints against abuse and ensures service availability using express-rate-limit with a Redis store.
- **Structured Logging**: Leverages Pino for high-performance, production-ready logging, providing clear insights into application behavior.
- **Data Caching**: Utilizes Redis for caching frequently accessed data, such as user details and plan lists, to improve response times and reduce database load.

## Getting Started
To get this project up and running on your local machine, follow these steps.

### Installation
To set up the project locally, ensure you have Node.js and npm (or yarn) installed.
1.  ⬇️ **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Vtu-Backend.git
    ```
2.  ➡️ **Navigate to the Project Directory**:
    ```bash
    cd Vtu-Backend
    ```
3.  📦 **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
4.  🚀 **Start the Development Server**:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The server will typically run on port `5000` as specified in `src/server.js` or your `.env` file.

### Environment Variables
This project requires several environment variables for proper functioning. Create a `.env` file in the root directory and populate it with the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string (e.g., redis://localhost:6379)
JWT_SECRET_KEY=a_very_secret_and_long_key_for_jwt
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_URL=https://api.paystack.co
VTU_AFRICA_DOMAIN=https://vtuafrica.ng/api/v1
VTUAFRICA_API_KEY=your_vtu_africa_api_key
FRONTEND_DOMAIN=http://localhost:3000 (or your deployed frontend URL)
GMAIL_SERVICE=gmail
SMTP_USER=your_gmail_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

## API Documentation
The API provides a comprehensive set of endpoints for user management, wallet operations, and various virtual top-up services.

### Base URL
All API endpoints are prefixed with: `https://your-api-domain.com/api/v1`

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
  "referral_username": "referrer_user"
}
```
**Response**:
```json
{
  "success": true,
  "message": "User registered successfully. Kindly check you email(inbox or spam) and verify your account"
}
```
**Errors**:
- `422 Unprocessable Entity`: All fields are required.
- `409 Conflict`: User with email or username already exists.
- `500 Internal Server Error`: General server error during registration.

#### GET /api/v1/auth/me
Retrieves the details of the authenticated user.
**Authentication**: Required.
**Request**: No body.
**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "source": "database",
  "user": {
    "_id": "651234567890abcdef123456",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "08012345678",
    "address": "123 Main St, City",
    "is_verified": true,
    "last_login": "2023-10-27T10:00:00.000Z",
    "account": {
        "_id": "651234567890abcdef123457",
        "wallet_balance": 15000,
        "total_funding": 20000,
        "total_referral": 5,
        "total_referral_bonus": 500,
        "total_spent": 5000,
        "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe"
    }
  }
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `404 Not Found`: User not found.
- `500 Internal Server Error`: General server error.


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
(Access and refresh tokens are also set as HTTP-only cookies)
**Errors**:
- `422 Unprocessable Entity`: Username and password are required.
- `404 Not Found`: User not found.
- `401 Unauthorized`: Invalid password or account not verified yet.
- `500 Internal Server Error`: General server error during login.

#### POST /api/v1/auth/logout
Logs out the authenticated user by invalidating their refresh tokens and clearing cookies.
**Authentication**: Required.
**Request**: No body.
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `500 Internal Server Error`: General server error during logout.

#### POST /api/v1/auth/refresh-token
Refreshes an expired access token using a valid refresh token.
**Request**:
Refresh token expected in HTTP-only cookie. No body.
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
- `401 Unauthorized`: Invalid or expired refresh token, or user not found.
- `500 Internal Server Error`: General server error during token refresh.

#### GET /api/v1/subscribe/transactions
Retrieves a list of all transactions for the authenticated user.
**Authentication**: Required.
**Request**:
Query parameters (optional):
- `page`: Page number (default: `1`)
- `limit`: Number of transactions per page (default: `50`)
- `type`: Filter by transaction type (e.g., `data`, `airtime`, `funding`, `referral`). If not provided or "All", returns all types.
Example: `/api/v1/subscribe/transactions?page=1&limit=10&type=data`
**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "651234567890abcdef123458",
      "user": "651234567890abcdef123456",
      "type": "data",
      "amount": 500,
      "status": "success",
      "reference": "REF_xyz123abc",
      "metadata": {
        "status": "successful",
        "plan": "MTN SME Data - 500MB",
        "service": "MTNSME",
        "plan_amount": 490,
        "plan_name": "MTN SME Data",
        "date": "2023-10-27T10:15:00.000Z"
      },
      "createdAt": "2023-10-27T10:15:00.000Z",
      "updatedAt": "2023-10-27T10:15:00.000Z"
    }
  ],
  "cached": false
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `404 Not Found`: Transactions not found for the specified user/filters.
- `500 Internal Server Error`: General server error.

#### GET /api/v1/subscribe/referrals
Retrieves a list of all successful referrals for the authenticated user.
**Authentication**: Required.
**Request**:
Query parameters (optional):
- `page`: Page number (default: `1`)
- `limit`: Number of referrals per page (default: `10`)
- `search`: Search by referee username (case-insensitive regex).
Example: `/api/v1/subscribe/referrals?page=1&limit=5&search=user`
**Response**:
```json
{
  "success": true,
  "referrals": [
    {
      "username": "referee_user1",
      "email": "referee1@example.com",
      "full_name": "Referee User One"
    },
    {
      "username": "referee_user2",
      "email": "referee2@example.com",
      "full_name": "Referee User Two"
    }
  ],
  "total": 2,
  "cached": false
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `404 Not Found`: No referrals found.
- `500 Internal Server Error`: General server error.

#### POST /api/v1/subscribe/data
Purchases a data subscription for a given phone number.
**Authentication**: Required.
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
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Network, phone, service, or plan_amount are missing or invalid. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: General server error or error communicating with VTU Africa API.

#### POST /api/v1/subscribe/airtime
Purchases airtime for a given phone number.
**Authentication**: Required.
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
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Network, phone, or amount are missing or invalid. Amount must be greater than 100 NGN. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: General server error or error communicating with VTU Africa API.

#### POST /api/v1/subscribe/electricity
Pays an electricity bill for a given meter number.
**Authentication**: Required.
**Request**:
```json
{
  "disco_name": "ikeja-electric",
  "meter_number": 1234567890,
  "meter_type": "prepaid",
  "amount": 2000
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
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Disco name, meter number, meter type, or amount are missing or invalid. Amount must be greater than 100 NGN. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: General server error or error communicating with VTU Africa API.

#### POST /api/v1/subscribe/recharge-card-pins
Purchases recharge card pins.
**Authentication**: Required.
**Request**:
```json
{
  "network": "MTN",
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
    {
      "pin": "1234-5678-9012-3456",
      "serial": "123456789",
      "network": "MTN",
      "amount": "100",
      "status": "Available",
      "expiry_date": "2024-12-31"
    }
  ],
  "charge": 98.5
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Quantity, network, or variation are missing or invalid. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `402 Payment Required`: External API (VTU Africa) funding issue.
- `500 Internal Server Error`: General server error.

#### POST /api/v1/subscribe/bulk-sms
Sends bulk SMS messages to a list of phone numbers.
**Authentication**: Required.
**Request**:
```json
{
  "message": "Hello from VTU Backend!",
  "phone_numbers": ["08012345678", "09087654321"]
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
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Message or phone numbers are missing or invalid. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `402 Payment Required`: External API (VTU Africa) funding issue.
- `500 Internal Server Error`: General server error.

#### POST /api/v1/subscribe/buy-result-checker
Purchases result checker pins.
**Authentication**: Required.
**Request**:
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
      "pin": "1234567890",
      "serial": "0987654321",
      "service": "waec",
      "product_name": "WAEC Result Checking PIN"
    }
  ],
  "charge": 3850
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Quantity, service, or product code are missing or invalid. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `402 Payment Required`: External API (VTU Africa) funding issue.
- `500 Internal Server Error`: General server error.

#### POST /api/v1/subscribe/cable
Purchases a cable TV subscription.
**Authentication**: Required.
**Request**:
```json
{
  "cable_name": "DSTV",
  "smart_card_number": 1234567890,
  "variation": "dstv_compact"
}
```
**Response**:
```json
{
  "success": true,
  "description": {
    "Status": "Successful",
    "ProductName": "Dstv Compact",
    "Amount_Charged": 19000,
    "transaction_date": "2023-10-27T10:30:00.000Z",
    "ref": "REF_abc123def"
  }
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Cable name, smart card number, or variation are missing or invalid. Insufficient wallet balance.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: General server error or error communicating with VTU Africa API.

#### POST /api/v1/payment/fund-wallet
Initiates a payment to fund the user's wallet via Paystack.
**Authentication**: Required.
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
  "checkoutUrl": "https://checkout.paystack.com/...",
  "reference": "REF_xyzabc123"
}
```
**Errors**:
- `401 Unauthorized`: No token provided or invalid access token.
- `400 Bad Request`: Amount is required or amount is less than 100 NGN.
- `404 Not Found`: Account not found.
- `500 Internal Server Error`: General server error or error initiating transaction with Paystack.


#### GET /api/v1/plans/data-plans
Retrieves a list of available data plans.
**Request**:
Query parameter (optional): `network` (e.g., `MTN`, `AIRTEL`, `GLO`, `9MOBILE`) to filter plans by network.
Example: `/api/v1/plans/data-plans?network=MTN`
**Response**:
```json
{
  "success": true,
  "message": "List of Data Plans",
  "source": "redis-cache",
  "data": [
    {
      "Value": "500MB",
      "Service": "MTNSME",
      "DataPlan": "500W",
      "Description": "MTN SME Data",
      "Validity": "7-Days",
      "PortalOwners": "₦490",
      "Resellers": "₦495",
      "Agents": "₦500",
      "FreeUsers": "₦505",
      "Status": "Active"
    }
  ]
}
```
**Errors**:
- `500 Internal Server Error`: General server error.

#### GET /api/v1/plans/cable-plans
Retrieves a list of available cable TV plans.
**Request**:
Query parameter (optional): `variation` (e.g., `DSTV`, `GOTV`, `STARTIMES`) to filter plans by cable provider.
Example: `/api/v1/plans/cable-plans?variation=DSTV`
**Response**:
```json
{
  "success": true,
  "message": "List of Data Plans",
  "source": "redis-cache",
  "data": [
    {
      "name": "dstv_padi",
      "price": 4400
    }
  ]
}
```
**Errors**:
- `500 Internal Server Error`: General server error.

#### GET /api/v1/plans/electricity-plans
Retrieves a list of supported electricity distribution companies (discos).
**Request**: No body or query parameters.
**Response**:
```json
{
  "success": true,
  "source": "live-data",
  "message": "List of Electricity Plans",
  "data": [
    {
      "serviceCode": "aba-electric",
      "displayName": "Aba Electricity Distribution Company"
    }
  ]
}
```
**Errors**:
- `500 Internal Server Error`: General server error.

#### GET /api/v1/plans/result-checker-plans
Retrieves a list of available result checker plans (WAEC, NECO, NABTEB, JAMB).
**Request**: No body or query parameters.
**Response**:
```json
{
  "success": true,
  "source": "live-data",
  "message": "List of Electricity Plans",
  "data": [
    {
      "description": "WAEC Result Checking PIN",
      "service": "waec",
      "code": 1,
      "price": 3850
    }
  ]
}
```
**Errors**:
- `500 Internal Server Error`: General server error.

## Usage
Once the server is running, you can interact with the API using any HTTP client (e.g., Postman, Insomnia, or directly from your frontend application).

### User Authentication Flow
1.  **Register**: Send a `POST` request to `/api/v1/auth/register` with user details. You will receive an email verification link.
2.  **Verify Email**: Click the verification link from your email or make a `GET` request to `/api/v1/auth/verify-email` with the `token` query parameter.
3.  **Login**: Send a `POST` request to `/api/v1/auth/login` with your username and password. On successful login, you'll receive an `accessToken` in the response body and both `accessToken` and `refreshToken` will be set as HTTP-only cookies.
4.  **Access Protected Endpoints**: Include the `accessToken` in the `Authorization` header as a Bearer token (`Bearer YOUR_ACCESS_TOKEN`) or ensure your client sends the HTTP-only cookie with subsequent requests.
5.  **Logout**: To end your session, send a `POST` request to `/api/v1/auth/logout`. This will clear your tokens from the server and your cookies.
6.  **Token Refresh**: If your `accessToken` expires, the frontend should attempt to call `POST /api/v1/auth/refresh-token`. If a valid `refreshToken` is present in your cookies, a new pair of tokens will be issued.

### Performing Transactions
1.  **Fund Wallet**: Before making purchases, ensure your wallet has sufficient balance. Send a `POST` request to `/api/v1/payment/fund-wallet` with the desired `amount`. This will return a `checkoutUrl` from Paystack. Redirect your user to this URL to complete the payment. Upon successful payment, Paystack will notify the backend via a webhook, and your wallet will be credited.
2.  **Buy Data/Airtime/Pay Bills**: Once your wallet is funded, you can access services:
    *   **Data**: `POST /api/v1/subscribe/data` with `phone`, `service`, `plan_amount`, `network`.
    *   **Airtime**: `POST /api/v1/subscribe/airtime` with `network`, `phone`, `amount`.
    *   **Electricity**: `POST /api/v1/subscribe/electricity` with `disco_name`, `meter_number`, `meter_type`, `amount`.
    *   **Cable**: `POST /api/v1/subscribe/cable` with `cable_name`, `smart_card_number`, `variation`.
    *   **Bulk SMS**: `POST /api/v1/subscribe/bulk-sms` with `message` and `phone_numbers` array.
    *   **Result Checker**: `POST /api/v1/subscribe/buy-result-checker` with `quantity`, `service`, `product_code`.
    *   **Recharge Card Pins**: `POST /api/v1/subscribe/recharge-card-pins` with `network`, `quantity`, `variation`.
3.  **View Transactions & Referrals**: Use `GET /api/v1/subscribe/transactions` and `GET /api/v1/subscribe/referrals` to monitor your activity and referral earnings.

### Fetching Plans
You can retrieve lists of available plans (data, cable, electricity, result checker) without authentication:
*   `GET /api/v1/plans/data-plans`
*   `GET /api/v1/plans/cable-plans`
*   `GET /api/v1/plans/electricity-plans`
*   `GET /api/v1/plans/result-checker-plans`

## Technologies Used

| Category          | Technology                                                                                           | Description                                                                     |
| :---------------- | :--------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Backend Core**  | [Node.js](https://nodejs.org/)                                                                       | JavaScript runtime for server-side execution.                                   |
|                   | [Express.js](https://expressjs.com/)                                                                 | Fast, unopinionated, minimalist web framework for Node.js.                      |
| **Database**      | [MongoDB](https://www.mongodb.com/)                                                                  | NoSQL database for flexible data storage.                                       |
|                   | [Mongoose](https://mongoosejs.com/)                                                                  | Elegant MongoDB object modeling for Node.js.                                   |
| **Caching & Queues** | [Redis](https://redis.io/)                                                                           | In-memory data store for caching and message queuing.                            |
|                   | [ioredis](https://github.com/luin/ioredis)                                                           | Robust, performance-focused Redis client for Node.js.                           |
|                   | [BullMQ](https://docs.bullmq.io/)                                                                    | Powerful message queue for Node.js based on Redis.                              |
| **Authentication** | [JSON Web Tokens (JWT)](https://jwt.io/)                                                             | Standard for securely transmitting information as a JSON object.                |
|                   | [Argon2](https://argon2.org/)                                                                        | Strong password hashing function.                                               |
| **Validation**    | [Joi](https://joi.dev/)                                                                              | Powerful schema description language and data validator for JavaScript.         |
| **HTTP Client**   | [Axios](https://axios-http.com/)                                                                     | Promise-based HTTP client for making API requests.                              |
| **Logging**       | [Pino](https://getpino.io/)                                                                          | Extremely fast, production-ready logger.                                        |
| **Email Service** | [Nodemailer](https://nodemailer.com/)                                                                | Module for Node.js applications to allow easy email sending.                    |
| **Rate Limiting** | [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)                               | Basic rate limiting middleware for Express.                                     |
|                   | [rate-limit-redis](https://www.npmjs.com/package/rate-limit-redis)                                   | Redis store for `express-rate-limit`.                                           |
| **External APIs** | [Paystack](https://paystack.com/)                                                                    | Online payment gateway.                                                         |
|                   | [VTU Africa API](https://vtuafrica.ng/developers)                                                    | Virtual Top-Up and bill payment service provider.                               |

## License
This project is licensed under the ISC License.

## Author Info
Developed with dedication by:

**Samuel Tuoyo**
*   LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/tuoyo-samuel-8568b62b6/)

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF5733?style=for-the-badge&logo=redis&logoColor=white)](https://docs.bullmq.io/)
[![Joi](https://img.shields.io/badge/Joi-E94E77?style=for-the-badge&logo=npm&logoColor=white)](https://joi.dev/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)