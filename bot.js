const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '1295480116:AAHxAoXlJ7Y2jBpnLhntJILZj9aikSA9tH4';
const apimeteo = '397d1e8e58e381cc82d95209911bd4db';

const bot = new TelegramBot(token,
    {
        polling: true
    });

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
            text = "Elenco dei comandi disponibili:\n. Previsioni meteo per oggi in una citta' => /oggi nomecitta'\n. Previsioni meteo domani in una citta' => /domani nomecitta'\n. Previsioni meteo prossimi giorni inserendo un numero da 2 a 16 => /prossimo nomecitta numerogiorno";
        }
        if (action === '2') {
            text = "MeteoRio_bot, bot creato da Rio Alex per progetto di fine anno di TPSIT, GPOI e SISTEMI";
        }

        bot.sendMessage(msg.chat.id, text, opts);
    });
});

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