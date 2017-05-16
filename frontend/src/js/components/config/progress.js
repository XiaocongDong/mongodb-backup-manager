import React, { Component } from 'react';


const stages = ["credential", "configuration", "review"];

export default class Progress extends Component{

    render() {
        const props = this.props;

        return (
            <div className="configuration-progress">
                {
                    stages.map((stage, i) => {
                        return (
                            <div key={ i } className={ "stage" + (props.step == i? " active": "") }>
                                { stage }
                            </div>
                        )
                    })
                }
            </div>
        )
    }

}