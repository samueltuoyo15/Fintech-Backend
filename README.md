# VTU Backend Service: Seamless Digital Transactions 🌐

This project is a robust and secure backend service designed to power a Virtual Top-Up (VTU) platform. It facilitates a range of digital transactions including data subscriptions, airtime top-ups, electricity bill payments, and cable TV subscriptions. Built with Node.js and Express.js, it emphasizes clean architecture, secure authentication, and resilient database connectivity, making it a reliable foundation for any digital utility service.

---

## 🚀 Getting Started

Follow these steps to get a local copy of the project up and running on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   MongoDB (local instance or a cloud-hosted one like MongoDB Atlas)
*   Git

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Minister-Isaac/Vtu-Backend.git
    ```
2.  **Navigate to the Project Directory**:
    ```bash
    cd Vtu-Backend
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Configure Environment Variables**:
    Create a `.env` file in the root of the project and add the following variables. Replace the placeholder values with your actual credentials and settings.
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET_KEY=your_strong_jwt_secret
    EXTERNAL_BACKEND_DOMAIN=https://sandbox.vtpass.com/api # Example for an external API
    EXTERNAL_BACKEND_API_KEY=your_external_api_token
    NODE_ENV=development # or production
    ```
    *   `PORT`: The port on which your server will run.
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET_KEY`: A secret key for signing and verifying JSON Web Tokens.
    *   `EXTERNAL_BACKEND_DOMAIN`: The base URL of the external VTU service provider (e.g., VTPass).
    *   `EXTERNAL_BACKEND_API_KEY`: Your API key for authenticating with the external service.
    *   `NODE_ENV`: Set to `development` for local development or `production` for deployment.
5.  **Start the Server**:
    To start the server in development mode with `nodemon` (auto-reloads on file changes):
    ```bash
    npm run dev
    ```
    To start the server in production mode:
    ```bash
    npm start
    ```
    The server will connect to MongoDB and start listening on the specified `PORT`. You should see a log message indicating the server is running.

---

## 💡 Usage

This API provides a set of RESTful endpoints to manage users and facilitate various digital transactions.

### Authentication Endpoints

*   **Register User**: Create a new user account.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/auth/register`
    *   **Body**:
        ```json
        {
          "full_name": "John Doe",
          "username": "johndoe",
          "email": "john.doe@example.com",
          "phone": "08012345678",
          "address": "123 Main St, Anytown",
          "password": "StrongPassword123!",
          "referral_username": "referrer_user" (optional)
        }
        ```
*   **Login User**: Authenticate and receive `accessToken` and `refreshToken` cookies.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/auth/login`
    *   **Body**:
        ```json
        {
          "username": "johndoe",
          "password": "StrongPassword123!"
        }
        ```
*   **Logout User**: Invalidate access and refresh tokens.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/auth/logout`
    *   **Headers**: Requires `Authorization: Bearer <accessToken>` or `accessToken` cookie.

*   **Get User Details**: Get user details, theres no need to save it to localstorage, just call this endpoint everytime u need ur data.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/me`
    *   **Headers**: Requires `Authorization: Bearer <accessToken>` or `accessToken` cookie.

### Transaction Endpoints (Authenticated)

All transaction endpoints require an authenticated user. Ensure you include the `accessToken` in the `Authorization` header (`Bearer <token>`) or as a cookie after logging in.

#### Data Services

*   **Buy Data Subscription**: Purchase a data plan for a specified network and phone number.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/subscribe/data`
    *   **Body**:
        ```json
        {
          "network": 1,
          "phone": "08012345678",
          "plan": 500,
          "ported_number": true
        }
        ```
*   **Get All Data Transactions**: Retrieve a history of all data transactions.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/data-history`
*   **Query Data Transaction**: Check the status of a specific data transaction.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/query-data/:transactionId`

#### Airtime Services

*   **Buy Airtime Subscription**: Top-up airtime for a specified network and phone number.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/subscribe/airtime`
    *   **Body**:
        ```json
        {
          "network": 3,
          "phone": "07012345678",
          "amount": 1000,
          "airtime_type": "VTU",
          "ported_number": true
        }
        ```
*   **Query Airtime Transaction**: Check the status of a specific airtime transaction.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/query-airtime/:transactionId`

#### Electricity Services

*   **Pay Electricity Bills**: Pay electricity bills for a given disco and meter.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/subscribe/electricity`
    *   **Body**:
        ```json
        {
          "disco_name": "Ikeja Disco",
          "amount": 5000,
          "meter_number": 12345678901,
          "meter_type": "Prepaid",
          "userId": "your_user_id"
        }
        ```
*   **Query Electricity Bill**: Check the status of a specific electricity bill payment.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/query-electricity/:transactionId` *(Note: Based on controller, actual route in code is `/query-electricity-bill` without `transactionId`, but for querying by ID, a parameter is logical.)*
*   **Validate Meter Number**: Verify a meter number before payment.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/validate-meter?meternumber=12345678901&disconame=Ikeja%20Disco&metertype=Prepaid`

#### Cable TV Services

*   **Buy Cable Subscription**: Subscribe to a cable TV plan.
    *   **Method**: `POST`
    *   **URL**: `/api/v1/subscribe/cable`
    *   **Body**:
        ```json
        {
          "cable_name": "Dstv",
          "cable_plan": "Premium",
          "smart_card_number": 987654321,
          "userId": "your_user_id",
          "amount": 15000
        }
        ```
