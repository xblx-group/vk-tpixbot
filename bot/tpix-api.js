const http = require('request-promise');
var api = {
    train: {
        search: (request) => {
            var query = request.query;
            var count = request.count || 5;
            var st = request.st || 0;
            var state = request.state || 0;
            return(http(api.options({method: "train/search", params: {"query": query, "count": count, "st": st, "state": state}})));
        },
        qsearch: (request) => {
            var query = request.query;
            var count = 10 || request.count;
            return(http(api.options({method: "train/qsearch", params: {"query": query, "count": count}})));
        },
        get: (request) => {
            var id = request.id;
            return(http(api.options({method: "train/get", params: {"id": id}})));
        }
    },
    photo: {
        get: (request) => {
            var id = request.id;
            var quick = 0 || request.quick;
            return(http(api.options({method: "photo/get", params: {"id": id, "quick": quick}})));
        },
        random: () => {
            return(http(api.options({method: "photo/random"})));
        }
    },
    options: (request) => {
        var adr = "https://api.openpix.ru/api/v0.4/";
        adr += request.method + "?";
        if(request.params){
            Object.keys(request.params).forEach((i, e, a) => {
                adr += i + "=" + encodeURIComponent(request.params[i]) + "&";
            });
        }
       
        return({method: 'GET', uri: adr, json: true});
    }
};
module.exports = api;
