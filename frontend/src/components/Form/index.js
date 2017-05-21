import React, { Component } from 'react';


export default class Form extends Component {

    render() {
        const { title, items, buttons, error, className, showHistory } = this.props;

        return (
            <div className={"form " + (className? className: "")}>
                {
                    title && <div className="form-title">{ title }</div>
                }
                <div className="form-content">
                    {
                        items.map((item, i) => {
                            return (
                                <div className="item" key={ i }>
                                    { item }
                                </div>
                            )
                        })
                    }
                </div>
                <div className="form-footer clear-fix">
                    {
                        (error) &&
                        <div className="error-message">
                            { error }
                        </div>
                    }
                    {
                        (buttons) &&
                        <div className="buttons-wrapper">
                            { buttons.map((button, index) => (<div key={ index }>{ button }</div>)) }
                        </div>
                    }
                </div>
            </div>
        )

    }
}