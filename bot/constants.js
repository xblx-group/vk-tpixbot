var constants = {
    states: {
        "1": "Эксплуатируется", "s11": "Эксплуатируется", 
        "2": "Новый", "s12": "Новый", 
        "3": "Не работает", "s13": "Не работает", 
        "4": "Списан", "s14":"Списан", 
        "5": "Утерян", "s15": "Утерян", 
        "7": "КРП/модернизация", "s17": "КРП/модернизация", 
        "21": "Перенумерован", "s31": "Перенумерован", 
        "6": "Передан в другое депо", "s16": "Передан в другое депо", 
        "9": "Экспонат"},
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
        
    },
    users: {},
    trainInfo: (train) => {
        var res = "";
        res += train.name;
        if(train.railway) res+= "\nДорога приписки: " + train.railway.name;
        if(train.depot) res+= "\nДепо: " + train.depot.name;
        if(train.model) res+= "\nСерия: " + train.model.name;
        if(train.built) res+= "\nПостроен: " + train.built;
        if(train.condition) res+= "\nCостояние: " + constants.states[train.condition];
        if(train.note) res+= "\nПримичание: " + train.note;
        return res;
    }
};

module.exports = constants;
