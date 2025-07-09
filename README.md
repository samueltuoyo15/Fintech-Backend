# **VTU Backend Service** ⚡

This project powers a robust and secure backend API for a Virtual Top-Up (VTU) platform, enabling users to seamlessly perform various digital transactions. From purchasing airtime and data to paying utility bills, this service provides a comprehensive solution for managing virtual transactions with ease. Built with Node.js and Express, it integrates with external payment gateways and service providers, ensuring a reliable and efficient experience.

## 🚀 Installation

To get this project up and running on your local machine, follow these steps:

### ⚙️ Prerequisites

Make sure you have the following installed:
*   Node.js (LTS version recommended)
*   MongoDB

### 📦 Clone the Repository

Start by cloning the repository to your local machine:

```bash
git clone https://github.com/Minister-Isaac/Vtu-Backend.git
cd Vtu-Backend
```

### 🛠️ Install Dependencies

Navigate into the project directory and install the required npm packages:

```bash
npm install
# or
yarn install
```

### 🔑 Environment Variables

Create a `.env` file in the root directory of the project and populate it with your environment-specific variables. This project uses:

*   `PORT`: The port number the server will listen on (e.g., `5000`).
*   `MONGODB_URI`: Your MongoDB connection string.
*   `JWT_SECRET_KEY`: A strong secret key for JWT authentication.
*   `MONNIFY_API_KEY`: Your Monnify API key for payment processing.
*   `MONNIFY_SECRET_KEY`: Your Monnify Secret Key.
*   `MONNIFY_CONTRACT_CODE`: Your Monnify Contract Code.
*   `EXTERNAL_BACKEND_DOMAIN`: The base URL of the external backend service for VTU and bill payments.
*   `EXTERNAL_BACKEND_API_KEY`: The API key for the external backend service.
*   `FRONTEND_DOMAIN`: The URL of your frontend application (for payment redirects).
*   `NODE_ENV`: Set to `development` or `production`.

Example `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vtu_db
JWT_SECRET_KEY=your_very_secret_jwt_key
MONNIFY_API_KEY=mk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MONNIFY_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MONNIFY_CONTRACT_CODE=your_contract_code
EXTERNAL_BACKEND_DOMAIN=https://your-external-vtu-api.com/api
EXTERNAL_BACKEND_API_KEY=your_external_api_key
FRONTEND_DOMAIN=http://localhost:3000
NODE_ENV=development
```

### ▶️ Run the Server

Once the dependencies are installed and the environment variables are set, you can start the server:

For development with hot-reloading:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on the port specified in your `.env` file. You should see a message in the console indicating the server is running and connected to MongoDB.

## 💡 Usage

This API provides a suite of endpoints for user authentication, account management, and virtual transactions. Below are some common usage flows:

### User Authentication

*   **Register a new user:**
    `POST /api/v1/auth/register`
    Body: `{ "full_name": "...", "username": "...", "email": "...", "phone": "...", "address": "...", "password": "...", "referral_username": "..." }`
*   **Log in a user:**
    `POST /api/v1/auth/login`
    Body: `{ "username": "...", "password": "..." }`
    Successful login will set `accessToken` and `refreshToken` cookies and return an `accessToken` in the response body. This token is crucial for authenticating subsequent requests.
*   **Log out a user:**
    `POST /api/v1/auth/logout`
    Requires authentication. Clears access and refresh tokens.

### Account Funding

To fund a user's wallet:

*   **Initialize a funding transaction:**
    `POST /api/v1/payment/fund-wallet`
    Requires authentication.
    Body: `{ "email": "user@example.com", "amount": 5000 }`
    This will return a `checkoutUrl` from Monnify where the user can complete the payment.

### Virtual Top-Up and Bill Payments

All transaction endpoints require authentication via the `accessToken` (either in `Authorization` header as `Bearer Token` or as an `httpOnly` cookie).

*   **Buy Data Subscription:**
    `POST /api/v1/subscribe/data`
    Body: `{ "network": 1, "phone": "08012345678", "plan": 358, "ported_number": false }`
*   **Buy Airtime Subscription:**
    `POST /api/v1/subscribe/airtime`
    Body: `{ "network": 1, "phone": "08012345678", "amount": 500, "airtime_type": "VTU", "ported_number": false }`
*   **Pay Electricity Bills:**
    `POST /api/v1/subscribe/electricity`
    Body: `{ "disco_name": "Ikeja Disco", "amount": 5000, "meter_number": 12345678901, "meter_type": "Prepaid" }`
*   **Buy Cable Subscription:**
    `POST /api/v1/subscribe/cable`
    Body: `{ "cable_name": "GOtv", "cable_plan": "GOtv Max", "smart_card_number": 12345678901, "amount": 8500 }`

### Transaction History & Queries

*   **Get all data transactions for a user:**
    `GET /api/v1/subscribe/data-history`
    Requires authentication.
*   **Query a specific data transaction:**
    `GET /api/v1/subscribe/query-data/:transactionId`
    Requires authentication.
*   **Query a specific airtime transaction:**
    `GET /api/v1/subscribe/query-airtime/:transactionId`
    Requires authentication.
*   **Query a specific electricity bill:**
    `GET /api/v1/subscribe/query-electricity-bill/:transactionId`
    Requires authentication.
*   **Query a specific cable subscription:**
    `GET /api/v1/subscribe/query-cable-subscription/:transactionId`
    Requires authentication.

### Utility Endpoints

