const axios = require('axios');
const winston = require('winston');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const uuidv4 = require('uuid/v4');
const CronJob = require('cron').CronJob;
const moment = require('moment');

require('dotenv').config();

winston.configure({
    transports: [
        new winston.transports.Console({
            colorize: true
        })
    ]
});


const adapter = new FileSync('var/db.json')
const db = low(adapter)

db
    .defaults({})
    .write();

const sensors = process.env.SENSORS.split(' ').map((sensor) => {
    return {
        id: sensor.split('|')[0],
        host: sensor.split('|')[1],
        path: sensor.split('|')[2]
    }
})

winston.info(`Configured sensors ${JSON.stringify(sensors)}`);

sensors.forEach((sensor) => {
    const sensorKey = `sensor.${sensor.id}`;
    if (db.has(sensorKey).value()) {
        return;
    }
    
    db.set(sensorKey, []).write();
});

new CronJob(process.env.CRON, () => {
    const timestamp = Date.now();

    sensors.forEach((sensor) => {
        const requestUrl = `http://${sensor.host}${sensor.path}`;

        winston.info(`${moment(timestamp).format()} GET ${requestUrl}...`);
        
        axios
            .get(requestUrl)
            .then((response) => {
                winston.info(`Response: ${JSON.stringify(response.data)}`);
                db.get(`sensor.${sensor.id}`)
                    .push(Object.assign({}, response.data, {
                        id: uuidv4(),
                        timestamp,
                        date: moment(timestamp).format()
                    }))
                    .write();
            })
            .catch((error) => {
                winston.error(error);
            });
    })
}, null, true);

const express = require('express')
const morgan = require('morgan');
const application = express()

application.use(morgan('combined', {
    stream: {
        write: (message) => {
            winston.info(message);
        }
    }
}));

application.set('view engine', 'pug');

application.use('/public', express.static('build'))

application.get(
    '/',
    (request, response) => {
        response.render('index', {
            title: 'heating-boiler-controller-panel'
        });
    }
);

application.get(
    '/api/sensor/:sensorId',
    (request, response) => {
        const sensor = db.get(`sensor.${request.params.sensorId}`).value();

        response.send(sensor);
    }
);

application.listen(
    process.env.PORT,
    () => {
        winston.info(`Application running on port ${process.env.PORT}`);
    }
);