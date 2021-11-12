import ServerException from "../core/ServerException";
import itemSchema  from '../models/itemSchema.json';
import Ajv from "ajv";
class ItemService{
    constructor(db){
        this.db = db;
        const ajv = new Ajv({allErrors:true});
        this.postBodyValidator = ajv.compile(itemSchema.postBody);
        this.putBodyValidator = ajv.compile(itemSchema.putBody);
        this.table_name = "items";
    }

    async list(){
        const response = await this.db.allAsync(`SELECT * FROM ${this.table_name}`);
        return response;
    }

    async get(itemId){
        var query = `SELECT * FROM ${this.table_name} where itemId=?`;
        const item = await this.db.getAsync(query,[itemId]);
        if(!item){
            throw new ServerException("Item <"+itemId+"> not found",404);
        }
        return item;
    }

    async update(itemId,data){
        var valid = this.putBodyValidator(data);
        if(!valid){
            throw new ServerException(this.putBodyValidator.errors,400);
        }else{
            var setColumns = "";
            for(var key in data){
                setColumns+=`${key}='${data[key]}',`
            }
            if(setColumns){
                setColumns = setColumns.replace(/,+$/, "");
            }
            var query = `UPDATE ${this.table_name} SET ${setColumns} WHERE itemId=${itemId}`;
            const response = await this.db.runAsync(query);
            if(response.changes==0){
                throw new ServerException("Item <"+itemId+"> not found",404);
            }else{
                return this.get(itemId);
            }
        }
    }

    async add(data){
        var valid = this.postBodyValidator(data);
        if(!valid){
            throw new ServerException(this.postBodyValidator.errors,400);
        }else{
            var query = `INSERT INTO ${this.table_name} (name,cost,quantity) VALUES('${data['name']}','${data['cost']}','${data['quantity']}');`;
            const response = await this.db.runAsync(query);
            if(response.changes==0){
                throw new ServerException("Error creating item!",500);
            }else{
                return this.get(response.lastID);
            }
        }
    }

    async delete(orderId){
        var query = `DELETE FROM ${this.table_name} WHERE itemId=${orderId};`;
        const response = await this.db.runAsync(query);
        if(response.changes==0){
            throw new ServerException(`Item <${orderId}> doesn't exists!`,404);
        }else{
            return `Item <${orderId}> deleted!`;
        }
    }
}

module.exports = ItemService;