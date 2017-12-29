import axios from 'axios';
import moment from 'moment';
import React from 'react';

import Chart from '../chart/index.jsx';
import config from '../../config/index.json';

class Panel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fan: false,
            setpoint: null,
            hysteresis: null,
            measurementsChartData: {
                labels: [],
                datasets: []
            }
        }

        this.getMeasurements = this.getMeasurements.bind(this);
    }

    componentWillMount() {
        this.getMeasurements();
    }

    getMeasurements() {
        config.sensors.forEach((sensor) => {
            console.log(sensor);
            axios
                .get(`http://localhost:6060/api/measurements`)
                .then((response) => {
                    const data = response.data.slice(-1024);

                    this.setState({
                        fan: !this.state.fan,
                        setpoint: data[data.length - 1].setpoint,
                        hysteresis: data[data.length - 1].hysteresis,
                        measurementsChartData: {
                            labels: data.map((entry) => {
                                return moment(entry.timestamp).format('HH:mm:ss');
                            }),
                            datasets: [{
                                label: sensor.label,
                                data: data.map((entry) => {
                                    return entry.temperature
                                }),
                                backgroundColor: sensor. color,
                                borderColor: sensor.color,
                                fill: false
                            }]
                        }
                    })
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="column">
                        <h1>heating-boiler-controller-plugin</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <span> Fan: {this.fan ? 'ON' : 'OFF'} </span>
                    </div>
                    <div className="column">
                        <span> Setpoint: {this.state.setpoint} </span>
                    </div>
                    <div className="column">
                        <span> Hysteresis: {this.state.hysteresis} </span>
                    </div>
                    <div className="column">
                        <button type="button" onClick={this.getMeasurements}>
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <Chart data={this.state.measurementsChartData} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Panel;