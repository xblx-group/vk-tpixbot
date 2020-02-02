const { VK } = require('vk-io');
const scenes = require("./commands").scenes;
const users = require("./constants").users;

const vk = new VK({
	token: process.env.TOKEN
}); 

//обработчик сообщений
vk.updates.hear(/(.+)/i, (msg) => {
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
vk.updates.start().catch(console.error);
