import axios from 'axios';
import moment from 'moment';
import React from 'react';

import Chart from '../chart/index.jsx';

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
        axios
            .get(`http://localhost:6060/api/measurements`)
            .then((response) => {
                this.setState({
                    fan: !this.state.fan,
                    setpoint: response.data[response.data.length - 1].setpoint,
                    hysteresis: response.data[response.data.length - 1].hysteresis,
                    measurementsChartData: {
                        labels: response.data.map((entry) => {
                            return moment(entry.timestamp).format('HH:mm:ss');
                        }),
                        datasets: [{
                            label: "Temperature Out",
                            data: response.data.map((entry) => {
                                return entry.temperature
                            })
                        }]
                    }
                })
            })
            .catch((error) => {
                console.error(error);
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