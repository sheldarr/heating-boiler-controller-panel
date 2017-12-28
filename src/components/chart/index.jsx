import React from 'react';
import { Line } from 'react-chartjs-2';

class Chart extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            chartData: {
              labels: [],
              datasets: []
            },
            chartOptions: {},
            intervalId: null
        };
    }

    componentWillMount() {
        const intervalId = setInterval(this.updateData.bind(this), 1000);

        this.setState({
            intervalId
        });
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId);
    }

    updateData() {
        this.setState({
            chartData: {
                labels: ['example-label-1', 'example-label-2'],
                datasets: [{
                    label: 'example-dataset',
                    data: [1, 2]
                }]
            }
        })
    }

    render() {
        return <Line data={this.state.chartData} options={this.state.chartOptions} />
    }
};

export default Chart;