// ─── In-memory Auth Service ─────────────────────────────────────
// Dummy users: agents and managers (higher-ups)

const users = [
  // ── Agents ──
  {
    id: "AGT001",
    username: "rahul.sharma",
    password: "agent123",
    name: "Rahul Sharma",
    role: "agent",
    level: "Level 4 Elite",
    region: "Mumbai",
    avatar: "RS",
  },
  {
    id: "AGT002",
    username: "priya.nair",
    password: "agent123",
    name: "Priya Nair",
    role: "agent",
    level: "Level 3 Senior",
    region: "Bengaluru",
    avatar: "PN",
  },
  {
    id: "AGT003",
    username: "vikash.kumar",
    password: "agent123",
    name: "Vikash Kumar",
    role: "agent",
    level: "Level 2 Associate",
    region: "Delhi",
    avatar: "VK",
  },

  // ── Managers / Higher-ups ──
  {
    id: "MGR001",
    username: "anita.desai",
    password: "manager123",
    name: "Anita Desai",
    role: "manager",
    designation: "Regional Head — West",
    region: "Mumbai",
    avatar: "AD",
  },
  {
    id: "MGR002",
    username: "sanjay.mehta",
    password: "manager123",
    name: "Sanjay Mehta",
    role: "manager",
    designation: "VP — Marketing",
    region: "Pan-India",
    avatar: "SM",
  },
  {
    id: "MGR003",
    username: "deepika.iyer",
    password: "manager123",
    name: "Deepika Iyer",
    role: "manager",
    designation: "Campaign Operations Lead",
    region: "Bengaluru",
    avatar: "DI",
  },
];

// In-memory sessions: token → userId
const sessions = new Map();

function login(username, password) {
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) return null;

  const token = `tok_${user.id}_${Date.now()}`;
  sessions.set(token, user.id);
  return {
    token,
    user: sanitize(user),
  };
}

function logout(token) {
  sessions.delete(token);
}

function getUserByToken(token) {
  const userId = sessions.get(token);
  if (!userId) return null;
  const user = users.find((u) => u.id === userId);
  return user ? sanitize(user) : null;
}

function getUserById(id) {
  const user = users.find((u) => u.id === id);
  return user ? sanitize(user) : null;
}

function getManagers() {
  return users.filter((u) => u.role === "manager").map(sanitize);
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = {
  login,
  logout,
  getUserByToken,
  getUserById,
  getManagers,
};
