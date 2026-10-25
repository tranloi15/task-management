const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

const database = require("./config/database");
database.connect();

app.use(express.json());

const routeClient = require("./api/v1/routes/client/index.route");

routeClient(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});