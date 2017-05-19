import React, { Component } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Legend, Bar } from 'recharts';


export default class Chart extends Component {

    render() {
        const data = this.props.data;
        return (
            <div className="backup-statistics-chart">
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={ data }
                    >
                        <XAxis dataKey='name'/>
                        <YAxis />
                        <CartesianGrid strokeDasharray='3 3'/>
                        <Bar dataKey="value" fill="#8884d8"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )
    }
}