import 'dotenv/config';

export const PORT = process.env.PORT || 5555;
export const mongoDBURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
