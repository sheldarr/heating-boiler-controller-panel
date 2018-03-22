import React from 'react';
import { Line } from 'react-chartjs-2';
import { object } from 'prop-types';

class Chart extends React.Component {
    static propTypes = {
        data: object
    }

    constructor(props) {
        super(props);
    }

    render() {
        return <Line data={this.props.data} options={{maintainAspectRatio: true}}/>
    }
}

export default Chart;