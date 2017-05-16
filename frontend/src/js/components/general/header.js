import React, { Component } from 'react'
import { Link } from 'react-router'


export default class Header extends Component {

    render() {
        return (
            <div className="header">
                <div className="title">
                    <div className="logo flaticon-storing"></div>
                    <div className="text">MongoBackup Manager</div>
                </div>
                <div className="navigation">
                    <Link to="/" className="link"><div className="item">Dashboard</div></Link>
                    <Link to="/newConfig" className="link"><div className="item">New Backup</div></Link>
                </div>
            </div>
        )
    }
}