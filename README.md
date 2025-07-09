# **VTU Backend API**

This robust backend powers a Virtual Top-Up (VTU) platform, enabling seamless transactions for data, airtime, electricity, and cable TV subscriptions 🚀. Built with Node.js and Express.js, it features secure user authentication, comprehensive wallet management, and real-time integration with external payment and VTU service providers. Designed for scalability and reliability, this API ensures a smooth and efficient experience for users managing their digital services.

---

## ⚙️ Installation

To get this project up and running on your local machine, follow these steps:

### 1. Clone the Repository

Begin by cloning the project repository to your local system:

```bash
git clone https://github.com/Minister-Isaac/Vtu-Backend.git
cd Vtu-Backend
```

### 2. Install Dependencies

Navigate into the cloned directory and install the necessary Node.js packages:

```bash
npm install
# or if you prefer yarn
# yarn install
```

### 3. Environment Variables Setup

Create a `.env` file in the root of the project and populate it with your environment variables. An example structure is provided below. Ensure you replace the placeholder values with your actual credentials and configurations.

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FRONTEND_DOMAIN=http://localhost:3000 # Or your frontend URL
EXTERNAL_BACKEND_DOMAIN=https://api.your-external-vtu-service.com # Example: Your VTU provider's API URL
EXTERNAL_BACKEND_API_KEY=your_external_vtu_api_key
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code
```

### 4. Run the Server

Once the dependencies are installed and environment variables are set, you can start the server:

```bash
npm run dev
# For production:
# npm start
```

The API will typically run on `http://localhost:5000` (or the `PORT` you configured).

---

## 🚀 Usage

This API provides a comprehensive set of endpoints for managing user accounts and performing various VTU transactions.

### Authentication Flow:

1.  **Register**: Send a `POST` request to `/api/v1/auth/register` with user details (full_name, username, email, phone, address, password, referral_username).
    *   An email verification link will be sent to the registered email.
2.  **Verify Email**: Click the link received in the email, which directs to `/api/v1/auth/verify-email?token=...`. This activates the user account.
3.  **Login**: Send a `POST` request to `/api/v1/auth/login` with `username` and `password`.
    *   Upon successful login, `accessToken` and `refreshToken` cookies are set. The `accessToken` is also returned in the response.
4.  **Refresh Token**: If your `accessToken` expires, send a `POST` request to `/api/v1/auth/refresh-token` to obtain a new `accessToken` using the `refreshToken` cookie.
5.  **Logout**: Send a `POST` request to `/api/v1/auth/logout` to clear all tokens and log out.

### Wallet Funding and Transactions:

Once authenticated, users can fund their wallets and perform various transactions. All transaction endpoints require an `Authorization` header with the `Bearer accessToken`.

1.  **Fund Wallet**:
    *   `POST /api/v1/payment/fund-wallet`: Initializes a payment transaction via Monnify. Provide `email` and `amount` in the request body. The response will include a `checkoutUrl` to complete the payment.
2.  **Verify Payment**:
    *   `POST /api/v1/payment/verify-payment`: This is a webhook endpoint for Monnify to send transaction verification callbacks. It processes successful transactions and updates the user's wallet.
3.  **Buy Data Subscription**:
    *   `POST /api/v1/subscribe/data`: Purchase data plans. Requires `network`, `phone`, `plan`, and `ported_number`.
4.  **Buy Airtime Subscription**:
    *   `POST /api/v1/subscribe/airtime`: Purchase airtime. Requires `network`, `phone`, `amount`, `airtime_type`, and `ported_number`.
5.  **Pay Electricity Bills**:
    *   `POST /api/v1/subscribe/electricity`: Pay electricity bills. Requires `disco_name`, `amount`, `meter_number`, and `meter_type`.
6.  **Buy Cable Subscription**:
    *   `POST /api/v1/subscribe/cable`: Subscribe to cable TV plans. Requires `cable_name`, `cable_plan`, `smart_card_number`, and `amount`.

### Utilities and Queries:

*   **Get User Details**: `GET /api/v1/user/details` (requires authentication).
*   **Query Data Transaction**: `GET /api/v1/subscribe/query-data/:transactionId`.
*   **Query Airtime Transaction**: `GET /api/v1/subscribe/query-airtime/:transactionId`.
*   **Query Electricity Bill**: `GET /api/v1/subscribe/query-electricity-bill`.
*   **Validate UIC (Cable TV)**: `GET /api/v1/subscribe/validate-uic?smart_card_number={num}&cable_name={name}`.
*   **Validate Meter (Electricity)**: `GET /api/v1/subscribe/validate-meter?meternumber={num}&disconame={name}&metertype={type}`.

