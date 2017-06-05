import React, { Component } from 'react';
import { connect } from 'react-redux'; 


class Loading extends Component {

    render() {
        const props = this.props;

        if(!props.loading) {
            return null;
        }

        return (
            <div className='loading'>
                <div className='text' data-text='loading...'>
                    Loading...
                </div>
            </div>
        )
    }

}

const mapStateToProps = state => {
    // get the total number of data that need to be loaded
    let loaded = state.get('data').getIn(['loaded', 'data'])

    return (
        {
            loading: !loaded
        }
    )
} 

const mapDispatchToProps = dispatch => {
    return (
        {

        }
    )
}

const Container = connect(mapStateToProps, mapDispatchToProps)(Loading);

export default Container;