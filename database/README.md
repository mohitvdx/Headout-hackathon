# Course Selling App

## Description

This is a course selling application that allows admins to create courses and users to browse and purchase courses. It uses MongoDB for data storage and requires username and password in headers for authenticated requests.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Jest for testing
- Supertest for API testing
- Babel for module transformation
- TypeScript with ts-node for development

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MongoDB:
   - Install MongoDB on your system if you haven't already.
   - Create a MongoDB database and note down the connection URL.

4. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```plaintext
   MONGODB_URI=your-mongodb-connection-url
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Run tests: (Not implemented yet)
   ```bash
   npm test
   ```

## API Endpoints

### Admin Routes:

- **POST /admin/signup**
  - Description: Creates a new admin account.
  - Input Body: { username: 'admin', password: 'pass' }
  - Output: { message: 'Admin created successfully' }

- **POST /admin/courses**
  - Description: Creates a new course.
  - Input: Headers: { 'username': 'username', 'password': 'password' }, Body: { title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com' }
  - Output: { message: 'Course created successfully', courseId: "new course id" }

- **GET /admin/courses**
  - Description: Returns all the courses.
  - Input: Headers: { 'username': 'username', 'password': 'password' }
  - Output: { courses: [ { id: 1, title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }

### User Routes:

- **POST /users/signup**
  - Description: Creates a new user account.
  - Input: { username: 'user', password: 'pass' }
  - Output: { message: 'User created successfully' }

- **GET /users/courses**
  - Description: Lists all the courses.
  - Input: Headers: { 'username': 'username', 'password': 'password' }
  - Output: { courses: [ { id: 1, title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }

- **POST /users/courses/:courseId**
  - Description: Purchases a course. courseId in the URL path should be replaced with the ID of the course to be purchased.
  - Input: Headers: { 'username': 'username', 'password': 'password' }
  - Output: { message: 'Course purchased successfully' }

- **GET /users/purchasedCourses**
  - Description: Lists all the courses purchased by the user.
  - Input: Headers: { 'username': 'username', 'password': 'password' }
  - Output: { purchasedCourses: [ { id: 1, title: 'course title', description: 'course description', price: 100, imageLink: 'https://linktoimage.com', published: true }, ... ] }
