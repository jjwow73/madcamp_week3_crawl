import * as Express from "express";
import * as bodyParser from "body-parser";
import * as Morgan from "morgan";
import * as dotenv from "dotenv";
import { Sequelize } from "sequelize";

/*
const sequelize = new Sequelize("sqlTutorial", "kaist", "kaist", {
  host: "localhost",
  dialect: "mysql",
  });*/

const SequelizeAuto = require('sequelize-auto');
const auto = new SequelizeAuto('sqlTutorial','kaist','kaist',{
  host:'localhost',
	dialect:'mysql',
    port:'3306',
		tables:['companyInfo','companySichong', 'stockPrice']
});
	 auto.run((err)=>{
    if(err) {
    console.log(err);
    throw err;
    }
});

      /*
try {
  sequelize.authenticate();
} catch (error) {
  console.error(error);
  }*/

const app = Express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(Morgan("dev"));

const port = 4000;

app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
