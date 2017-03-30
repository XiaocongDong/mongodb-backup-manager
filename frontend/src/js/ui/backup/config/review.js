import React, { Component } from 'react';

export default class Review extends Component {
    render() {
        return (
            <div className="form review-form">
                <div className="footer">
                    <div className="button big no button-left" onClick = { this.props.onClickBack }>Go Back</div>
                    <div className="button big yes button-right" onClick = { this.props.onClickSubmit }>Submit</div>
                </div>
            </div>
        )
    }
}