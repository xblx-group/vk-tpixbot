const { VK } = require('vk-io');
const osmosis = require('osmosis');
const vk = new VK({
	token: process.env.TOKEN
    
}); 
var users = {};
var time;
//сцены - обрабатывают сообщения
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

//обработчик сообщений
vk.updates.hear(/(.+)/i, (msg) => {
    time = Date.now();
    if(msg.peerType == "chat"){
        scenes.chat(msg);
    }
    else{
    if(!users[msg.senderId]){
        users[msg.senderId] = {};
        users[msg.senderId].scene = scenes.empty;
    }
    if(msg.text.match(/(\/back)|(Назад)/i)){
        users[msg.senderId].scene = scenes.empty;
    }
    if(msg.messagePayload && msg.messagePayload.name != undefined){
        users[msg.senderId].scene = scenes.info;
    }
    users[msg.senderId].scene(msg);
    }
    
});

//команды
var commands = {
    list: [{
        regexp: /\/train (.+)/i, 
        name: "/train",
        description: "информация и фото",
        exec: function(msg, args){
            parser.search({name: args[1]}).data((data) => {
                if(data.links.length > 0){
                    parser.train({id: data.links[0].match(/\/(\d+)\//)[1]}).data((train) => {
                        var desc = "";
                        train.keys.forEach((e, i, a) => {
                            desc += e + " " + train.props[i] + '\n';
                        });
                
                        if(train.pics.length > 0){
                            parser.photo({id: train.pics[0].match(/\/(\d+)\//)[1]}).data((photo) => {
                                msg.sendPhotos("https://trainpix.org" + photo.link, {"message": train.name + "\n" + desc + "\nАвтор фото: " + photo.author, keyboard: constants.keyboards.main});
                            });
                        }else{
                            msg.send(train.name + "\n" + desc + "\nФото не найдено", {keyboard: constants.keyboards.main});
                        }
                    });
                }else{
                    msg.send("Ничего не найдено", {keyboard: constants.keyboards.main});    
                }
                console.log("time: " + (Date.now() - time));
            })
        }
    }, {
        regexp: /\/photo (.+)/i, 
        name: "/photo",
        description: "фото",
        chat: true,
        exec: function(msg, args){
            parser.search({name: args[1]}).data((data) => {
                if(data.links.length > 0){
                    parser.train({id: data.links[0].match(/\/(\d+)\//)[1]}).data((train) => {
                        if(train.pics.length > 0){
                            parser.photo({id: train.pics[0].match(/\/(\d+)\//)[1]}).data((photo) => {
                                msg.sendPhotos("https://trainpix.org" + photo.link, {"message": "Автор фото: " + photo.author, keyboard: (msg.peerType=="chat")?[]:constants.keyboards.main});
                            });
                        }else{
                            msg.send("Фото не найдено", {keyboard: constants.keyboards.main});
                        }
                    });
                }else{
                    msg.send("Ничего не найдено", {keyboard: constants.keyboards.main});
                }
                console.log("time: " + (Date.now() - time));
            });
            
        }
    }, {
        regexp: /\/info (.+)/i, 
        name: "/info",
        description: "информация",
        exec: function(msg, args){
            parser.search({name: args[1]}).data((data) => {
                if(data.links.length > 0){
                    parser.train({id: data.links[0].match(/\/(\d+)\//)[1]}).data((train) => {
                        var desc = "";
                        train.keys.forEach((e, i, a) => {
                            desc += e + " " + train.props[i] + '\n';
                        });
                        desc += "\n" + train.props[train.props.length - 1];
                        msg.send(train.name + "\n" + desc, {keyboard: constants.keyboards.main});
                    });
                }else{
                    msg.send("Ничего не найдено", {keyboard: constants.keyboards.main});
                }
            });
        }
    }, {
        regexp: /(\/random)|(Случайное фото)/i, 
        name: "/random",
        description: "случайное фото",
        chat: true,
        exec: function(msg, args){
            parser.random().data((data) => {
                msg.sendPhotos("https://trainpix.org" + data.link, {"message": data.name + "\nАвтор фото: " + data.author, keyboard: (msg.peerType=="chat")?[]:constants.keyboards.random(data.name)});
                console.log("time: " + (Date.now() - time));
            });
        }
    }, {
        regexp: /\/list (.+) (.+)/i, 
        name: "/info",
        description: "информация",
        exec: function(msg, args){
            parser.search({name: args[1], filter: args[2]}).data((data) => {
                if(data.names.length > 0){
                    var res = "";
                    data.names.forEach((e, i, a) => {
                        if(e != a[i+1]){
                            res += e + ((args[2] == 0 || args[2] == undefined)?(" - " + constants.states[data.stats[i]] + "\n"):("  "));
                        }
                    });
                    msg.send(res + "\nВсего найдено: " + data.res, {keyboard: constants.keyboards.main});
                }
                else{
                    msg.send("ничего не найдено", {keyboard: constants.keyboards.main});
                }
                console.log("time: " + (Date.now() - time));

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

//парсер
var parser = {
    search: (request) => {
        var state = 0;
        if(request.filter){
            state = request.filter;
        }
        
        return(osmosis.get('https://trainpix.org/vsearch.php?num=' + encodeURIComponent(request.name) + "&state=" + state)
        .set({"names": ["td.n > a"],
             "stats": ["tr@class"], 
             "res": ".main b",
             "links": ['td.n > a@href']
        }));
    },
    train: (request) => {
        return(osmosis.get("https://trainpix.org/vehicle/" + request.id)
        .set({"name": "h1",
            "keys": ['.p0 tr.h21 > td.ds'],
            "props": ['.p0 tr.h21 > td.d'],
            "pics": ['a.prw@href']
        }));
    },
    photo: (request) => {
        return(osmosis.get("https://trainpix.org/photo/" + request.id)
        .set({"link": "#ph@src",
            "author": ".cmt_aname a"
        }));
    }, 
    random: () => {
        return(osmosis.get("https://trainpix.org/ph.php")
         .set({"link": "#ph@src",
            "author": ".cmt_aname a",
            "name": ".narrow a"
        }));
    }
}

//константы
var constants = {
    states: {
        "s1": "Эксплуатируется", "s11": "Эксплуатируется", 
        "s2": "Новый", "s12": "Новый", 
        "s3": "Не работает", "s13": "Не работает", 
        "s4": "Списан", "s14":"Списан", 
        "s5": "Утерян", "s15": "Утерян", 
        "s7": "КРП/модернизация", "s17": "КРП/модернизация", 
        "s21": "Перенумерован", "s31": "Перенумерован", 
        "s6": "Передан в другое депо", "s16": "Передан в другое депо", 
        "s9": "Экспонат", "s19": "Экспонат"},
    text: {
        poezd: "Напиши название поезда, можно неполное\nДля отмены напиши /back",
        list: ["Напиши запрос для поиска, например: ЭД4М-03 или ЭР2\nДля отмены напиши /back", "Выбери фильтр"],
        main: "Для общения с ботом используй кнопки или команды: \n /train - найти фото и информацию о поезде \n /photo - последнее фото поезда\n /info - вся информация о поезде\n /random - случайное фото"
    },
    keyboards: {
        back: JSON.stringify({one_time: false, buttons: [[{action:{type: "text", label: "Назад", payload: "{\"action\": 3}"}, "color": "negative"}]], inline: false}),
        main: '{"one_time": false, "buttons": [[{"action":{"type": "text", "label": "Поезд", "payload": "01"}}, {"action":{"type": "text", "label": "Список", "payload": "02"}}], [{"action":{"type": "text", "label": "Случайное фото", "payload": "03"}, "color": "positive"}]], "inline": false}',
        list: JSON.stringify({"one_time": false, "buttons": [[{"action":{"type": "text", "label": "Эксплуатируется", "payload": "{\"state\": \"1\"}"}, "color": "positive"}, {"action":{"type": "text", "label": "Новый", "payload": "{\"state\": \"2\"}"}, "color": "positive"}], [{"action":{"type": "text", "label": "Не работает", "payload": "{\"state\": \"3\"}"}, "color": "negative"}, {"action":{"type": "text", "label": "Cписан", "payload": "{\"state\": \"4\"}"}, "color": "negative"}, {"action":{"type": "text", "label": "Утерян", "payload": "{\"state\": \"5\"}"}, "color": "negative"}], [{"action":{"type": "text", "label": "Модернизация", "payload": "{\"state\": \"7\"}"}, "color": "primary"}, {"action":{"type": "text", "label": "Экспонат", "payload": "{\"state\": \"9\"}"}, "color": "primary"}], [{"action":{"type": "text", "label": "Без фильтра", "payload": "{\"state\": \"0\"}"}}, {"action":{"type": "text", "label": "Назад", "payload": "122"}, "color": "negative"}]], "inline": false}),
        random: (name) => {return JSON.stringify({buttons: [[{action:{type: "text", label: "Больше инфы", payload: "{\"name\": \"" + name + "\"}"}}]], inline: true})}
        
    }
};

vk.updates.start().catch(console.error);

