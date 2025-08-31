# Ife-Elroiglobal VTU API

## Overview
This is a robust and scalable fintech backend application built with Node.js and Express.js, leveraging MongoDB for data persistence, Redis for caching and queue management, and integrated with external VTU and payment gateway services. It powers virtual top-up functionalities for airtime, data, electricity, and cable subscriptions, alongside robust user authentication and account management.

## Features
*   **User Authentication**: Secure registration, login, logout, email verification, and token refreshing with JWT and Argon2.
*   **Account Management**: Dedicated user accounts with wallet balance, transaction history, referral tracking, and real-time updates.
*   **Virtual Top-Up**: Seamless transactions for purchasing data, airtime, electricity, cable TV subscriptions, bulk SMS, result checker pins, and recharge card pins.
*   **Payment Integration**: Secure wallet funding via Paystack, featuring webhook verification for reliable transaction processing.
*   **Optimized Performance**: Utilizes Redis for efficient caching of user details and transaction history, reducing database load.
*   **Asynchronous Processing**: Implements BullMQ with Redis for background processing of critical tasks like wallet funding, ensuring responsiveness.
*   **Data Validation**: Comprehensive request body validation using Joi schemas to maintain data integrity and prevent errors.
*   **Security & Monitoring**: Includes Helmet for HTTP header security, Express Rate Limit to protect against abuse, and Pino for structured logging.
*   **Modular Architecture**: Organized into controllers, services, middlewares, models, and utility functions for maintainability and scalability.

## Getting Started

### Installation
To get this project up and running on your local machine, follow these steps:

*   **Clone the Repository**:
    ```bash
    git clone https://github.com/samueltuoyo15/Vtu-Backend.git
    cd Vtu-Backend
    ```

*   **Install Dependencies**:
    ```bash
    npm install
    ```

*   **Database Setup**:
    This project uses MongoDB. Ensure you have a MongoDB instance running or use a cloud provider like MongoDB Atlas.

*   **Redis Setup**:
    This project uses Redis for caching and queue management. Ensure you have a Redis instance running or use a cloud provider.

### Environment Variables
Create a `.env` file in the root directory and populate it with the following variables. Examples are provided for clarity; adjust values as necessary.

```dotenv
PORT=5000
MONGODB_URI="mongodb://localhost:27017/vtudb"
REDIS_URL="redis://localhost:6379"

JWT_SECRET_KEY="supersecretjwtkey"

FRONTEND_DOMAIN="http://localhost:3000" # URL of your frontend application
EXTERNAL_BACKEND_DOMAIN="https://api.externalvtu.com" # Example: an external VTU provider domain
EXTERNAL_BACKEND_API_KEY="your_external_vtu_api_key"

VTU_AFRICA_DOMAIN="https://vtuafricaltd.com/api" # Example: VTU Africa API domain
VTUAFRICA_API_KEY="your_vtuafrica_api_key"

GMAIL_SERVICE="Gmail" # Or your email service provider
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_app_password"

PAYSTACK_SECRET_KEY="sk_test_..." # Your Paystack Secret Key
PAYSTACK_PUBLIC_KEY="pk_test_..." # Your Paystack Public Key
PAYSTACK_URL="https://api.paystack.co" # Paystack API Base URL
```

### Running the Application
*   **Development Mode**:
    ```bash
    npm run dev
    ```
    This will start the server with `nodemon`, enabling live-reloading.

*   **Production Mode**:
    ```bash
    npm start
    ```
    This will start the server using `node`.

## Usage
Once the server is running, you can interact with the API using a tool like Postman, Insomnia, or by integrating it with your frontend application.

### Authentication Flow
1.  **Register**: Create a new user account. An email verification link will be sent.
2.  **Verify Email**: Click the link in your email to activate your account.
3.  **Login**: Authenticate to receive `accessToken` and `refreshToken` cookies.
4.  **Access Protected Routes**: Use the `accessToken` (sent automatically via cookies, or manually in `Authorization: Bearer <token>` header) to access protected API endpoints.
5.  **Refresh Token**: If the `accessToken` expires, the `refreshToken` endpoint can be used to obtain new tokens automatically.

