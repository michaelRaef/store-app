import express from "express";
import {handleException,handleResponse} from "../core/functions";
const router = express.Router();


module.exports = (params) => {
  const { orderService } = params;
  //Get all Orders 
  router.get("/", async (req, res) => {
    try{
      const orders = await orderService.list();
      handleResponse(res,orders,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Get item by ID
  router.get("/:orderId",async (req,res)=>{
    const orderId = req.params.orderId;
    try{
      const order = await orderService.get(orderId);
      handleResponse(res,order,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Update Order by ID
  router.put("/:orderId",async(req,res)=>{
    const orderId = req.params.orderId;
    const data = req.body;
    try{
      const updatedOrder = await orderService.update(orderId,data);
      handleResponse(res,updatedOrder,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Delete Order by ID
  router.delete("/:orderId",async(req,res)=>{
    const orderId = req.params.orderId;
    try{
      const msg = await orderService.delete(orderId);
      handleResponse(res,msg,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Add new Order
  router.post("/",async(req,res)=>{
    const data = req.body;
    try{
      const newOrder = await orderService.add(data);
      handleResponse(res,newOrder,200);
    }catch(err){
      handleException(err,res);
    }
  });
  return router;
};