*   **Query Cable Subscription**: Check the status of a specific cable subscription.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/query-cable/:transactionId` *(Note: Based on controller, actual route in code is `/query-electricity-bill` without `transactionId`, but for querying by ID, a parameter is logical.)*
*   **Validate UIC (Smart Card)**: Verify a smart card number before subscription.
    *   **Method**: `GET`
    *   **URL**: `/api/v1/subscribe/validate-uic?smart_card_number=987654321&cable_name=Dstv`


### Plans and Lists

You can retrieve lists of available plans and networks without authentication:

*   **Get Data Plans**: `GET http://localhost:5000/api/v1/plans/data-plans`
*   **Get Networks**: `GET http://localhost:5000/api/v1/plans/networks`
*   **Get Cable Providers**: `GET http://localhost:5000/api/v1/plans/cables`
*   **Get Cable Plans**: `GET http://localhost:5000/api/v1/plans/cable-plans`
*   **Get Electricity Discos**: `GET http://localhost:5000/api/v1/plans/discos`

---

## ✨ Features

This backend service is packed with features to provide a comprehensive and secure VTU experience:

*   **User Authentication & Authorization**: Secure user registration, login, and logout with Argon2 hashing for passwords and JWTs for token-based authentication.
*   **Account Management**: Manages user wallets, tracks funding, and calculates referral bonuses, providing a holistic view of user finances.
*   **Diverse Transaction Services**: Enables seamless purchase of data, airtime, electricity, and cable TV subscriptions through integration with external VTU APIs.
*   **Transaction Tracking**: Records all user transactions with detailed metadata and unique references, ensuring traceability.
*   **Robust Input Validation**: Utilizes Joi schemas to rigorously validate all incoming request bodies, preventing malformed data and enhancing security.
*   **Centralized Logging**: Implements Pino for structured and efficient logging, offering clear insights into server operations and aiding in debugging.
*   **Error Handling**: Comprehensive error handling middleware ensures graceful responses and prevents application crashes from unhandled exceptions.
*   **Environment Configuration**: Manages sensitive information and application settings using `.env` files for secure and flexible deployment across different environments.
*   **Database Resilience**: Features connection retry logic for MongoDB, ensuring the application can recover from transient database connectivity issues.

---

## 🛠️ Technologies Used

| Technology         | Description                                     | Link                                            |
| :----------------- | :---------------------------------------------- | :---------------------------------------------- |
| **Node.js**        | JavaScript runtime for backend development      | [nodejs.org](https://nodejs.org/)               |
| **Express.js**     | Fast, unopinionated, minimalist web framework   | [expressjs.com](https://expressjs.com/)         |
| **MongoDB**        | NoSQL document database                         | [mongodb.com](https://www.mongodb.com/)         |
| **Mongoose**       | MongoDB object modeling for Node.js             | [mongoosejs.com](https://mongoosejs.com/)       |
| **JSON Web Tokens (JWT)** | Securely transmit information between parties | [jwt.io](https://jwt.io/)                       |
| **Argon2**         | State-of-the-art password hashing function      | [argon2.org](https://argon2.org/)               |
| **Joi**            | Schema description language and validator       | [joi.dev](https://joi.dev/)                     |
| **Pino**           | Extremely fast Node.js logger                   | [getpino.io](https://getpino.io/)               |
| **Axios**          | Promise-based HTTP client                       | [axios-http.com](https://axios-http.com/)       |
| **Dotenv**         | Loads environment variables from a `.env` file  | [npmjs.com/package/dotenv](https://www.npmjs.com/package/dotenv) |
| **Helmet**         | Secures Express apps by setting various HTTP headers | [helmetjs.info](https://helmetjs.info/)      |
| **Cookie-parser**  | Parse Cookie header and populate `req.cookies` | [npmjs.com/package/cookie-parser](https://www.npmjs.com/package/cookie-parser) |
| **CORS**           | Provides a Connect/Express middleware that can be used to enable CORS with various options | [npmjs.com/package/cors](https://www.npmjs.com/package/cors) |
| **Async-retry**    | Retries an async function until it succeeds     | [npmjs.com/package/async-retry](https://www.npmjs.com/package/async-retry) |

---

## 🤝 Contributing

We welcome contributions from the community! If you're looking to contribute, please follow these guidelines:

*   ✨ **Fork the repository** and clone it to your local machine.
*   🌿 Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
*   💻 Make your changes, ensuring they adhere to the project's coding style.
*   🧪 Write unit and/or integration tests for your changes where applicable.
*   ✅ Commit your changes with a clear and concise message.
*   ⬆️ Push your branch to your forked repository.
*   🚀 Open a Pull Request (PR) to the `main` branch of this repository. Provide a detailed description of your changes and why they are necessary.

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author Info

*   **Isaac Okoro**
    *   GitHub: [@Minister-Isaac](https://github.com/Minister-Isaac)
    *   LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/yourusername/)
    *   Twitter: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle)

---

## Badges

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.x%2B-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Dependencies](https://img.shields.io/david/Minister-Isaac/Vtu-Backend.svg)](https://david-dm.org/Minister-Isaac/Vtu-Backend)
[![Dev Dependencies](https://img.shields.io/david/dev/Minister-Isaac/Vtu-Backend.svg)](https://david-dm.org/Minister-Isaac/Vtu-Backend?type=dev)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)