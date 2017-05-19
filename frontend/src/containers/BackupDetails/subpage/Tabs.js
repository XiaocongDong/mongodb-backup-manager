import React, { Component } from 'react';


export default class Tabs extends Component {

    setCurrentTab(tab) {
        this.props.setCurrentTab(tab);
    }

    render() {
        const { current, tabs } = this.props;

        const tabDOMs = tabs.map((tab, index) => {
           return (
               <div
                   className={ "clickable subtitle-tab" + (tab == current? " active": "") }
                   key={ index }
                   onClick={ this.setCurrentTab.bind(this, tab) }
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


