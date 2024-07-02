
# RoomReady

- Live Site URL: [RoomReady](https://eleventh-a-roomready.web.app)

- Tools & Technology
   - Node.js
   - MongoDB
   - Express.js
   - JSON Web Token
   - Stripe Payment Method

## How to run locally

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Stripe account for payment integration

### Running the Frontend Locally

- Visit client repository: [Client Repository on GitHub](https://github.com/shahadathhs/room-ready-client)

### Running the Backend Locally

1. **Clone the backend repository**

```bash
git clone https://github.com/shahadathhs/room-ready-server
```

2. **Navigate to the project directory**

```bash
cd room-ready-server
```

3. **Install dependencies**

```bash
npm install
```

4. **Create a `.env` file in the root directory and add the following environment variables:**

```env
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password

ACCESS_TOKEN_SECRET=your_access_token_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
```

5. **Start the backend server**

```bash
npm start
```
or

```bash
node index.js
```
or

```bash
nodemon index.js
```

## Contributing

If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## Contact

For any inquiries, please reach out to Shahadath Hossen Sajib at <shahadathhossensajib732@gmail.com>.

