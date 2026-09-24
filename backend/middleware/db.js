const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and files exist
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(getSampleNotes(), null, 2));
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([
      {
        id: '1',
        fullName: 'Harapriya',
        email: 'harapriya@example.com',
        password: 'password123',
      }
    ], null, 2));
  }
}

function readJSON(filePath) {
  ensureDataFiles();
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  ensureDataFiles();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readNotes() {
  return readJSON(NOTES_FILE);
}

function writeNotes(notes) {
  writeJSON(NOTES_FILE, notes);
}

function readUsers() {
  return readJSON(USERS_FILE);
}

function writeUsers(users) {
  writeJSON(USERS_FILE, users);
}

function getSampleNotes() {
  return [
    {
      id: '1',
      userId: '1',
      title: 'Project Architecture',
      content: '<h2>Tech Stack</h2><p>React + Tailwind CSS (Frontend), Node.js + Express (Backend)</p><h2>Features</h2><ul><li>User authentication</li><li>Create, read, update, delete notes</li><li>Search and filter notes</li></ul><p>This application follows a client-server architecture where the React frontend communicates with the Express backend through REST APIs.</p>',
      tags: ['#project', '#architecture'],
      category: 'Projects',
      isFavorite: true,
      isTrashed: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      color: '#6C63FF',
    },
    {
      id: '2',
      userId: '1',
      title: 'Meeting Notes',
      content: '<p>Important points from today\'s standup meeting. Discussed sprint goals and milestone planning.</p><ul><li>Review sprint backlog</li><li>Update project timeline</li><li>Assign new tasks to team members</li></ul>',
      tags: ['#meeting', '#work'],
      category: 'Work',
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      color: '#FF6B6B',
    },
    {
      id: '3',
      userId: '1',
      title: 'Ideas',
      content: '<p>New product ideas for the next quarter. Focus on user experience and performance.</p><ul><li>AI-powered search</li><li>Collaborative editing</li><li>Mobile app development</li><li>Integration with third-party services</li></ul>',
      tags: ['#ideas', '#brainstorm'],
      category: 'Personal',
      isFavorite: true,
      isTrashed: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      color: '#4ECDC4',
    },
    {
      id: '4',
      userId: '1',
      title: 'Study Plan',
      content: '<p>Complete CSS practice and master design concepts. Focus areas:</p><ul><li>Flexbox and Grid layouts</li><li>CSS animations and transitions</li><li>Responsive design patterns</li><li>Design system fundamentals</li></ul>',
      tags: ['#study', '#css'],
      category: 'College',
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      color: '#FFD93D',
    },
    {
      id: '5',
      userId: '1',
      title: 'Travel Plans',
      content: '<p>Plan a trip to Goa with friends. Budget and itinerary:</p><ul><li>Book flights - check for deals</li><li>Reserve hotel near the beach</li><li>Plan daily activities</li><li>Pack essentials</li></ul>',
      tags: ['#personal', '#travel'],
      category: 'Personal',
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      color: '#FF8A5C',
    },
    {
      id: '6',
      userId: '1',
      title: 'Shopping List',
      content: '<p>Laptop, headphones, books, notebooks, water bottle, backpack. Weekly grocery items:</p><ul><li>Fruits and vegetables</li><li>Milk and bread</li><li>Snacks for the week</li></ul>',
      tags: ['#personal', '#shopping'],
      category: 'Personal',
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      color: '#A78BFA',
    },
  ];
}

module.exports = { readNotes, writeNotes, readUsers, writeUsers, ensureDataFiles };
