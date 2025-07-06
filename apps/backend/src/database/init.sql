-- Create database schema
CREATE TABLE IF NOT EXISTS folders (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(36) REFERENCES folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(36) NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_parent_id ON files(parent_id);

-- Insert sample folder structure
INSERT INTO folders (id, name, parent_id, path, created_at, updated_at) VALUES
('1', 'Documents', NULL, '/Documents', NOW(), NOW()),
('2', 'Pictures', NULL, '/Pictures', NOW(), NOW()),
('3', 'Music', NULL, '/Music', NOW(), NOW()),
('4', 'Work', '1', '/Documents/Work', NOW(), NOW()),
('5', 'Personal', '1', '/Documents/Personal', NOW(), NOW()),
('6', 'Projects', '4', '/Documents/Work/Projects', NOW(), NOW()),
('7', 'Reports', '4', '/Documents/Work/Reports', NOW(), NOW()),
('8', 'Vacation', '2', '/Pictures/Vacation', NOW(), NOW()),
('9', 'Family', '2', '/Pictures/Family', NOW(), NOW()),
('10', 'Rock', '3', '/Music/Rock', NOW(), NOW()),
('11', 'Classical', '3', '/Music/Classical', NOW(), NOW()),
('12', 'Project A', '6', '/Documents/Work/Projects/Project A', NOW(), NOW()),
('13', 'Project B', '6', '/Documents/Work/Projects/Project B', NOW(), NOW()),
('14', '2023', '8', '/Pictures/Vacation/2023', NOW(), NOW()),
('15', '2024', '8', '/Pictures/Vacation/2024', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample files
INSERT INTO files (id, name, parent_id, path, size, created_at, updated_at) VALUES
('f1', 'resume.pdf', '4', '/Documents/Work/resume.pdf', 1024, NOW(), NOW()),
('f2', 'notes.txt', '5', '/Documents/Personal/notes.txt', 512, NOW(), NOW()),
('f3', 'beach.jpg', '14', '/Pictures/Vacation/2023/beach.jpg', 2048, NOW(), NOW()),
('f4', 'song.mp3', '10', '/Music/Rock/song.mp3', 4096, NOW(), NOW())
ON CONFLICT (id) DO NOTHING; 