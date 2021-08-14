const express = require('express');
const router = express.Router();

const controllers = require('../controllers');
const feedController = controllers.feed;

router.get('/posts', feedController.getPosts)

module.exports = router;