### Performing Transactions
*   **Fund Wallet**: Initiate a payment via Paystack to add funds to your wallet.
*   **Purchase Services**: Use the funded wallet to buy data, airtime, pay electricity bills, or subscribe to cable TV. Ensure your wallet balance is sufficient for the transaction.
*   **View History**: Retrieve your transaction and referral history from your account.

## API Documentation

### Base URL
`https://your-domain.com/api/v1` (or `http://localhost:5000/api/v1` for local development)

### Endpoints

#### POST /api/v1/auth/register
Registers a new user account. An email verification link is sent upon successful registration.

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
  "message": "User registered successfully. Kindly check your email(inbox or spam) and verify your account"
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, invalid format)
- 409: User already exists / Username already taken
- 500: Internal server error

#### GET /api/v1/auth/verify-email
Verifies a user's email address using a token received in the registration email.

**Request**: (Query Parameter)
`GET /api/v1/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**Errors**:
- 400: Missing token / Invalid or expired token
- 404: Invalid verification link (user not found)
- 400: User already verified
- 500: Internal server error

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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Cookies `accessToken` and `refreshToken` are also set.*

**Errors**:
- 400: Validation Error (e.g., missing username/password)
- 404: User not found
- 401: Invalid password / Account not verified yet
- 500: Internal server error

#### POST /api/v1/auth/logout
Logs out the authenticated user by clearing tokens and deleting refresh tokens from the database.

**Request**: (Requires authentication)
(No payload)

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Errors**:
- 401: Unauthorized (if no valid access token)
- 500: Internal server error

#### POST /api/v1/auth/refresh-token
Refreshes access and refresh tokens using an existing refresh token.

**Request**:
(No payload. Requires `refreshToken` cookie)

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*New `accessToken` and `refreshToken` cookies are also set.*

**Errors**:
- 400: Missing refresh token
- 401: Invalid or expired refresh token
- 500: Internal server error

#### GET /api/v1/auth/me
Retrieves details of the authenticated user.

**Request**: (Requires authentication)
(No payload)

**Response**:
```json
{
  "success": true,
  "message": "User details retrieved successfully",
  "source": "database",
  "user": {
    "_id": "65e6d623b016256f082e0e0a",
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "08012345678",
    "address": "123 Main St, City",
    "is_verified": true,
    "createdAt": "2024-03-04T12:00:00.000Z",
    "updatedAt": "2024-03-04T12:30:00.000Z",
    "account": {
      "_id": "65e6d623b016256f082e0e0b",
      "wallet_balance": 1500,
      "total_funding": 2000,
      "total_referral": 2,
      "total_referral_bonus": 2,
      "total_spent": 500,
      "referral_link": "https://ife-elroiglobal.com/signup?referral=johndoe",
      "transactions": [],
      "createdAt": "2024-03-04T12:00:00.000Z",
      "updatedAt": "2024-03-04T12:30:00.000Z",
      "user": "65e6d623b016256f082e0e0a"
    }
  }
}
```

**Errors**:
- 400: User ID is required
- 401: Unauthorized
- 404: User not found
- 500: Internal server error

#### GET /api/v1/subscribe/transactions
Retrieves a list of all transactions for the authenticated user. Supports pagination and filtering by transaction type.

**Request**: (Requires authentication)
`GET /api/v1/subscribe/transactions?page=1&limit=10&type=data`

**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "65e6d623b016256f082e0e0c",
      "user": "65e6d623b016256f082e0e0a",
      "type": "data",
      "amount": 500,
      "status": "success",
      "reference": "REF_xyz123",
      "metadata": {
        "status": "successful",
        "plan": "MTN - 1GB",
        "plan_amount": 500,
        "plan_name": "1GB",
        "date": "2024-03-04T12:15:00.000Z",
        "ported_number": false
      },
      "createdAt": "2024-03-04T12:15:00.000Z",
      "updatedAt": "2024-03-04T12:15:00.000Z"
    }
  ],
  "cached": false
}
```

**Errors**:
- 401: Unauthorized
- 404: Transactions not found
- 500: Internal server error

