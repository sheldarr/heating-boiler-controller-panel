import axios from 'axios';
import moment from 'moment';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

import Chart from '../chart/index.jsx';
import config from '../../config/index.json';

class Panel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fanOn: false,
            setpoint: 20,
            hysteresis: 2,
            power: 50,
            mode: 'NORMAL',
            measurementsChartData: {
                labels: [],
                datasets: []
            },
            lastMeasurements: 1440
        }

        this.getMeasurements = this.getMeasurements.bind(this);
        this.handleSetpointChange = this.handleSetpointChange.bind(this);
        this.handleHysteresisChange = this.handleHysteresisChange.bind(this);
        this.handlePowerChange = this.handlePowerChange.bind(this);
        this.handleModeChange = this.handleModeChange.bind(this);
        this.handleLastMeasurementsChange = this.handleLastMeasurementsChange.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
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

        axios
            .get(config.server.api.controller.settings)
            .then((response) => {
                const { data } = response;
                
                this.setState({
                    setpoint: data.setpoint,
                    hysteresis: data.hysteresis,
                    mode: data.mode,
                    fanOn: data.fanOn,
                    power: data.power
                });
            })
            .catch((error) => {
                toast.error(error.toString());
            });
        config.sensors.forEach((sensor) => {
            axios
                .get(`${config.server.api.sensor}/${sensor.id}`)
                .then((response) => {
                    const data = response.data.slice(-this.state.lastMeasurements) || [];

                    this.setState({
                        measurementsChartData: {
                            labels: data.map((entry) => {
                                return moment(entry.timestamp).format('HH:mm:ss');
                            }),
                            datasets: [
                                ...this.state.measurementsChartData.datasets,
                                {
                                    label: sensor.label,
                                    data: data.map((entry) => {
                                        return entry.value
                                    }),
                                    backgroundColor: sensor.color,
                                    borderColor: sensor.color,
                                    fill: false
                                }
                            ]
                        }
                    })
                })
                .catch((error) => {
                    toast.error(error.toString());
                });
        });
    }

    handleSetpointChange(event) {
        this.setState({
            setpoint: event.target.value
        });
    }

    handleHysteresisChange(event) {
        this.setState({
            hysteresis: event.target.value
        });
    }

    handleModeChange(event) {
        this.setState({
            mode: event.target.value
        });
    }

    handlePowerChange(event) {
        this.setState({
            power: event.target.value
        });
    }

    handleLastMeasurementsChange(event) {
        this.setState({
            lastMeasurements: event.target.value
        });
    }

    saveSettings() {
        axios.post(config.server.api.controller.settings, {
                setpoint: this.state.setpoint,
                hysteresis: this.state.hysteresis,
                power: this.state.power,
                mode: this.state.mode
            })
            .then((response) => {
                toast.success('Settings saved!');
            })
            .catch((error) => {
                toast.error(error.toString());
            });
    }

    render() {
        return (
            <div>
                <section className="hero is-primary">
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">
                                heating-boiler-controller-panel
                            </h1>
                            <h2 className="subtitle">
                                v1.0
                            </h2>
                            <ToastContainer />
                        </div>
                    </div>
                </section>
                <section className="section">
                    <div className="container">
                        <div className="columns">
                            <div className="column">
                                <div className="field">
                                    <label className="label" htmlFor="mode">Mode</label>
                                    <div className="control">
                                        <div className="select">
                                            <select
                                                className="select" 
                                                id="mode"
                                                value={this.state.mode}
                                                onChange={this.handleModeChange}
                                            >
                                                <option value="NORMAL">NORMAL</option>
                                                <option value="FORCED_FAN_ON">FORCED_FAN_ON</option>
                                                <option value="FORCED_FAN_OFF">FORCED_FAN_OFF</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="tags has-addons">
                                        <span className="tag is-primary">FAN</span>
                                        { this.state.fanOn 
                                            ? <span className="tag is-success">ON</span>
                                            : <span className="tag is-danger">OFF</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label" htmlFor="setpoint">Setpoint</label>
                                    <div className="control">
                                        <input
                                            className="input" 
                                            id="setpoint"
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="0.1"
                                            value={this.state.setpoint}
                                            onChange={this.handleSetpointChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label" htmlFor="hysteresis">Hysteresis</label>
                                    <div className="control">
                                        <input
                                            className="input"
                                            id="hysteresis"
                                            type="number"
                                            min="1"
                                            max="10"
                                            step="0.5"
                                            value={this.state.hysteresis}
                                            onChange={this.handleHysteresisChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label" htmlFor="last-measurements">Last measurements</label>
                                    <div className="control">
                                        <input 
                                            className="input"
                                            id="last-measurements"
                                            type="number"
                                            value={this.state.lastMeasurements}
                                            onChange={this.handleLastMeasurementsChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="field">
                                    <label className="label" htmlFor="power">Power</label>
                                    <div className="control">
                                        <input 
                                            className="input"
                                            id="power"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={this.state.power}
                                            onChange={this.handlePowerChange} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="buttons">
                                    <button className="button is-primary" type="button" onClick={this.getMeasurements}>
                                        Refresh
                                    </button>
                                    <button className="button is-primary" type="button" onClick={this.saveSettings}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="section">
                    <div className="container">
                        <Chart data={this.state.measurementsChartData} />
                    </div>
                </section>
            </div>
        );
    }
}

export default Panel;