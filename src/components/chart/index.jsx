import React from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import moment from 'moment';

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
        const intervalId = setTimeout(() => {}, 1000);
        this.updateData();

        this.setState({
            intervalId
        });
    }

    componentWillUnmount(){
        clearInterval(this.state.intervalId);
    }

    updateData() {
        axios
            .get(`http://localhost:6060/api/measurements`)
            .then((response) => {
                this.setState({
                    chartData: {
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
        return <Line data={this.state.chartData} options={this.state.chartOptions} />
    }
};

export default Chart;