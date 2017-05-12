import React, { Component } from 'react';
import colorPicker from './colorPicker';
import dom from './dom';

const modal = {

    getTitle: (title, type) => {
        const titleDOM = dom.createDiv('title', title);
        titleDOM.style.backgroundColor = colorPicker.getColorWithType(type);
        return titleDOM;
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
        const titleDOM = modal.getTitle(props.title, props.type);
        contentDOM.appendChild(titleDOM);
        contentDOM.appendChild(dom.createDiv('text', props.text));
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

    closeModal: (animate=true) => {
        return new Promise(resolve => {

            if(modalController.modal) {

                if(animate) {
                    const modal = modalController.modal.getElementsByClassName('modal')[0];

                    modal.className += ' pop-out';
                    setTimeout(() => {
                        modalController.removeModal();
                        resolve();
                    }, modalController.animationTime)

                }else {
                    modalController.removeModal();
                }

            }else {
                resolve();
            }
        });

    },

    removeModal: () => {
        document.body.removeChild(modalController.modal);
        modalController.modal = null;
    },

    showModal: (props) => {
        modalController.closeModal(false)
                       .then(() => {
                           modalController.modal = modal.create(props);
                           document.body.appendChild(modalController.modal);
                       });
    }

};

export default modalController;