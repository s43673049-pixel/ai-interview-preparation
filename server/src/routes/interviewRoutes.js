const express = require('express');
const axios = require('axios');
const pool = require('../config/db');

const router = express.Router();

router.post('/sessions', async (req, res) => {
  const { question, model } = req.body;