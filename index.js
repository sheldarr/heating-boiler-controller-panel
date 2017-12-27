require('dotenv').config();

const axios = require('axios');
const winston = require('winston');

winston.configure({
    transports: [
        new winston.transports.Console({
            colorize: true
        })
    ]
});

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('var/db.json')
const db = low(adapter)

const uuidv4 = require('uuid/v4');

db
    .defaults({
        measurements: []
    })
    .write();

setInterval(() => {
    const requestUrl = `http://${process.env.SENSOR_IP}`;

    winston.info(`Gathering data from ${requestUrl}...`);

    axios
        .get(requestUrl)
        .then((response) => {
            winston.info(`Response: ${JSON.stringify(response.data)}`);
            db.get('measurements')
                .push(Object.assign({}, response.data, {
                    id: uuidv4(),
                    timestamp: Date.now()
                }))
                .write();
        })
        .catch((error) => {
            winston.error(error);
        });
}, process.env.INTERVAL);

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
    '/api/measurements',
    (request, response) => {
        const measurements = db.get('measurements');

        response.send(measurements);
    }
);

application.listen(
    process.env.PORT,
    () => {
        winston.info(`Application running on port ${process.env.PORT}`);
    }
);