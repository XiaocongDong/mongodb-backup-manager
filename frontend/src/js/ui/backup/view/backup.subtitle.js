import React, { Component } from 'react';


export default class BackupSubtitle extends Component {

    tabs = ["databases", "statistics", "notifications", "configurations"];

    setCurrentTab(tab) {
        this.props.setCurrentTab(tab);
    }

    render() {
        const current = this.props.current;

        const tabDOMs = this.tabs.map((tab, index) => {
           return (
               <div
                   className={ "clickable subtitle-tab" + (current == index? " active": "") }
                   key={ index }
                   onClick={ this.setCurrentTab.bind(this, index) }
               >
                   { tab }
               </div>
           )
        });

        return (
            <div className="backup-subtitle">
                { tabDOMs }
            </div>
        )
    }
}


