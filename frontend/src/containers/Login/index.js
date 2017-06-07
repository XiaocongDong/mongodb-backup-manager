import React, { Component } from 'react';
import userApi from 'api/user';
import { setUser } from 'actions/user';
import { dispatch } from 'store/store'; 
import dataLoader from 'api/dataLoader';
import userUtil from 'utility/user';


class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disbaled: false,
            error: null,
        }
        this.inputs={};
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
                this.props.router.push('/');  
            },
            error => {
                console.error(error)
                this.setState({
                    disbaled: false,
                    error: error.message
                })
            }
        )
    }

    render() {
        const props = this.props;
        const { disbaled, error } = this.state;

        return (
            <div className='login'>
                <div className='title'>Login</div>
                <div className='content-align'>
                    <input
                        type='text'
                        placeholder='user name'
                        ref={ input => this.inputs['name'] = input }
                    />
                    <input
                        type='password'
                        placeholder='password'
                        ref={ input => this.inputs['password'] = input }
                    />
                    <div className='error'>{ }</div>
                    <div 
                            className={ 'login-button button yes' + (disbaled?' disabled':'')}
                            onClick={ this.handleSubmit.bind(this) }
                    >
                        Submit
                    </div>
                </div>
            </div>
        )
    }

}

export default Login;