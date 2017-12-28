import React from 'react';
import Chart from '../chart/index.jsx';

class Panel extends React.Component {
    render() {
        return (
            <div>
                <div>heating-boiler-controller-plugin</div>
                <div>
                    <Chart />
                </div>
            </div>
        );
    }
}

export default Panel;