const axios = require('axios');

const Transaction = require('../models/transactionModel');

exports.fetchTransactions = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const { data } = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`,
    );

    if (data.status !== '1') {
      return res.status(400).json({
        error: `Etherscan error: ${data.message || 'Unable to fetch transactions.'}`,
      });
    }

    const transactions = data.result.slice(0, 5).map((tx) => ({
      address,
      hash: tx.hash,
      value: tx.value,
      timestamp: new Date(tx.timeStamp * 1000),
    }));

    await Transaction.insertMany(transactions);

    res.status(200).json({ message: 'Transactions fetched successfully', data: transactions });
  } catch (err) {
    console.error("There's an error while fetching: ", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactions = async (req, res) => {
  const { address, startDate, endDate } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const query = { address };

    // Simplified date range handling
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      query.timestamp = { $gte: start, $lte: end };
    } else if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start)) {
        return res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD.' });
      }
      query.timestamp = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end)) {
        return res.status(400).json({ error: 'Invalid endDate format. Use YYYY-MM-DD.' });
      }
      query.timestamp = { $lte: end };
    }

    const transactions = await Transaction.find(query).sort({ timestamp: 'desc' });

    if (!transactions.length) {
      return res.status(404).json({ message: 'No transactions found for the given criteria' });
    }

    res.status(200).json({
      message: 'Transactions fetched successfully',
      data: transactions,
    });
  } catch (err) {
    console.error('Query Transactions Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
