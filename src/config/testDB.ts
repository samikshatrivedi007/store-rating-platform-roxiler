// testDB.ts
import { db } from './db';

db.query('SELECT 1', (error, results) => {
    if (error) {
        console.error('❌ Database connection failed:', error);
    } else {
        console.log('✅ Database connected successfully!', results);
    }
});
