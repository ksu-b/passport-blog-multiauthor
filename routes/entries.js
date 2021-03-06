const express = require('express');
const router = express.Router();
const Entry = require('../models/entry');
const { sessionChecker } = require('../middleware/auth');

// entries
router.get('/', async (req, res, next) => {
    let recentEntries = await Entry.mostRecent();
    if (req.session.user && req.cookies.user_sid) {
        res.render('entries/index', { username: req.session.user.username, loggedIn: true, entries: recentEntries });
    } else {
        res.render('entries/index', { entries: recentEntries });
    }
});

router.post('/', async (req, res, next) => {
    let newEntry = new Entry({ title: req.body.title, body: req.body.body, authorID: req.session.user._id });
    await newEntry.save();
    res.redirect(`/entries/${newEntry.id}`);
});

//new entries
router.get('/new', sessionChecker, (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('entries/new', { username: req.session.user.username, loggedIn: true });
    } else {
        res.render('entries/new');
    }
});

//detail entry
router.get('/:id', async (req, res, next) => {
    let entry = await Entry.findById(req.params.id).populate('authorID');
    if (req.cookies.user_sid && req.session.user._id == entry.authorID._id) {
        res.render('entries/show', { entry, username: req.session.user.username, loggedIn: true, userMatch: true });
    } else if (req.session.user && req.cookies.user_sid) {
        res.render('entries/show', { entry, username: req.session.user.username, loggedIn: true });
    } else {
        res.render('entries/show', { entry });
    }
});

router.put('/:id', sessionChecker, async (req, res, next) => {
    let entry = await Entry.findById(req.params.id);

    entry.title = req.body.title;
    entry.body = req.body.body;
    entry.updatedAt = Date.now();
    await entry.save();

    res.redirect(`/entries/${entry.id}`);
});

router.delete('/:id', sessionChecker, async (req, res, next) => {
    await Entry.deleteOne({ '_id': req.params.id });
    res.redirect('/');
});

router.get('/:id/edit', sessionChecker, async (req, res, next) => {
    let entry = await Entry.findById(req.params.id);
    if (req.session.user._id !== entry.authorID._id) {
        res.render('404', { username: req.session.user.username, loggedIn: true });
    } else if (req.session.user && req.cookies.user_sid) {
        res.render('entries/edit', { entry, username: req.session.user.username, loggedIn: true });
    } else {
        res.render('entries/edit', { entry });
    }
});
module.exports = router;