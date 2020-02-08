var tpix = require("./tpix-api");
var constants = require("./constants");
var users = constants.users;

var scenes = {
    empty: (msg) => {
        var cmd = commands.find(msg.text);
        if(cmd != null){
            cmd.exec(msg, msg.text.match(cmd.regexp));
           console.log("command " + msg.text + " by " + msg.senderId);
            
        }else{
            msg.send(constants.text.main, {keyboard: constants.keyboards.main});
        }
    }, 
    poezd: (msg) => {
        commands.list[0].exec(msg, [0, msg.text]);
        users[msg.senderId].scene = scenes.empty;
    },
    list: [
        (msg) => {
            users[msg.senderId].request = msg.text;
            users[msg.senderId].scene = scenes.list[1];
            msg.send(constants.text.list[1], {keyboard: constants.keyboards.list});
        },
        (msg) => {
            request = users[msg.senderId].request;
            if(msg.messagePayload && msg.messagePayload.state != undefined){
                commands.list[4].exec(msg, [0, request, msg.messagePayload.state]);
            }else{
                msg.send(constants.text.main, {keyboard: constants.keyboards.main});
            }
            users[msg.senderId].scene = scenes.empty;
        }
    ],
    info: (msg) => {
        commands.list[2].exec(msg, [0, msg.messagePayload.name]);
        users[msg.senderId].scene = scenes.empty;
    },
    chat: (msg) => {
        var cmd = commands.find(msg.text);
        if(cmd != null && cmd.chat){
            cmd.exec(msg, msg.text.match(cmd.regexp));
            console.log("chat command " + msg.text + " by " + msg.senderId);

        }
    }
};

var commands = {
    list: [{
        regexp: /\/train (.+)/i, 
        name: "/train",
        description: "информация и фото",
        exec: function(msg, args){
            tpix.train.search({query: args[1], count: 1}).then((res) => {
                if(res.found != "0"){
                    var text = constants.trainInfo(res.trains[0]);
                    if(res.trains[0].photos){
                        tpix.photo.get({id: res.trains[0].photos[0].ID}).then((data) => {
                            msg.sendPhotos(data.photo.image, {message: text + "\nАвтор фото: " + data.photo.author, keyboard: constants.keyboards.main});
                        });
                    }else{
                        msg.send(text + "\nФото не найдено", {keyboard: constants.keyboards.main});
                    }
                }else{
                    msg.send("Ничего не найдено", {keyboard: constants.keyboards.main});    
                }
            });
        }
    }, {
        regexp: /\/photo (.+)/i, 
        name: "/photo",
        description: "фото",
        chat: true,
        exec: function(msg, args){
            tpix.train.search({query: args[1], count: 1}).then((res) => {
                if(res.status_code != 404){
                    if(res.trains[0].photos){
                        tpix.photo.get({id: res.trains[0].photos[0].ID}).then((data) => {
                            msg.sendPhotos(data.photo.image, {message: "\nАвтор фото: " + data.photo.author, keyboard: (msg.peerType=="chat")?'{"buttons":[],"one_time":true}':constants.keyboards.main});
                        });
                    }else{
                        msg.send(text + "\nФото не найдено", {keyboard: (msg.peerType=="chat")?'{"buttons":[],"one_time":true}':constants.keyboards.main});
                    }
                }else{
                    msg.send("Ничего не найдено", {keyboard: (msg.peerType=="chat")?'{"buttons":[],"one_time":true}':constants.keyboards.main});    
                }
            });
        }
    }, {
        regexp: /\/info (.+)/i, 
        name: "/info",
        description: "информация",
        exec: function(msg, args){
            tpix.train.search({query: args[1], count: 1}).then((res) => {
                if(res.status_code != 404){
                    tpix.train.get({id: res.trains[0].ID}).then((data) => {
                        
                        var text = constants.trainInfo(data.train, data.train.info);
                        msg.send(text, {keyboard: (msg.peerType=="chat")?'{"buttons":[],"one_time":true}':constants.keyboards.main});
     
                    });
                }else{
                    msg.send("Ничего не найдено", {keyboard: (msg.peerType=="chat")?'{"buttons":[],"one_time":true}':constants.keyboards.main});    
                }
            });
        }
    }, {
        regexp: /(\/random)|(Случайное фото)/i, 
        name: "/random",
        description: "случайное фото",
        chat: true,
        exec: function(msg, args){
            tpix.photo.random({a: "1"}).then((res) => {
                var board = '{"buttons":[],"one_time":true}';
                if(msg.peerType!="chat"){
                    board = constants.keyboards.random(res.train.name);
                }
                msg.sendPhotos(res.photo.image, {message: res.train.name + '\nАвтор фото: '+ res.photo.author, keyboard: board});
                });
        }
    }, {
        regexp: /\/list (.+) (.+)/i, 
        name: "/info",
        description: "информация",
        exec: function(msg, args){
            tpix.train.qsearch({query: args[1], state: args[2], count: ((args[2] == 0 || args[2] == undefined)?10:50)}).then((res) => {
                if(res.status_code != 404){
                    var text = "";
                    res.trains.forEach((e, i, a) => {
                        text += e.name + ((args[2] == 0 || args[2] == undefined)?(" - " + constants.states[e.condition] + "\n"):("  "));
                    });
                    msg.send(text + "\nВсего найдено: " + res.found, {keyboard: constants.keyboards.main});
                }
                else{
                    msg.send("Ничего не найдено", {keyboard: constants.keyboards.main});
                }
            });
        }
    
    }, {
        regexp: /Поезд/i,
        exec: function(msg){
            msg.send(constants.text.poezd, {keyboard: constants.keyboards.back});
            users[msg.senderId].scene = scenes.poezd;
        }
    }, {
        regexp: /Список/i,
        exec: function(msg){
            msg.send(constants.text.list[0], {keyboard: constants.keyboards.back});
            users[msg.senderId].scene = scenes.list[0];
        }
    }, {
       regexp: /\/ae (.+)/i,
       chat: true,
       exec: (msg, args) => {
       if(msg.senderId == process.env.ADMIN){
       msg.send(eval(args[1]));
       }
       }
}],
    
    find: (text) => {
        var res = null;
        commands.list.forEach((e, i, a) => {
            if(text.match(e.regexp)){
                res = e;
                return;
            }
        });
        return res;
    }
};

module.exports = commands;
module.exports.scenes = scenes;
