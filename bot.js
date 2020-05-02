const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const fs = require('fs');

const token = '1295480116:AAHxAoXlJ7Y2jBpnLhntJILZj9aikSA9tH4';
const apimeteo = '397d1e8e58e381cc82d95209911bd4db';

const bot = new TelegramBot(token,
    {
        polling: true
    });

//comando benvenuto
bot.onText(/\/start/, (msg) => {
    var benvenuto = "Welcome into the bot MeteoRio";

    bot.sendMessage(msg.chat.id, benvenuto);
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "Commands", callback_data: "1" }],
                [{ text: "Info bot", callback_data: "2" }],
            ]
        })

    };
    bot.sendMessage(msg.chat.id, "Select an item", options);
    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const opts = {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
        };
        let text;

        if (action === '1') {
            text = "List of available commands:\n. Weather forecast for today in a city => /today cityname\n. Weather forecast tomorrow in a city => /tomorrow cityname\n. Weather forecast the day after tomorrow => /after cityname\n. Weather forecast next 5 days => /next cityname";
        }
        if (action === '2') {
            text = "MeteoRio_bot, bot creato da Rio Alex per progetto di fine anno di TPSIT e GPOI";
        }
        bot.sendMessage(msg.chat.id, text, opts);
    });
});


bot.on("polling_error", (err) => console.log(err));

//comando meteo oggi
bot.onText(/\/today (.+)/, (msg, match) => {
    const chat_id = msg.chat.id;
    const citta = match[1] ? match[1] : "";
    bot.sendMessage(chat_id, "Weather for today in " + citta);
    http.get('http://api.openweathermap.org/data/2.5/weather?q=' + citta + '&appid=' + apimeteo, (res) => {
        let rawDat = '';
        res.on('data', (chunk) => { rawDat += chunk; });
        res.on('end', () => {
            try {
                const DatiConvertiti = JSON.parse(rawDat);
                var dati = [];
                DatiConvertiti.weather.forEach(function (value) {
                    dati.push("Weather: " + value.description);
                });
                dati.push("Temperature: " + DatiConvertiti.main.temp + "°C");
                dati.push("Wind: " + DatiConvertiti.wind.speed + "m/s");

                bot.sendMessage(chat_id, dati.join("\n"));
                dati = JSON.stringify(dati);
                fs.writeFileSync("today.json", dati);
            } catch (error) {
                bot.sendMessage(chat_id, "There is an error!\n" + error.message);
            }
        })
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "There is an error!\n" + error.message);
    });
});

//comando meteo domani
bot.onText(/\/tomorrow (.+)/, (msg, match) => {
    const chat_id = msg.chat.id;
    const citta = match[1] ? match[1] : "";
    bot.sendMessage(chat_id, "Weather for tomorrow in " + citta);
    http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + citta + '&appid=' + apimeteo, (res) => {
        let output = '';
        res.on('data', (chunk) => {
            output += chunk;
        });

        res.on('end', () => {
            let obj = JSON.parse(output);
            var dati = [];
            var domani = calcolaDomani();
            domani = parseInt(domani, 10);
            for (var i = 0; i < 40; i++) {
                var generale = obj.list[i].weather[0].main;
                var descrizione = obj.list[i].weather[0].description;
                var min = obj.list[i].main.temp_min;
                var max = obj.list[i].main.temp_max;
                var vento = obj.list[i].wind.speed;
                var date = obj.list[i].dt_txt;
                var hour = date.substr(11, 5);
                var day = date.substr(8, 2);
                day = parseInt(day, 10);
                if (domani == day) {
                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\nMinimum temperature: " + min + "°C" + "\nMaximum temperature: " + max + "°C" + " \nWind: " + vento + "m/s" + "\n\n";
                    dati.push(string);
                }
            }
            bot.sendMessage(chat_id, dati.join("\n"));
            dati = JSON.stringify(dati);
            fs.writeFileSync("tomorrow.json", dati);
        });
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "There is an error!\n" + error.message);
    });
});

