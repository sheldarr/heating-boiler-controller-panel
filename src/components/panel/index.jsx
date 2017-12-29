import React from 'react';
import Chart from '../chart/index.jsx';

class Panel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fan: false,
            setpoint: null,
            hysteresis: null
        }
    }
    render() {
        return (
            <div class="container">
                <div class="row">
                    <div class="column">
                        <h1>heating-boiler-controller-plugin</h1>
                    </div>
                </div>
                <div class="row">
                    <div class="column">
                        <span> Fan: { this.fan ? 'ON' : 'OFF' } </span>
                    </div>
                    <div class="column">
                        <span> Setpoint: { this.state.setpoint } </span>
                    </div>
                    <div class="column">
                        <span> Hysteresis: { this.state.hysteresis } </span>
                    </div>
                    <div class="column">
                        <button type="button">
                            Refresh
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="column">
                        <Chart />
                    </div>
                </div>
            </div>
        );
    }
}

export default Panel;