#### GET /api/v1/subscribe/referrals
Retrieves a list of referrals made by the authenticated user. Supports pagination and searching.

**Request**: (Requires authentication)
`GET /api/v1/subscribe/referrals?page=1&limit=10&search=john`

**Response**:
```json
{
  "success": true,
  "referrals": [
    {
      "username": "janedoe",
      "email": "jane.doe@example.com",
      "full_name": "Jane Doe"
    }
  ],
  "total": 1,
  "cached": false
}
```

**Errors**:
- 401: Unauthorized
- 404: No referrals found
- 500: Internal server error

#### POST /api/v1/subscribe/data
Purchases a data subscription for a specified phone number.

**Request**: (Requires authentication)
```json
{
  "phone": "08012345678",
  "network_id": 1,
  "id": 428,
  "ported_number": false
}
```
*`network_id`: 1 for MTN, 2 for GLO, 3 for 9MOBILE, 4 for AIRTEL. `id` refers to the specific plan ID.*

**Response**:
```json
{
  "success": true,
  "message": "You successfully purchased data plan of MTN - 1GB valid for: 1MONTH"
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, invalid phone number, amount < 50)
- 401: Unauthorized
- 404: Account not found / Data plan not found
- 400: Insufficient wallet balance
- 500: Internal server error

#### POST /api/v1/subscribe/airtime
Purchases airtime for a specified phone number.

**Request**: (Requires authentication)
```json
{
  "network_id": 1,
  "phone": "08012345678",
  "amount": 500
}
```
*`network_id`: 1 for MTN, 2 for GLO, 3 for 9MOBILE, 4 for AIRTEL. `amount` must be >= 50.*

**Response**:
```json
{
  "success": true,
  "message": "Airtime sent successfully"
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, invalid phone number, amount < 50)
- 401: Unauthorized
- 404: Account not found
- 400: Insufficient wallet balance
- 500: Internal server error

#### POST /api/v1/subscribe/electricity
Pays electricity bills for a specified meter number.

**Request**: (Requires authentication)
```json
{
  "disco_name": "Ikeja Electric",
  "amount": 1000,
  "meter_number": "12345678901",
  "meter_type": "prepaid"
}
```
*`amount` must be >= 100.*

**Response**:
```json
{
  "success": true,
  "message": "success"
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, amount < 100)
- 401: Unauthorized
- 404: Account not found
- 400: Insufficient wallet balance
- 500: Internal server error

#### POST /api/v1/subscribe/recharge-card-pins
Purchases recharge card pins for a specified network and quantity.

**Request**: (Requires authentication)
```json
{
  "network": "MTN",
  "quantity": 1,
  "variation": "100"
}
```
*`network` (e.g., "MTN", "GLO"), `quantity` (number of pins), `variation` (denomination like "100", "200").*

**Response**:
```json
{
  "success": true,
  "message": "Result checked successfully",
  "pins": [
    {
      "amount": "100",
      "pin": "1234567890123456"
    }
  ],
  "charge": 100
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, insufficient wallet balance)
- 401: Unauthorized
- 402: Kindly bear with us till we fund our api (external API error)
- 404: Account not found
- 500: Internal server error

#### POST /api/v1/subscribe/bulk-sms
Sends bulk SMS to a list of phone numbers.

**Request**: (Requires authentication)
```json
{
  "message": "Hello from Ife-Elroiglobal!",
  "phone_numbers": ["08012345678", "09012345678"]
}
```
*`message` is the SMS content, `phone_numbers` is an array of recipient phone numbers.*

