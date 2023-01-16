import express from "express";
import { buildComparisonTable, getResultsToChoose } from "./storeResultsHandler.js";

const appPort = 4004;

const app = express();

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post("/store", getResultsToChoose);
app.post("/comparison", buildComparisonTable);

app.listen(appPort, () => console.log(`Listening on port ${appPort} ...`));
