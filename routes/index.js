import express from "express";
const itemRoute = require("./itemRoute");
const orderRoute = require("./orderRoute");
const router = express.Router();

module.exports = (params) => {
  router.use("/item", itemRoute(params));
  router.use("/order",orderRoute(params));
  return router;
};