*   **Validate Cable TV Smart Card:**
    `GET /api/v1/subscribe/validate-uic?smart_card_number=...&cable_name=...`
    Requires authentication.
*   **Validate Electricity Meter:**
    `GET /api/v1/subscribe/validate-meter?meternumber=...&disconame=...&metertype=...`
    Requires authentication.
*   **Get available data plans:**
    `GET /api/v1/plans/data-plans`
*   **Get available network providers:**
    `GET /api/v1/plans/networks`
*   **Get available cable providers:**
    `GET /api/v1/plans/cables`
*   **Get available cable plans:**
    `GET /api/v1/plans/cable-plans`
*   **Get available electricity distribution companies (discos):**
    `GET /api/v1/plans/discos`

## ✨ Features

*   **User Authentication & Authorization**: Secure user registration, login, and logout using JWT tokens and refresh tokens. Argon2 for robust password hashing.
*   **Account Management**: Dedicated user accounts with wallet balance, total funding, and referral tracking.
*   **Virtual Top-Up Services**:
    *   **Data Subscription**: Purchase data plans for various networks (MTN, GLO, 9MOBILE, AIRTEL).
    *   **Airtime Purchase**: Top up airtime across different networks.
*   **Bill Payment Services**:
    *   **Electricity Bills**: Pay for electricity (prepaid/postpaid) across different distribution companies.
    *   **Cable TV Subscription**: Subscribe to popular cable TV services (GOtv, Dstv, Startimes).
*   **Third-Party API Integration**: Seamless integration with external APIs for Monnify payment processing and VTU/bill payment services.
*   **Transaction Management**: Comprehensive tracking of all user transactions with detailed metadata.
*   **Input Validation**: Robust request body validation using Joi schemas to ensure data integrity and security.
*   **Error Handling**: Centralized error handling middleware for consistent and informative error responses.
*   **Logging**: Utilizes Pino for structured and efficient logging, aiding in debugging and monitoring.
*   **Security Best Practices**: Implementation of `helmet` for HTTP header security and `cors` for controlled cross-origin resource sharing.
*   **Database Management**: MongoDB integration with Mongoose for efficient data modeling and persistence, including connection retry logic for resilience.

## 💻 Technologies Used

| Technology | Description | Link |
| :--------- | :---------- | :--- |
| Node.js | JavaScript runtime environment | [https://nodejs.org/](https://nodejs.org/) |
| Express.js | Fast, unopinionated, minimalist web framework for Node.js | [https://expressjs.com/](https://expressjs.com/) |
| MongoDB | NoSQL database | [https://www.mongodb.com/](https://www.mongodb.com/) |
| Mongoose | MongoDB object data modeling (ODM) for Node.js | [https://mongoosejs.com/](https://mongoosejs.com/) |
| JSON Web Tokens (JWT) | Compact, URL-safe means of representing claims to be transferred between two parties | [https://jwt.io/](https://jwt.io/) |
| Argon2 | Password hashing function | [https://www.npmjs.com/package/argon2](https://www.npmjs.com/package/argon2) |
| Joi | Powerful schema description language and data validator for JavaScript | [https://joi.dev/](https://joi.dev/) |
| Axios | Promise-based HTTP client for the browser and Node.js | [https://axios-http.com/](https://axios-http.com/) |
| Pino | Extremely fast, Node.js logger | [https://getpino.io/](https://getpino.io/) |
| Dotenv | Loads environment variables from a `.env` file | [https://www.npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| Cookie-Parser | Parse Cookie header and populate `req.cookies` | [https://www.npmjs.com/package/cookie-parser](https://www.npmjs.com/package/cookie-parser) |
| CORS | Node.js CORS middleware | [https://www.npmjs.com/package/cors](https://www.npmjs.com/package/cors) |
| Helmet | Helps secure Express apps by setting various HTTP headers | [https://helmetjs.github.io/](https://helmetjs.github.io/) |
| Vercel | Cloud platform for static sites and serverless functions | [https://vercel.com/](https://vercel.com/) |
| Monnify API | Payment gateway for online transactions | [https://monnify.com/](https://monnify.com/) |

## 🤝 Contributing

Contributions are always welcome! If you'd like to contribute to this project, please follow these guidelines:

*   ✨ **Fork the repository**: Create your own fork of the project.
*   🌿 **Create a new branch**: Branch out from `main` for your feature or bug fix (e.g., `feature/add-payment-method`, `bugfix/fix-auth-issue`).
*   💻 **Make your changes**: Write clear, concise code following the existing style.
*   🧪 **Write tests**: If applicable, ensure your changes are covered by tests.
*   📝 **Update documentation**: Reflect any changes in functionality or API endpoints in the README or relevant documentation.
*   ⬆️ **Commit your changes**: Write descriptive commit messages.
*   🚀 **Push to your branch**: Push your changes to your forked repository.
*   🗣️ **Open a Pull Request**: Submit a pull request to the `main` branch of this repository, clearly describing your changes and their purpose.

## 📜 License

This project is licensed under the ISC License.

## ✍️ Author Info

*   **Your Name**
    *   GitHub: [https://github.com/Minister-Isaac](https://github.com/Minister-Isaac)
    *   LinkedIn: [https://linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
    *   Twitter: [https://twitter.com/yourhandle](https://twitter.com/yourhandle)

---

[![Node.js](https://img.shields.io/badge/Node.js-16.x-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.x-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.x-orange?logo=mongoose&logoColor=white)](https://mongoosejs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)