const express = require('express');

const { getTransactions, fetchTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.get('/', getTransactions);
router.get('/fetch_transactions', fetchTransactions);

module.exports = router;
