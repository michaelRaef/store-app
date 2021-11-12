function handleException(err,res){
    if(err.code && err.msg){
      res.status(err.code).json(err.msg);
    }else{
      console.error(err);
      res.status(500).json("Server error please try again later");
    }
}

function handleResponse(res,data,code){
  res.status(code).json(data);
}


module.exports = {handleException,handleResponse};