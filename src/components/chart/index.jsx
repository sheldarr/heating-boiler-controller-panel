import React from 'react';
import { Line } from 'react-chartjs-2';

class Chart extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Line data={this.props.data} options={{maintainAspectRatio: true}}/>
    }
};

export default Chart;