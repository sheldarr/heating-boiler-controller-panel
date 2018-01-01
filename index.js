const axios = require('axios');
const winston = require('winston');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const uuidv4 = require('uuid/v4');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const express = require('express')
const morgan = require('morgan');
const bodyParser = require('body-parser');

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
    .defaults({
        'controller.settings': {},
        'sensor.input': [],
        'sensor.output': []
    })
    .write();

const controller = {
    host: process.env.CONTROLLER.split('|')[0],
    path: process.env.CONTROLLER.split('|')[1]
};

winston.info(`Configured controller ${JSON.stringify(controller)}`);

new CronJob(process.env.CRON, () => {
    const timestamp = Date.now();
    const requestUrl = `http://${controller.host}${controller.path}`;

    winston.info(`${moment(timestamp).format()} GET ${requestUrl}...`);
    
    axios
        .get(requestUrl)
        .then((response) => {
            winston.info(`Response: ${JSON.stringify(response.data)}`);

            db.get('sensor.output')
                .push({
                    id: uuidv4(),
                    timestamp,
                    date: moment(timestamp).format(),
                    value: response.data.outputTemperature
                })
                .write();
            db.get('sensor.input')
                .push({
                    id: uuidv4(),
                    timestamp,
                    date: moment(timestamp).format(),
                    value: response.data.inputTemperature
                })
                .write();
            db.set('controller.settings', {
                setpoint: response.data.setpoint,
                hysteresis: response.data.hysteresis,
                mode: response.data.mode,
                fanOn: response.data.fanOn,
            }).write();
        })
        .catch((error) => {
            winston.error(error);
        });
}, null, true);

const application = express()

application.use(morgan('combined', {
    stream: {
        write: (message) => {
            winston.info(message);
        }
    }
}));

application.use(bodyParser.json())

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

application.get(
    '/api/controller/settings',
    (request, response) => {
        const settings = db.get('controller.settings').value();

        response.send(settings);
    }
);

application.post(
    '/api/controller/settings',
    (request, response) => {
        const settings = request.body;
        
        if (!settings.setpoint || !settings.hysteresis || !settings.mode) {
            return response.sendStatus(400);
        }

        winston.info(`Saving settings to controller ${JSON.stringify(settings)}`);

        const requestUrl = `http://${controller.host}${controller.path}`;

        axios
            .post(requestUrl, `${settings.setpoint} ${settings.hysteresis} ${settings.mode}`)
            .then((sensorResponse) => {
                winston.info(`Response: ${JSON.stringify(sensorResponse.data)}`);

                return response.sendStatus(200);
            })
            .catch((error) => {
                winston.error(error);
                return response.sendStatus(500);
            });
    }
);

application.listen(
    process.env.PORT,
    () => {
        winston.info(`Application running on port ${process.env.PORT}`);
    }
);