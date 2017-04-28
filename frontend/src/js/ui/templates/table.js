import React, { Component } from 'react';


export default class Table extends Component {

    render() {
        const headDefaultWidth = 100 / this.props.head.length;
        let headElements = this.props.head.map((head, index) => {
            const width = head.hasOwnProperty('width')? head.width: (headDefaultWidth + '%');
            head.width = width;

            return (
                <div key={ index }
                     className="td"
                     style={ { width } }
                >
                    { head.text }
                </div>
            )
        });
        headElements = <div className="tr">{ headElements }</div>;

        const bodyElements = this.props.body.map((ele, index) => {
            const tdDOMs = this.props.head.map((head, index) => {
                const width = head.width;
                const value = ele[head.key];

                return (
                    <div className="td" style={ {width} } key={ index }>
                        { value }
                    </div>
                )
            });

            return <div className="tr" key={ index }>{ tdDOMs }</div>
        });

        return (
            <div className="table">
                <div className="thead">
                    { headElements }
                </div>
                <div className="tbody">
                    { bodyElements }
                </div>
            </div>
        )
    }
}