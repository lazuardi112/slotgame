const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const { sequelize, User, GlobalSettings } = require('./database');

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(session({
  secret: 'your-secret-key', // Replace with a real secret key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));


// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/admin/login.html');
  }
};

// Admin Routes
app.get('/admin', (req, res) => {
    if (req.session.user) {
        res.redirect('/admin/dashboard.html');
    } else {
        res.redirect('/admin/login.html');
    }
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.user = { username: 'admin' };
    res.redirect('/admin/dashboard.html');
  } else {
    res.send('Invalid username or password');
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/admin/dashboard.html');
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login.html');
  });
});

// Protected dashboard route
app.get('/admin/dashboard.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// API Routes for Admin Dashboard (Protected)
app.get('/api/admin/users', isAuthenticated, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/api/admin/users/:id/credits', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            user.credits = parseInt(req.body.credits, 10);
            await user.save();
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/api/admin/users/:id/rtp', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            user.rtp_percentage = req.body.rtp === '' ? null : parseInt(req.body.rtp, 10);
            await user.save();
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.get('/api/admin/settings/global_rtp', isAuthenticated, async (req, res) => {
    try {
        const setting = await GlobalSettings.findOne({ where: { key: 'global_rtp' } });
        res.json(setting);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.post('/api/admin/settings/global_rtp', isAuthenticated, async (req, res) => {
    try {
        const [setting, created] = await GlobalSettings.findOrCreate({
            where: { key: 'global_rtp' },
            defaults: { value: req.body.value }
        });
        if (!created) {
            setting.value = req.body.value;
            await setting.save();
        }
        res.json(setting);
    } catch (error) {
        res.status(500).send('Server error');
    }
});


// Public API Routes
app.post('/api/user', async (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) {
        return res.status(400).send('deviceId is required');
    }

    try {
        let user = await User.findOne({ where: { deviceId } });
        if (user) {
            res.json(user);
        } else {
            user = await User.create({ deviceId, credits: 10000 });
            res.json(user);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/api/spin', async (req, res) => {
    const { deviceId, bet } = req.body;

    try {
        const user = await User.findOne({ where: { deviceId } });
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.credits < bet) {
            return res.status(400).send('Insufficient credits');
        }

        // Determine RTP
        let rtp = user.rtp_percentage;
        if (rtp === null) {
            const globalRtpSetting = await GlobalSettings.findOne({ where: { key: 'global_rtp' } });
            rtp = globalRtpSetting ? parseInt(globalRtpSetting.value, 10) : 90;
        }

        // Win/Loss Logic
        const averageWinMultiplier = 3; // Average win is 3x the bet
        const winProbability = (rtp / 100) / averageWinMultiplier;
        const isWinner = Math.random() < winProbability;

        let winAmount = 0;
        if (isWinner) {
            winAmount = bet * averageWinMultiplier;
            user.credits += winAmount - bet;
        } else {
            user.credits -= bet;
        }

        await user.save();

        res.json({
            win: isWinner,
            winAmount,
            credits: user.credits
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// Start the server after DB sync
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
});