import ServerException from "../core/ServerException";
import orderSchema  from '../models/orderSchema.json';
import Ajv from "ajv";
class OrderService{
    constructor(db){
        this.db = db;
        const ajv = new Ajv({allErrors:true});
        this.postBodyValidator = ajv.compile(orderSchema.postBody);
        this.putBodyValidator = ajv.compile(orderSchema.putBody);
        this.table_name = "orders";
    }

    async list(){
        const response = await this.db.allAsync(`SELECT * FROM ${this.table_name}`);
        return response;
    }

    async get(orderId){
        var query = `SELECT * FROM ${this.table_name} where orderId=?`;
        var order = await this.db.getAsync(query,[orderId]);
        if(!order){
            throw new ServerException("Order <"+orderId+"> not found",404);
        }
        return order;
    }

    async update(orderId,data){
        var valid = this.putBodyValidator(data);
        if(!valid){
            throw new ServerException(this.putBodyValidator.errors,400);
        }
        const newRequestedQnty = data.requestedQnty;
            const order = await this.get(orderId);
            if(order.requestedQnty==newRequestedQnty){
                //return same order
                return order;
            }else{
                const item = await this._getItem(order.itemId);
                const itemId = item.itemId;
                const total = newRequestedQnty*item.cost;
                const diff = Math.abs(newRequestedQnty - order.requestedQnty);
                var newItemQnty;
                if(order.requestedQnty>newRequestedQnty){
                    newItemQnty = item.quantity+diff;
                }else{
                    if(item.quantity>=diff){
                        newItemQnty = item.quantity-diff;
                    }else{
                        throw new ServerException(`Not enough quantity in inventory for item <${item.itemId}>`,400);
                    }
                }
                var updateOrderQuery = `UPDATE ${this.table_name} SET requestedQnty=${newRequestedQnty}, totalCost=${total} where orderId=${orderId}`;
                var updateItemQuery = `UPDATE items SET quantity=${newItemQnty} where itemId=${itemId}`;
                try{
                    const responses = await this.db.runBatchAsync([updateOrderQuery,updateItemQuery]);
                    if(responses[0].changes==0){
                        throw new ServerException(`Exception while updating order`,500);
                    }
                    return this.get(orderId);
                }catch(err){
                    throw new ServerException(`Exception while updating order`,500);
                }
            }
    }

    async add(data){
        var valid = this.postBodyValidator(data);
        if(!valid){
            throw new ServerException(this.postBodyValidator.errors,400);
        }
        const item = await this._getItem(data.itemId);
        if(!(item.quantity>=data.requestedQnty)){
            throw new ServerException(`Not enough quantity in inventory for item <${data.itemId}>`,400);
        }
        const itemId = item.itemId;
        const itemNewQuantity = item.quantity-data.requestedQnty;
        const requestedQnty = data.requestedQnty;
        const total = requestedQnty*item.cost;
        const shoopingCartId = data.shoppingCartId;

        var createOrderQuery = `INSERT INTO ${this.table_name} (itemId,shoppingCartId,requestedQnty,totalCost) VALUES('${itemId}','${shoopingCartId}','${requestedQnty}','${total}')`;
        var updateItemQuery = `UPDATE items SET quantity='${itemNewQuantity}' where itemId='${itemId}'`;
        try{
            const responses = await this.db.runBatchAsync([createOrderQuery,updateItemQuery]);
            if(responses[0].changes==0){
                throw new ServerException(`Exception while creating order`,500);
            }
            return this.get(responses[0].lastID);
        }catch(err){
            console.error(err);
            throw new ServerException(`Exception while creating order`,500);
        }
    }

    async delete(orderId){
        var query = `DELETE FROM ${this.table_name} WHERE orderId=?;`;
        const response = await this.db.runAsync(query,[orderId]);
        if(response.changes==0){
            throw new ServerException(`Order <${orderId}> doesn't exists!`,404);
        }else{
            return `Order <${orderId}> deleted!`;
        }
    }

    async _getItem(itemId){
        var query = `SELECT itemId,quantity,cost from items WHERE itemId=?`;
        const item = await this.db.getAsync(query,[itemId]);
        if(!item){
            throw new ServerException("Item in order was not found!",404);
        }
        return item;
    }
}

module.exports = OrderService;