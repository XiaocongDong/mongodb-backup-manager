import React, { Component } from 'react';
import colorPicker from './colorPicker';
import dom from './dom';

const modal = {

    getIcon: (type) => {
        let iconHTML = null;

        switch (type) {
            case 'ok':
                iconHTML = `<div class="icon"><i class="fa fa-check" aria-hidden="true"></i></div>`;
                break;
            case 'info':
                iconHTML = `<i class="fa fa-info" aria-hidden="true"></i></div>`;
                break;
            case 'caution':
                iconHTML = `<i class="fa fa-exclamation" aria-hidden="true"></i>`;
                break;
            case 'error':
                iconHTML = `<i class="fa fa-times" aria-hidden={ true }></i>`;
                break;
        }

        return dom.createDiv('icon', iconHTML);
    },

    getButton: (button) => {
        const buttonDOM = dom.createDiv('operation', button.text);
        buttonDOM.addEventListener('click', button.onClick);
        return buttonDOM;
    },

    getButtons: (buttons) => {
        const buttonsWrapper = dom.createDiv('operations', null);
        for(let button of buttons) {
            buttonsWrapper.appendChild(modal.getButton(button));
        }
        return buttonsWrapper;
    },

    getContent: (props) => {
        const contentDOM = dom.createDiv('content', null);
        contentDOM.style.backgroundColor = colorPicker.getColorWithType(props.type);
        contentDOM.appendChild(modal.getIcon(props.type));
        (props.title) && (contentDOM.appendChild(dom.createDiv('title', props.title)));
        (props.text) && (contentDOM.appendChild(dom.createDiv('text', props.text)));
        return contentDOM;
    },

    getOverlay: () => {
        return dom.createDiv('modal-overlay', null);
    },

    getModal: (props) => {
        const modalDOM = dom.createDiv('modal', null);
        modalDOM.className += ' pop-in';
        modalDOM.appendChild(modal.getContent(props));
        (props.buttons && props.buttons.length > 0) && (modalDOM.appendChild(modal.getButtons(props.buttons)));
        return modalDOM;
    },

    create: (props) => {
        const modalContainer = dom.createDiv('modal-container', null);
        modalContainer.appendChild(modal.getOverlay());
        modalContainer.appendChild(modal.getModal(props));
        return modalContainer;
    }

};


const modalController = {

    modal: null,
    animationTime: 500,

    closeModal: () => {
        return new Promise(resolve => {
            if(modalController.modal) {
                const modal = modalController.modal.getElementsByClassName('modal')[0];
                modal.className += ' pop-out';
                setTimeout(() => {
                    document.body.removeChild(modalController.modal);
                    modalController.modal = null;
                    resolve();
                }, modalController.animationTime)
            }else {
                resolve();
            }
        });

    },

    showModal: (props) => {
        modalController.closeModal()
                       .then(() => {
                           modalController.modal = modal.create(props);
                           document.body.appendChild(modalController.modal);
                       });
    }

};

export default modalController;