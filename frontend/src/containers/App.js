import React, { Component } from 'react';
import Header from 'components/Header';
import Content from 'components/Content';
import { connect } from 'react-redux';
import Loading from 'containers/Loading';


class App extends Component {

    render() {
        const props = this.props;

        if(!props.user && props.location.pathname != '/sign_in') {
            return null;
        }

        return (
         <div className="mongo-backup-manager">
             {
                 props.user && <Loading/>
             }
             <Header user={ props.user }/>
             <Content>
                 { props.children }
             </Content>
         </div>
        )
    }
}

const mapStateToProps = state => {
    const user = state.get('user').get('user').toJS();
    return {
        user: user.name
    }
}

const mapDispatchToProps = dispatch => {
    return {

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);