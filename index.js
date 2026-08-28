require('dotenv').config();
const express = require('express');


const app = express();
const port = process.env.PORT || 3000;

app.get('*', (req, res) => {res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});