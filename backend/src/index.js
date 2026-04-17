import { app } from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB()
.then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.error(`Failed to connect to the database: ${error.message}`);
})
.finally(() => {
    console.log("Database connection attempt completed.");
});

