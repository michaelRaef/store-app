import express from "express";
import routes from "./routes";
import {ItemService,OrderService} from "./services";
import db from './data/db';
const app = express();
const PORT = 80;
const itemService = new ItemService(db);
const orderService = new OrderService(db);
app.use(express.json());
app.use("/",routes({itemService,orderService}));
app.use((err, req, res, next) => {
    res.status(500).json(`Red alert!:${err.message}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
