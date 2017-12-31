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
            setpoint: 20,
            hysteresis: 2,
            measurementsChartData: {
                labels: [],
                datasets: []
            },
            lastMeasurements: 1440
        }

        this.getMeasurements = this.getMeasurements.bind(this);
        this.handleLastMeasurementsChange = this.handleLastMeasurementsChange.bind(this);
    }

    componentWillMount() {
        this.getMeasurements();
    }

    getMeasurements() {
        this.setState({
            measurementsChartData: {
                labels: this.state.measurementsChartData.labels,
                datasets: []
            }
        });

        config.sensors.forEach((sensor) => {
            axios
                .get(`${config.server.api.sensor}/${sensor.id}`)
                .then((response) => {
                    const data = response.data.slice(-this.state.lastMeasurements) || [];

                    this.setState({
                        fan: !this.state.fan,
                        setpoint: data.length ? data[data.length - 1].setpoint : 20,
                        hysteresis: data.length ? data[data.length - 1].hysteresis : 2,
                        measurementsChartData: {
                            labels: data.map((entry) => {
                                return moment(entry.timestamp).format('HH:mm:ss');
                            }),
                            datasets: [
                                ...this.state.measurementsChartData.datasets,
                                {
                                    label: sensor.label,
                                    data: data.map((entry) => {
                                        return entry.temperature
                                    }),
                                    backgroundColor: sensor. color,
                                    borderColor: sensor.color,
                                    fill: false
                                }
                            ]
                        }
                    })
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }

    handleLastMeasurementsChange(event) {
        this.setState({
            lastMeasurements: event.target.value
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
                        <div>Fan { this.state.fan ? 'ON' : 'OFF'}</div>
                    </div>
                    <div className="column">
                        <label htmlFor="setpoint">Setpoint</label>
                        <input 
                            id="setpoint"
                            type="number"
                            min="1"
                            max="100"
                            step="0.1"
                            value={this.state.setpoint}
                            onChange={this.handleLastMeasurementsChange} 
                        />
                    </div>
                    <div className="column">
                    <label htmlFor="hysteresis">Hysteresis</label>
                        <input 
                            id="hysteresis"
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={this.state.hysteresis}
                            onChange={this.handleLastMeasurementsChange} 
                        />
                    </div>
                    <div className="column">
                        <label htmlFor="last-measurements">Last measurements</label>
                        <input 
                            id="last-measurements"
                            type="number"
                            value={this.state.lastMeasurements}
                            onChange={this.handleLastMeasurementsChange} 
                        />
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