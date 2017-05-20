import React, { Component } from 'react';
import Select from 'react-select';


export default class Pagination extends Component {

    defaultLimits = [1, 10, 20, 50, 100];

    constructor(props) {
        super(props);
        this.limits = props.limits || this.defaultLimits;
        this.limitOpts = this.limits.map(limit => ({
            value: limit,
            label: limit
        }))
        this.getEnd = this.getEnd.bind(this);
    }

    onLimitChange(d) {
        this.props.onLimitChange(d.value);
    }

    onClickFirstPage() {
        if(this.props.start === 0) {
            return;
        }

        this.props.onStartChange(0);
    }

    onClickLastPage() {
        const { limit, total } = this.props;
        const end = this.getEnd()

        if(end === total - 1) {
            return;
        }

        let startAtEndPage;
        const remainder = total%limit;

        if(remainder) {
            startAtEndPage = total - (total%limit);
        }else {
            startAtEndPage = total - limit;
        }

        this.props.onStartChange(startAtEndPage);
    }

    onClickBackward() {
        const { limit, start, total } = this.props;

        if(start === 0) {
            return;
        }

        this.props.onStartChange(start - limit);
    }

    onClickForward() {
        const { limit, start, total } = this.props;
        const end = this.getEnd();

        if(end === total - 1) {
            return;
        }

        this.props.onStartChange(start + limit);
    }

    getEnd() {
        const { start, limit, total } = this.props;
        return (start + limit - 1 < total - 1)? start + limit - 1 : total - 1;
    }

    render() {
        const { start, limit, total } = this.props;
        const end = this.getEnd()

        return (
            <div className="pagination">
                <div className="pagination-arrows">
                    <i 
                        className={ "fa fa-step-backward first-page-arrow" + (start === 0 ? " arrow-disable" : " clickable") } 
                        onClick={ this.onClickFirstPage.bind(this) } 
                        aria-hidden={ true }
                    >
                    </i>
                    <i 
                        className={ "fa fa-caret-left prev-page-arrow" + (start === 0? " arrow-disable" : " clickable") }
                        onClick={ this.onClickBackward.bind(this) }
                        aria-hidden={ true }
                    >
                    </i>
                    <i 
                        className={ "fa fa-caret-right next-page-arrow" + (end === total - 1 ? " arrow-disable" : " clickable") }
                        onClick={ this.onClickForward.bind(this) }
                        aria-hidden={ true }
                    >
                    </i>
                    <i 
                        className={ "fa fa-step-forward last-page-arrow" + (end === total - 1 ?  " arrow-disable": " clickable") }
                        onClick={ this.onClickLastPage.bind(this) }
                        aria-hidden={ true }
                    >
                    </i>
                </div>
                <div className="page-limit-select">
                    <Select
                        multi={ false }
                        value={ limit }
                        clearable={ false }
                        options={ this.limitOpts }
                        onChange={ this.onLimitChange.bind(this) }
                    />
                </div>
                <div className="current-items-scope">
                    { `${start + 1} to ${ end + 1 } items` }
                </div>
                <div className="total-items">
                    {  `total ${ total }` }
                </div>
            </div>
        )
    }
}