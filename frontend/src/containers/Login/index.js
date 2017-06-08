import React, { Component } from 'react';
import userApi from 'api/user';
import { setUser } from 'actions/user';
import { dispatch } from 'store/store'; 
import dataLoader from 'api/dataLoader';
import userUtil from 'utility/user';
import localStore from 'utility/localStore';
import input from 'utility/input';


class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disabled: false,
            error: null,
        }
        this.inputs={};
    }

    componentDidMount() {
        this.inputs['name'].focus();
    }

    handleKeyPress(name, event) {
        const code = event.which;

        if(code !== 13) {
            return;
        }

        const username = this.inputs['name'].value;
        const password = this.inputs['password'].value;

        if(input.isEmpty(username)) {
            this.inputs['name'].focus();
            return;
        }

        if(input.isEmpty(password)) {
            this.inputs['password'].focus();
            return;
        }

        this.handleSubmit.call(this);
    }

    handleSubmit() {
        const username = this.inputs['name'].value;
        const password = this.inputs['password'].value;

        userApi.login({
            username,
            password
        })
        .then(
            () => {
                // set user to the localStorage if login succeed
                userUtil.setUserToLocalStorage(username);
                dispatch(setUser({name: username}))
                // redirect to the home page
                dataLoader.loadAll();
                const prevLocation = localStore.getItem('currentLocation');
                if(prevLocation != null && prevLocation !== '/sign_in') {
                    this.props.router.push(prevLocation);
                }else {
                    this.props.router.push('/');
                }

                localStore.setItem('currentLocation', null);
            },
            error => {
                console.error(error)
                this.setState({
                    disabled: false,
                    error: error.message
                })
            }
        )
    }

    render() {
        const props = this.props;
        const { disabled, error } = this.state;

        return (
            <div className='login'>
                <div className='title'>Login</div>
                <div className='content-align'>
                    <input
                        type='text'
                        placeholder='user name'
                        onKeyDown={ this.handleKeyPress.bind(this, 'name') }
                        ref={ input => this.inputs['name'] = input }
                    />
                    <input
                        type='password'
                        placeholder='password'
                        onKeyDown={ this.handleKeyPress.bind(this, 'password') }
                        ref={ input => this.inputs['password'] = input }
                    />
                    <div className='error'>{ error }</div>
                    <div 
                            className={ 'login-button button yes' + (disabled?' button-waiting':'')}
                            onClick={ this.handleSubmit.bind(this) }
                    >
                        { disabled? 'Communiting': 'Submit' }
                    </div>
                </div>
            </div>
        )
    }

}

export default Login;