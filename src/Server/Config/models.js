const fs = require("fs");
const path = require("path");

const schemaDirPath = path.resolve( __dirname, "../Schema" );

const loadModel = model => require(`${schemaDirPath}/${model}.js`);

const models = fs.readdirSync( schemaDirPath );

loadModel("UserInfo");
loadModel("Auth");
loadModel("Seller");
loadModel("Customer");
loadModel("Match");
