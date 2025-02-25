require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI;

// Error handling to catch unhandled promise rejections
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Load admin users from JSON file
let adminUsers = [];
try {
    const adminData = fs.readFileSync(path.join(__dirname, 'adminUsers.json'));
    const adminConfig = JSON.parse(adminData);
    adminUsers = adminConfig.admins.map(admin => admin.username);
} catch (error) {
    console.error('Error loading admin users:', error);
}

// Database connection
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process in case of db connection issue.
    });

// Session Store
const store = new MongoDBStore({
    uri: mongoURI,
    collection: 'sessions', // Collection where sessions will be stored
    expires: 1000 * 60 * 60 * 24, // 1 day expiration,
});

store.on('error', function(error) {
    console.log(error);
});

// User schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}));

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

function isLoggedOut(req, res, next) {
    if (!req.session.userId) {
        return next();
    }
    res.redirect('/dashboard');
}

// Check if user is admin
function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    }
    return res.status(403).json({ error: 'Unauthorized access' });
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/login')
});

app.get('/login', isLoggedOut, (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.lastLogin = new Date();
            
            // Check if user is in admin list
            req.session.isAdmin = adminUsers.includes(user.username);
            
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Incorrect username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred' });
    }
});

app.get('/register', isLoggedOut, (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { fullName, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', { error: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({fullName, username, password: hashedPassword });
        await newUser.save();
        res.render('register', { success: "Account created successfully!" });
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'An error occurred' });
    }
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const username = user.username;
        const now = moment();
        const lastLogin = req.session.lastLogin ? moment(req.session.lastLogin): null;
        const isNewUser = lastLogin ? now.diff(lastLogin, 'minutes') <= 5 : true;
        const welcomeMessage = isNewUser ? `Welcome new user!, ${username}.` : `Welcome back, ${username}!`;
        
        res.render('dashboard', { 
            username: username, 
            welcomeMessage: welcomeMessage,
            isAdmin: req.session.isAdmin 
        });
    } catch(error) {
        console.error('Error getting username: ', error)
        res.status(500).send('Error getting username')
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect('/login');
    });
});

app.get('/admin/users', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).send('Error getting users');
    }
});

// Check admin status for client-side
app.get('/check-admin', isLoggedIn, (req, res) => {
    res.json({ isAdmin: req.session.isAdmin });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
