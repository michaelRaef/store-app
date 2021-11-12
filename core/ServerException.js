class ServerException extends Error{
    constructor(msg,code){
        super(msg);
        this.msg = msg;
        this.code = code;
    }
}

module.exports = ServerException;