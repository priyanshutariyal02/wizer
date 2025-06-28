require('dotenv').config();
const { neon } = require("@neondatabase/serverless");

async function setupDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set to a valid NeonDB/Postgres connection string.');
    }
    const sql = neon(process.env.DATABASE_URL);
    
    console.log("Setting up database tables...");

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        clerk_id VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Users table created");

    // Create drivers table
    await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        profile_image_url TEXT,
        car_image_url TEXT,
        car_seats INTEGER DEFAULT 4,
        rating DECIMAL(3,2) DEFAULT 4.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Drivers table created");

    // Create rides table
    await sql`
      CREATE TABLE IF NOT EXISTS rides (
        ride_id SERIAL PRIMARY KEY,
        origin_address TEXT NOT NULL,
        destination_address TEXT NOT NULL,
        origin_latitude DECIMAL(10, 8) NOT NULL,
        origin_longitude DECIMAL(11, 8) NOT NULL,
        destination_latitude DECIMAL(10, 8) NOT NULL,
        destination_longitude DECIMAL(11, 8) NOT NULL,
        ride_time INTEGER NOT NULL,
        fare_price DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'pending',
        driver_id INTEGER REFERENCES drivers(id),
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Rides table created");

    // Insert some sample drivers
    await sql`
      INSERT INTO drivers (first_name, last_name, profile_image_url, car_image_url, car_seats, rating) 
      VALUES 
        ('John', 'Doe', 'https://example.com/john.jpg', 'https://example.com/car1.jpg', 4, 4.8),
        ('Jane', 'Smith', 'https://example.com/jane.jpg', 'https://example.com/car2.jpg', 4, 4.9),
        ('Mike', 'Johnson', 'https://example.com/mike.jpg', 'https://example.com/car3.jpg', 6, 4.7)
      ON CONFLICT DO NOTHING
    `;
    console.log("✅ Sample drivers inserted");

    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
  }
}

setupDatabase(); 