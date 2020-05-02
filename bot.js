const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '1295480116:AAHxAoXlJ7Y2jBpnLhntJILZj9aikSA9tH4';
const apimeteo = '397d1e8e58e381cc82d95209911bd4db';

const bot = new TelegramBot(token,
    {
        polling: true
    });

//comando benvenuto
bot.onText(/\/start/, (msg) => {
    var benvenuto = "Benvenuto nel bot MeteoRio";

    bot.sendMessage(msg.chat.id, benvenuto);
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: "Lista Comandi", callback_data: "1" }],
                [{ text: "Info bot", callback_data: "2" }]
            ]
        })

    };
    bot.sendMessage(msg.chat.id, "Seleziona una voce", options);
    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const opts = {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
        };
        let text;

        if (action === '1') {
            text = "Elenco dei comandi disponibili:\n. Previsioni meteo per oggi in una citta' => /oggi nomecitta'\n. Previsioni meteo domani in una citta' => /domani nomecitta'\n. Previsioni meteo dopodomani => /dopodomani nomecitta\n. Previsioni meteo prossimi 5 giorni => /prossimi nomecitta";
        }
        if (action === '2') {
            text = "MeteoRio_bot, bot creato da Rio Alex per progetto di fine anno di TPSIT e GPOI";
        }

        bot.sendMessage(msg.chat.id, text, opts);
    });
});


bot.on("polling_error", (err) => console.log(err));

//comando meteo oggi
bot.onText(/\/oggi (.+)/, (msg, match) => {
    const chat_id = msg.chat.id;
    const citta = match[1] ? match[1] : "";
    http.get('http://api.openweathermap.org/data/2.5/weather?q=' + citta + '&appid=' + apimeteo, (res) => {
        let rawDat = '';
        res.on('data', (chunk) => { rawDat += chunk; });
        res.on('end', () => {
            try {
                const DatiConvertiti = JSON.parse(rawDat);
                var messaggi = [];
                DatiConvertiti.weather.forEach(function (value) {
                    messaggi.push("Meteo: " + value.description);
                });
                messaggi.push("Temperatura: " + DatiConvertiti.main.temp + "°C");
                messaggi.push("Vento: " + DatiConvertiti.wind.speed + "m/s");
                bot.sendMessage(chat_id, messaggi.join("\n"));
            } catch (error) {
                bot.sendMessage(chat_id, "Si è verificato un errore!\n" + error.message);
            }
        })
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "Si è verificato un errore!\n" + error.message);
    });
});

//comando meteo domani
bot.onText(/\/domani (.+)/, (msg, match) => {
    const chat_id = msg.chat.id;
    const citta = match[1] ? match[1] : "";
    bot.sendMessage(chat_id, "Weather for day after tomorrow in " + citta);
    http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + citta + '&appid=' + apimeteo, (res) => {
        let output = '';
        res.on('data', (chunk) => {
            output += chunk;
        });

        res.on('end', () => {
            let obj = JSON.parse(output);
            var dati = [];
            var domani = calcolaDomani();
            for (var i = 0; i < 40; i++) {
                var generale = obj.list[i].weather[0].main;
                var descrizione = obj.list[i].weather[0].description;
                var data_oggi = obj.list[0].dt_txt;
                var hour = data_oggi.substr(11, 5);
                if (data_oggi[8] == domani[0] && data_oggi[9] == domani[1]) {

                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\n\n";
                    dati.push(string);
                }
            }
            bot.sendMessage(chat_id, dati.join("\n"));
            console.log(domani)
        });
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "Si è verificato un errore!\n" + error.message);
    });
});

//comando meteo dopodomani
bot.onText(/\/dopodomani (.+)/, (msg, match) => {
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
                var date =  obj.list[i].dt_txt;
                var hour = date.substr(11, 5);
                var day = date.substr(8, 2);
                day = parseInt(day, 10);
                if (dopodomani == day) {

                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\n\n";
                    dati.push(string);
                }
            }
            bot.sendMessage(chat_id, dati.join("\n"));
        });
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "Si è verificato un errore!\n" + error.message);
    });
});

//comando meteo prossimi 5 giorni
bot.onText(/\/prossimi (.+)/, (msg, match) => {
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
            var dati = [];
            var oggi = calcolaData();
            var j = 0;
            var primo = true;
            for (var i = 0; i < 40; i++) {
                var generale = obj.list[i].weather[0].main;
                var descrizione = obj.list[i].weather[0].description;
                var data = obj.list[i].dt_txt;
                console.log(data);
                var hour = data.substr(11, 5);
                var d = data.substr(0, 10);

                if ((d != oggi && j % 8 == 0) || (d != oggi && j == 0)) {
                    var string = "Day: " + d + "\nAt: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\n\n";
                    dati.push(string);
                    j++;
                    primo == false;
                }
                else if (d != oggi && j % 8 != 0) {
                    var string = "At: " + hour + "\nGeneral info: " + generale + " \nDetails: " + descrizione + "\n\n";
                    dati.push(string);
                    j++;
                }
            }
            bot.sendMessage(chat_id, dati.join("\n"));
        });
    }).on('error', (error) => {
        bot.sendMessage(chat_id, "Si è verificato un errore!\n" + error.message);
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