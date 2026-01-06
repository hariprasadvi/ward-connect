-- Waste Management System - Seed Data
-- This file contains sample data for testing
-- Run this AFTER the backend has created the tables

-- Note: The backend will auto-create tables when you run npm start
-- Only run this file if you want sample data for testing

-- Sample Admin User (password: admin123)
-- Password hash generated with bcryptjs for 'admin123'
INSERT INTO "Users" (email, password, name, role, phone, address, "createdAt", "updatedAt")
VALUES (
  'admin@waste.com',
  '$2a$10$rKZN8K8qJQxZ5Y5Y5Y5Y5eO5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
  'System Admin',
  'admin',
  '1234567890',
  'Admin Office, City Hall',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample Regular Users (password: user123)
INSERT INTO "Users" (email, password, name, role, phone, address, "houseNumber", "createdAt", "updatedAt")
VALUES 
  (
    'john@example.com',
    '$2a$10$rKZN8K8qJQxZ5Y5Y5Y5Y5eO5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
    'John Doe',
    'user',
    '9876543210',
    '123 Main Street, City',
    '1',
    NOW(),
    NOW()
  ),
  (
    'jane@example.com',
    '$2a$10$rKZN8K8qJQxZ5Y5Y5Y5Y5eO5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
    'Jane Smith',
    'user',
    '9876543211',
    '125 Main Street, City',
    '2',
    NOW(),
    NOW()
  ),
  (
    'bob@example.com',
    '$2a$10$rKZN8K8qJQxZ5Y5Y5Y5Y5eO5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y',
    'Bob Johnson',
    'user',
    '9876543212',
    '127 Main Street, City',
    '4',
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

-- Note: To use these accounts, you'll need to:
-- 1. Either use the hashed password above (which won't work as-is)
-- 2. OR register through the frontend and then update the role to 'admin' manually
-- 3. OR generate proper bcrypt hashes for your desired passwords

-- Recommended approach:
-- 1. Register a user through the frontend (e.g., admin@waste.com)
-- 2. Then run: UPDATE "Users" SET role = 'admin' WHERE email = 'admin@waste.com';

-- Sample Pickups (optional - for testing)
-- Note: Replace userId values with actual user IDs from your Users table

-- Sample Complaints (optional - for testing)
-- Note: Replace userId values with actual user IDs from your Users table

-- To get user IDs after registration:
-- SELECT id, email, name, role FROM "Users";
