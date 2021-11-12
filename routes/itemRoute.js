import express from "express";
import {handleException,handleResponse}  from "../core/functions";
const router = express.Router();

module.exports = (params) => {
  const { itemService } = params;

  //Get all items 
  router.get("/", async (req, res) => {
    try{
      const items = await itemService.list();
      handleResponse(res,items,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Get item by ID
  router.get("/:itemId",async (req,res)=>{
    const itemId = req.params.itemId;
    try{
      const item = await itemService.get(itemId);
      handleResponse(res,item,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Update Item by ID
  router.put("/:itemId",async(req,res)=>{
    const itemId = req.params.itemId;
    const data = req.body;
    try{
      const updatedItem = await itemService.update(itemId,data);
      handleResponse(res,updatedItem,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Delete Item by ID
  router.delete("/:itemId",async(req,res)=>{
    const itemId = req.params.itemId;
    try{
      const msg = await itemService.delete(itemId);
      handleResponse(res,msg,200);
    }catch(err){
      handleException(err,res);
    }
  });

  //Add new Item
  router.post("/",async(req,res)=>{
    const data = req.body;
    try{
      const newItem = await itemService.add(data);
      handleResponse(res,newItem,200);
    }catch(err){
      handleException(err,res);
    }
  })
  return router;
};
