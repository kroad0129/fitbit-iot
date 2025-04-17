const express = require('express');
const router = express.Router();
const { latestSensorData } = require('../shared/state');

router.get('/sensor', (req, res) => {
    res.json(latestSensorData);
});

module.exports = router;
