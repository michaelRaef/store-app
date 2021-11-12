import sqlite3 from 'sqlite3';
import dbScripts from './db_scripts.json';
var myArgs = process.argv.slice(2);

const DBSOURCE = "db.sqlite"

sqlite3.Database.prototype.getAsync = function (sql,...params){
  return new Promise((resolve,reject)=>{
    this.get(sql,params,function(err,row){
      if(err) return reject(err);
      resolve(row);
    });
  });
};

sqlite3.Database.prototype.allAsync = function (sql,...params){
  return new Promise((resolve,reject)=>{
    this.all(sql,params,function(err,rows){
      if(err) return reject(err);
      resolve(rows);
    });
  });
};

sqlite3.Database.prototype.runAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
      this.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve(this);
      });
  });
};

sqlite3.Database.prototype.runBatchAsync = function (statements) {
  var results = [];
  var batch = ['BEGIN', ...statements, 'COMMIT'];
  return batch.reduce((chain, statement) => chain.then(result => {
      results.push(result);
      return db.runAsync(...[].concat(statement));
  }), Promise.resolve())
  .catch(err => db.runAsync('ROLLBACK').then(() => Promise.reject(err +
      ' in statement #' + results.length)))
  .then(() => results.slice(2));
};

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      console.error(err.message)
      throw err
    }else{
        console.log("Connecting to DB"); 
        console.log("Running db init scripts");
        var statements = [
          dbScripts.create_tables.item_table,
          dbScripts.create_tables.order_table
        ]
        if(myArgs.includes("reset")){
          statements = [
            "DROP TABLE IF EXISTS items;",
            "DROP TABLE IF EXISTS orders;",
            dbScripts.create_tables.item_table,
            dbScripts.create_tables.order_table
          ]
        }
        
        db.runBatchAsync(statements).then(results=>{
          db.get("select itemId from items limit 1",(err,row)=>{
            if(!row && !err){
              console.log("Inserting in table items");
              for(var values of dbScripts.insert_rows.items.rows){
                db.run(dbScripts.insert_rows.items.query,values);
              } 
            }
          });
          db.get("select orderId from orders limit 1",(err,row)=>{
            if(!row && !err){
              console.log("Inserting in table orders");
              for(var values of dbScripts.insert_rows.orders.rows){
                db.run(dbScripts.insert_rows.orders.query,values);
              } 
            }
          })
        }).catch(err=>console.error(err));
    }
});

module.exports = db