**Response**:
```json
{
  "success": true,
  "message": "Message sent successfully to all the provided numbers",
  "charge": 8
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, insufficient wallet balance)
- 401: Unauthorized
- 402: External service error (e.g., "Bulk SMS response: Insufficient Credit")
- 404: Account not found
- 500: Internal server error

#### POST /api/v1/subscribe/buy-result-checker
Purchases result checker pins (WAEC, NECO, JAMB, NABTEB).

**Request**: (Requires authentication)
```json
{
  "quantity": 1,
  "service": "waec",
  "product_code": 1
}
```
*`quantity` (number of pins), `service` (e.g., "waec", "neco", "jamb", "nabteb"), `product_code` (specific product for the service).*

**Response**:
```json
{
  "success": true,
  "message": "Result checked successfully",
  "pins": [
    "1234567890",
    "0987654321"
  ],
  "charge": 3850
}
```

**Errors**:
- 400: Validation Error (e.g., missing fields, insufficient wallet balance)
- 401: Unauthorized
- 402: Kindly bear with us till we fund result checking api (external API error)
- 404: Account not found
- 500: Internal server error

#### POST /api/v1/subscribe/cable
Subscribes to a cable TV plan.

**Request**: (Requires authentication)
```json
{
  "cable_name": "DStv",
  "cable_plan": "DStv Compact",
  "smart_card_number": "12345678901",
  "amount": 19000
}
```
*`cable_name` (e.g., "DStv", "GOtv"), `cable_plan` (e.g., "DStv Compact"), `smart_card_number`, `amount` must be >= 100.*

**Response**:
```json
{
  "success": true,
  "message": "Cable subscription successful"
}
```
*(Actual response from external API might vary, but this is typical for success)*

**Errors**:
- 400: Validation Error (e.g., missing fields, amount < 100)
- 401: Unauthorized
- 404: Account not found
- 400: Insufficient wallet balance
- 500: Internal server error / Failed to subscribe to cable

#### GET /api/v1/subscribe/validate-uic/:smart_card_number/:cable_name
Validates a smart card number for a given cable TV service.

**Request**: (Requires authentication)
`GET /api/v1/subscribe/validate-uic/12345678901/DStv`

**Response**:
```json
{
  "success": true,
  "data": {
    "customer_name": "John Doe",
    "status": "active"
  }
}
```
*(Actual response from external API might vary)*

**Errors**:
- 400: Smart card number and cable name are required
- 401: Unauthorized
- 500: Internal server error

#### GET /api/v1/subscribe/validate-meter/:meter_number/:disco_name/:meter_type
Validates an electricity meter number for a given disco and meter type.

**Request**: (Requires authentication)
`GET /api/v1/subscribe/validate-meter/12345678901/Ikeja Electric/prepaid`

**Response**:
```json
{
  "success": true,
  "data": {
    "customer_name": "Jane Doe",
    "address": "456 Oak Ave",
    "meter_status": "valid"
  }
}
```
*(Actual response from external API might vary)*

**Errors**:
- 400: Meter number, disco name, and meter type are required
- 401: Unauthorized
- 500: Internal server error

#### POST /api/v1/payment/fund-wallet
Initiates a Paystack transaction to fund the user's wallet.

**Request**: (Requires authentication)
```json
{
  "amount": 5000
}
```
*`amount` must be >= 100.*

**Response**:
```json
{
  "message": "Transaction initialized. Please complete payment.",
  "checkoutUrl": "https://checkout.paystack.com/your_payment_url",
  "reference": "REF_abcdef123"
}
```

**Errors**:
- 400: Amount required / Amount to be funded must be greater than 100NGN
- 401: Unauthorized
- 404: Account not found
- 500: Internal server error

#### POST /api/v1/payment/verify-payment
Webhook endpoint for Paystack to notify of successful transactions. This endpoint is for Paystack to call, not for direct client use.

**Request**: (From Paystack webhook)
```json
{
  "event": "charge.success",
  "data": {
    "reference": "REF_abcdef123",
    "amount": 500000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "john.doe@example.com"
    },
    "...": "..."
  }
}
```

**Response**:
- 200: Acknowledged, message varies based on processing status.
- 430: Invalid signature
- 404: Transaction not found
- 500: Internal server error

#### GET /api/v1/plans/data-plans
Retrieves a list of available data plans.

**Request**:
(No payload)

**Response**:
```json
[
  { "id": 276, "network": "9MOBILE", "network_id": 3, "planType": "CORPORATE GIFTING", "amount": 3700, "size": "10.0 GB", "validity": "1 month" },
  { "id": 307, "network": "AIRTEL", "network_id": 4, "planType": "GIFTING", "amount": 3000, "size": "8.0 GB", "validity": "1 Month" }
  // ... more plans
]
```

**Errors**:
- 500: Internal server error (unlikely for this endpoint)

#### GET /api/v1/plans/cable-plans
Retrieves a list of available cable TV plans.

**Request**:
(No payload)

**Response**:
```json
[
  { "id": 2, "name": "GOtv Max", "amount": 8500 },
  { "id": 7, "name": "DStv Compact", "amount": 19000 }
  // ... more plans
]
```

**Errors**:
- 500: Internal server error (unlikely for this endpoint)

#### GET /api/v1/plans/electricity-plans
Retrieves a list of available electricity distribution companies (discos).

**Request**:
(No payload)

**Response**:
```json
[
  { "id": 1, "name": "Ikeja Electric" },
  { "id": 2, "name": "Eko Electric" }
  // ... more plans
]
```

**Errors**:
- 500: Internal server error (unlikely for this endpoint)

## Technologies Used

| Category       | Technology                                                                                                                                                                                                                            | Description                                                                     |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| **Backend**    | [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)                                                                                                     | JavaScript runtime for server-side execution.                                   |
|                | [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)                                                                                             | Web framework for building robust APIs.                                         |
| **Database**   | [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)                                                                                                 | NoSQL database for flexible data storage.                                       |
|                | [![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white)](https://mongoosejs.com/)                                                                                               | MongoDB object data modeling (ODM) for Node.js.                                 |
| **Caching**    | [![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)                                                                                                               | In-memory data store for caching and session management.                        |
| **Queuing**    | [![BullMQ](https://img.shields.io/badge/BullMQ-FF5733?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://docs.bullmq.io/)                                                                                                     | Robust queue system for Node.js, built on Redis, for background job processing. |
| **Auth**       | [![JSON Web Tokens](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)                                                                                               | Secure authentication tokens.                                                   |
|                | [![Argon2](https://img.shields.io/badge/Argon2-purple?style=for-the-badge&logo=argon2&logoColor=white)](https://github.com/P-H-C/phc-argon2)                                                                                         | Hashing algorithm for password security.                                        |
| **Validation** | [![Joi](https://img.shields.io/badge/Joi-white?style=for-the-badge&logo=joi&logoColor=black)](https://joi.dev/)                                                                                                                         | Schema description language and data validator.                                 |
| **Payments**   | [![Paystack](https://img.shields.io/badge/Paystack-00C3F7?style=for-the-badge&logo=paystack&logoColor=white)](https://paystack.com/)                                                                                                 | Online payment gateway for seamless transactions.                               |
| **Logging**    | [![Pino](https://img.shields.io/badge/Pino-FF69B4?style=for-the-badge&logo=pino&logoColor=white)](https://getpino.io/)                                                                                                               | Extremely fast Node.js logger.                                                  |
| **Utilities**  | [![Dotenv](https://img.shields.io/badge/Dotenv-FFE800?style=for-the-badge&logo=dotenv&logoColor=black)](https://github.com/motdotla/dotenv)                                                                                           | Loads environment variables from a `.env` file.                                 |
|                | [![Helmet](https://img.shields.io/badge/Helmet-F0E68C?style=for-the-badge&logo=helmet&logoColor=black)](https://helmetjs.github.io/)                                                                                                 | Secures Express apps by setting various HTTP headers.                           |
| **Testing**    | [![Vitest](https://img.shields.io/badge/Vitest-6E9AF5?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)                                                                                                           | Fast and modern unit testing framework.                                         |

## License
This project is licensed under the ISC License.

## Author Info
Developed with passion by:

**Samuel Tuoyo**
*   LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourusername)
*   Twitter: [@yourtwitterhandle](https://twitter.com/yourtwitterhandle)

---

[![Maintained with Love](https://img.shields.io/badge/Maintained%20with-Love%E2%9D%A4-red)](https://github.com/samueltuoyo15/Vtu-Backend)
[![Build Status](https://img.shields.io/github/workflow/status/samueltuoyo15/Vtu-Backend/Node.js%20CI?label=build&style=flat-square)](https://github.com/samueltuoyo15/Vtu-Backend/actions/workflows/node.js.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)