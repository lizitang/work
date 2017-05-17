module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'dev':
            return {
              "MONGO_URI": "mongodb://192.168.2.197/chatbots",
              "MONGO_OPTIONS": { "db": { "safe": true } }
            };
        case 'prod':
            return {
                "MONGO_URI": "mongodb://localhost/test",
                "MONGO_OPTIONS": { "db": { "safe": true } }
            };
        default:
            return {
                "MONGO_URI": "mongodb://192.168.2.197/chatbots",
                "MONGO_OPTIONS": { "db": { "safe": true } }
            };
    }
};
