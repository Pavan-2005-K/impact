
-- ==========================================
-- IMPACTLINK DATABASE - INITIAL SCHEMA
-- ==========================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('VOLUNTEER', 'ORGANIZATION', 'ADMIN')),
    account_status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (account_status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VOLUNTEER PROFILES TABLE
CREATE TABLE IF NOT EXISTS volunteer_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id)
        ON DELETE CASCADE,
    occupation VARCHAR(30)
        CHECK (occupation IN ('STUDENT', 'EMPLOYEE', 'OTHER')),
    bio TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    user_id INTEGER PRIMARY KEY REFERENCES users(id)
        ON DELETE CASCADE,
    organization_name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(100),
    organization_type VARCHAR(100),
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    verification_document_url TEXT,
    approval_status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (
            approval_status IN (
                'PENDING',
                'APPROVED',
                'REJECTED'
            )
        ),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. VOLUNTEER SKILLS TABLE
CREATE TABLE IF NOT EXISTS volunteer_skills (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER NOT NULL
        REFERENCES volunteer_profiles(user_id)
        ON DELETE CASCADE,
    skill_id INTEGER NOT NULL
        REFERENCES skills(id)
        ON DELETE CASCADE,
    UNIQUE (volunteer_id, skill_id)
);

-- 6. VOLUNTEER AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS volunteer_availability (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER NOT NULL
        REFERENCES volunteer_profiles(user_id)
        ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL
        CHECK (
            day_of_week IN (
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY'
            )
        ),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CHECK (end_time > start_time),
    UNIQUE (volunteer_id, day_of_week, start_time, end_time)
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

CREATE INDEX IF NOT EXISTS idx_organization_approval
ON organizations(approval_status);

CREATE INDEX IF NOT EXISTS idx_volunteer_city
ON volunteer_profiles(city);

-- ==========================================
-- INITIAL SKILLS
-- ==========================================

INSERT INTO skills (skill_name, category)
VALUES
    ('Cleaning', 'Environmental'),
    ('Teaching', 'Education'),
    ('First Aid', 'Healthcare'),
    ('Medical Assistance', 'Healthcare'),
    ('Cooking', 'Community'),
    ('Event Management', 'Management'),
    ('Communication', 'General'),
    ('Teamwork', 'General'),
    ('Photography', 'Creative'),
    ('Driving', 'Transport'),
    ('Gardening', 'Environmental'),
    ('Technical Support', 'Technology')
ON CONFLICT (skill_name) DO NOTHING;
