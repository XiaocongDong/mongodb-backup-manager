import React, { Component } from 'react';
import userApi from 'api/user';


class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disbaled: false,
            error: null,
        }
    }

    handleSubmit() {
        const username = this.inputs['name'].value;
        const password = this.inputs['password'].value;

        user.userApi.login({
            username,
            password
        })
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