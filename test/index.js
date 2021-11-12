var expect  = require('chai').expect;
var request = require('request');
var base_url = "http://localhost:3000"; 

describe('Items test cases',function(){
    it('Get all items',function(done){
        request(`${base_url}/item`,function(error,response,body){
            const data = JSON.parse(body);
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(data).to.be.an('array');
            done();
        })
    });
    
    it('Get item by ID (exists)',function(done){
        request(`${base_url}/item/1`,function(error,response,body){
            const data = JSON.parse(body);
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(data).to.includes.all.keys(["itemId","name","cost","quantity"]);
            done();
        });
    });
    
    it("Get item by ID (doesn't exists)",function(done){
        request(`${base_url}/item/150`,function(error,response,body){
            const data = JSON.parse(body);
            const statusCode = response.statusCode
            expect(statusCode).to.equal(404);
            expect(data).to.equal("Item <150> not found");
            done();
        });
    });
    
    it("Update item 2",function(done){
        var putOptions = {
            uri: `${base_url}/item/2`,
            method: 'PUT',
            json: {
                "name":"item_2",
                "cost":100,
                "quantity":2
            }
        };
        request(putOptions,function(error,response,body){
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(body).to.deep.equal({itemId:2,name:'item_2',cost:100,quantity:2});
            done();
        });
    });

    global.newId;
    it("Create new item",function(done){
        var postOptions = {
            uri: `${base_url}/item`,
            method: 'POST',
            json: {
                "name":"item_Test",
                "cost":150,
                "quantity":20
            }
        };
        request(postOptions,function(error,response,body){
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(body).to.deep.include({name:'item_Test',cost:150,quantity:20});
            global.newId = body.itemId;
            done();
        });
    });

    it("Delete new item",function(done){
        setTimeout(function () {
            var deleteOptions = {
                uri: `${base_url}/item/${global.newId}`,
                method: 'DELETE'
            };
            request(deleteOptions,function(error,response,body){
                const statusCode = response.statusCode
                expect(statusCode).to.equal(200);
                done();
            });
        }, 100);
        
});

});


describe('Orders test cases',function(){
    it('Get all orders',function(done){
        request(`${base_url}/order`,function(error,response,body){
            const data = JSON.parse(body);
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(data).to.be.an('array');
            done();
        })
    });
    
    it('Get order by ID (exists)',function(done){
        request(`${base_url}/order/1`,function(error,response,body){
            const data = JSON.parse(body);
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(data).to.includes.all.keys(["orderId","itemId","shoppingCartId","requestedQnty","totalCost"]);
            done();
        });
    });
    
    it("Get order by ID (doesn't exists)",function(done){
        request(`${base_url}/order/150`,function(error,response,body){
            const data = JSON.parse(body);
            const statusCode = response.statusCode
            expect(statusCode).to.equal(404);
            expect(data).to.equal("Order <150> not found");
            done();
        });
    });
    
    it("Update order 3",function(done){
        var putOptions = {
            uri: `${base_url}/order/3`,
            method: 'PUT',
            json: {
                "requestedQnty":1
            }
        };
        request(putOptions,function(error,response,body){
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(body).to.deep.equal({orderId:3,itemId:3,shoppingCartId:647852,requestedQnty:1,totalCost:35.5});
            done();
        });
    });

    global.newOrderId;
    it("Create new order",function(done){
        var postOptions = {
            uri: `${base_url}/order`,
            method: 'POST',
            json: {
                itemId:1,
                shoppingCartId:123456,
                requestedQnty:1,
            }
        };
        request(postOptions,function(error,response,body){
            const statusCode = response.statusCode
            expect(statusCode).to.equal(200);
            expect(body).to.deep.include({itemId:1,shoppingCartId:123456,requestedQnty:1,totalCost:100});
            global.newOrderId = body.orderId;
            done();
        });
    });

    it("Delete new order",function(done){
        setTimeout(function () {
            var deleteOptions = {
                uri: `${base_url}/order/${global.newOrderId}`,
                method: 'DELETE'
            };
            request(deleteOptions,function(error,response,body){
                const statusCode = response.statusCode
                expect(statusCode).to.equal(200);
                done();
            });
        }, 200);
        
    });

    it("Create new order (Not enough quantity)",function(done){
        var postOptions = {
            uri: `${base_url}/order`,
            method: 'POST',
            json: {
                itemId:1,
                shoppingCartId:123456,
                requestedQnty:100,
            }
        };
        request(postOptions,function(error,response,body){
            const statusCode = response.statusCode
            expect(statusCode).to.equal(400);
            expect(body).to.equal("Not enough quantity in inventory for item <1>")
            done();
        });
    });

});