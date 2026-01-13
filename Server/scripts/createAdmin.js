#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

// simple CLI args parser (no external deps)
const rawArgs = process.argv.slice(2);
const argv = {};
for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i];
    if (a.startsWith('--')) {
        const key = a.replace(/^--+/, '');
        const next = rawArgs[i + 1];
        if (next && !next.startsWith('--')) {
            argv[key] = next;
            i++;
        } else {
            argv[key] = true;
        }
    }
}

if (!argv.email || !argv.password) {
    console.error('Usage: node scripts/createAdmin.js --email <email> --password <password> [--name <name>]');
    process.exit(1);
}

argv.name = argv.name || 'Admin';

const run = async () => {
    try {
        await connectDB();
        const { email, password, name } = argv;
        const exists = await User.findOne({ email });
        if (exists) {
            console.log('User already exists:', exists.email, 'role=', exists.role);
            process.exit(0);
        }
        const user = await User.create({ email, password, name, role: 'admin' });
        console.log('Admin user created:', { id: user._id, email: user.email, role: user.role });
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err.message);
        process.exit(1);
    }
};

run();