//comando meteo dopodomani
bot.onText(/\/after (.+)/, (msg, match) => {
    const chat_id = msg.chat.id;
    const citta = match[1] ? match[1] : "";
    bot.sendMessage(chat_id, "Weather for the day after tomorrow in " + citta);
    http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + citta + '&appid=' + apimeteo, (res) => {
        let output = '';
        res.on('data', (chunk) => {
            output += chunk;
        });

        res.on('end', () => {
            let obj = JSON.parse(output);
            var dati = [];
            var dopodomani = calcolaDopoDomani();
            dopodomani = parseInt(dopodomani, 10);
            for (var i = 0; i < 40; i++) {
                var generale = obj.list[i].weather[0].main;
                var descrizione = obj.list[i].weather[0].description;
                var min = obj.list[i].main.temp_min;
                var max = obj.list[i].main.temp_max;
                var vento = obj.list[i].wind.speed;
                var date = obj.list[i].dt_txt;
                var hour = date.substr(11, 5);
                var day = date.substr(8, 2);
                day = parseInt(day, 10);
                if (dopodomani == day) {
                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\nMinimum temperature: " + min + "°C" + "\nMaximum temperature: " + max + "°C" + " \nWind: " + vento + "m/s" + "\n\n";
                    dati.push(string);
                }
            }
            bot.sendMessage(chat_id, dati.join("\n"));
            dati = JSON.stringify(dati);
            fs.writeFileSync("nexttomorrow.json", dati);
        });
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "There is an error!\n" + error.message);
    });
});

//comando meteo prossimi 5 giorni
bot.onText(/\/next (.+)/, (msg, match) => {
    const chat_id = msg.chat.id;
    const citta = match[1] ? match[1] : "";
    bot.sendMessage(chat_id, "Weather for the next 5 days in " + citta);
    http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + citta + '&appid=' + apimeteo, (res) => {
        let output = '';
        res.on('data', (chunk) => {
            output += chunk;
        });

        res.on('end', () => {
            let obj = JSON.parse(output);
            var dati;
            var dati_completi = [];
            var oggi = calcolaData();
            var j = 0;
            for (var i = 0; i < 40; i++) {
                var generale = obj.list[i].weather[0].main;
                var descrizione = obj.list[i].weather[0].description;
                var min = obj.list[i].main.temp_min;
                var max = obj.list[i].main.temp_max;
                var vento = obj.list[i].wind.speed;
                var data = obj.list[i].dt_txt;
                var hour = data.substr(11, 5);
                var d = data.substr(0, 10);

                if ((d != oggi && j == 0) || (d != oggi && j % 8 == 0)) {
                    dati = [];
                    var string = "Day: " + d + "\nAt: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\nMinimum temperature: " + min + "°C" + "\nMaximum temperature: " + max + "°C" + " \nWind: " + vento + "m/s" + "\n\n";
                    dati.push(string);
                    dati_completi.push(string);
                    j++;
                }
                else if (d != oggi && j % 8 != 0 && j % 8 != 7) {
                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\nMinimum temperature: " + min + "°C" + "\nMaximum temperature: " + max + "°C" + " \nWind: " + vento + "m/s" + "\n\n";
                    dati.push(string);
                    dati_completi.push(string);
                    j++;
                }
                else if (d != oggi && j % 8 == 7) {
                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\nMinimum temperature: " + min + "°C" + "\nMaximum temperature: " + max + "°C" + " \nWind: " + vento + "m/s" + "\n\n";
                    dati.push(string);
                    j++;
                    bot.sendMessage(chat_id, dati.join("\n"));
                    dati_completi.push(string);
                }
            }
            dati_completi = JSON.stringify(dati_completi);
            fs.writeFileSync("next.json", dati_completi);
        });
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "There is an error!\n" + error.message);
    });
});


//funzioni per calcolare le date
function calcolaDomani() {
    var giorno = "";
    var date = new Date();
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    day = parseInt(day, 10);
    var tomorrow = day + 1;
    if (tomorrow < 10) {
        giorno = "0" + tomorrow;
    }
    else {
        giorno = tomorrow;
    }
    return giorno;
}

function calcolaDopoDomani() {
    var giorno = "";
    var date = new Date();
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    day = parseInt(day, 10);
    var tomorrow = day + 2;
    if (tomorrow < 10) {
        giorno = "0" + tomorrow;
    }
    else {
        giorno = tomorrow;
    }
    return giorno;
}

function calcolaData() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    var today = year + "-" + month + "-" + date;
    return today;
}