### Plan and Network Information:

*   **Get Data Plans**: `GET /api/v1/plans/data-plans`
*   **Get Networks**: `GET /api/v1/plans/networks`
*   **Get Cables**: `GET /api/v1/plans/cables`
*   **Get Cable Plans**: `GET /api/v1/plans/cable-plans`
*   **Get Discos (Electricity Providers)**: `GET /api/v1/plans/discos`

---

## ✨ Features

*   **User Authentication**: Secure user registration, login, email verification, and token refreshing using JWT and Argon2 for password hashing.
*   **Wallet Management**: Users have individual wallets for funding and transaction deductions.
*   **Virtual Top-Up Services**:
    *   **Data Subscription**: Purchase data plans across various networks.
    *   **Airtime Top-Up**: Recharge mobile airtime.
    *   **Electricity Bill Payments**: Pay electricity bills for different discos (Prepaid/Postpaid).
    *   **Cable TV Subscription**: Subscribe to popular cable TV packages.
*   **Transaction History**: Comprehensive logging and retrieval of all user transactions.
*   **External API Integration**: Seamless integration with Monnify for payments and another external VTU provider for service fulfillment.
*   **Robust Input Validation**: Utilizes Joi for thorough request body validation to ensure data integrity and security.
*   **Error Handling**: Centralized error handling middleware for consistent API responses.
*   **Logging**: Implemented Pino for efficient and structured logging, aiding in development and debugging.
*   **Referral System**: Basic referral tracking with bonus allocation to referrers.
*   **Scalable Architecture**: Modular design using controllers, services, middleware, and models for maintainability and scalability.

---

## 🛠️ Technologies Used

| Technology         | Description                                                                  | Link                                                |
| :----------------- | :--------------------------------------------------------------------------- | :-------------------------------------------------- |
| **Node.js**        | JavaScript runtime environment                                               | [nodejs.org](https://nodejs.org/)                   |
| **Express.js**     | Fast, unopinionated, minimalist web framework for Node.js                    | [expressjs.com](https://expressjs.com/)             |
| **MongoDB**        | NoSQL database for flexible data storage                                     | [mongodb.com](https://www.mongodb.com/)             |
| **Mongoose**       | MongoDB object modeling for Node.js                                          | [mongoosejs.com](https://mongoosejs.com/)           |
| **Joi**            | Powerful schema description language and data validator for JavaScript       | [joi.dev](https://joi.dev/)                         |
| **Argon2**         | Password hashing function for strong security                                | [github.com/P-H-C/phc-winner-argon2](https://github.com/P-H-C/phc-winner-argon2) |
| **JSON Web Token (JWT)** | Compact, URL-safe means of representing claims to be transferred between two parties | [jwt.io](https://jwt.io/)                           |
| **Pino**           | Extremely fast Node.js logger                                                | [getpino.io](https://getpino.io/)                   |
| **Nodemailer**     | Module for Node.js applications to send emails                               | [nodemailer.com](https://nodemailer.com/)           |
| **Axios**          | Promise-based HTTP client for the browser and Node.js                        | [axios-http.com](https://axios-http.com/)           |
| **Cors**           | Node.js middleware for enabling Cross-Origin Resource Sharing                | [www.npmjs.com/package/cors](https://www.npmjs.com/package/cors) |
| **Helmet**         | Secures Express apps by setting various HTTP headers                         | [helmetjs.info](https://helmetjs.info/)             |
| **Cookie-Parser**  | Parse Cookie header and populate `req.cookies`                               | [www.npmjs.com/package/cookie-parser](https://www.npmjs.com/package/cookie-parser) |
| **Dotenv**         | Loads environment variables from a `.env` file                               | [www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| **Nanoid**         | Tiny, secure, URL-friendly, unique string ID generator                       | [www.npmjs.com/package/nanoid](https://www.npmjs.com/package/nanoid) |
| **Async-Retry**    | Retries async functions with exponential backoff                             | [www.npmjs.com/package/async-retry](https://www.npmjs.com/package/async-retry) |

## 📜 License

This project is licensed under the MIT License.


[![Node.js Version](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
