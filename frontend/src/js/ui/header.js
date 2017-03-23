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
                    <div><Link to="/dashboard" className="link">Dashboard</Link></div>
                    <div><Link to="/newConfig" className="link">New Backup</Link></div>
                </div>
            </div>
        )
    }
}