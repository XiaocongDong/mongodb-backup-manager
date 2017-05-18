import React, { Component } from 'react';


export default class Draggable extends Component{

    constructor(props) {
        super(props);
        this.selectedEle = {
            top: 0,
            left: 0,
            dom: null
        };
        this.mousePageX = null;
        this.mousePageY = null;
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    }

    componentDidMount() {
        this.draggableDOM.addEventListener('mousedown', this.mouseDownHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
        this.draggableDOM.addEventListener('mouseup', this.mouseUpHandler);
    }

    componentWillUnmount() {
        this.draggableDOM.removeEventListener('mousedown', this.mouseDownHandler);
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        this.draggableDOM.removeEventListener('mouseup', this.mouseUpHandler);
    }

    mouseDownHandler(event) {
        const mouseDownDOM = event.target;
        const draggableDOM = this.getDraggableDOM(mouseDownDOM);
        if(!draggableDOM) {
            return;
        }

        const rect = draggableDOM.getBoundingClientRect();
        this.selectedEle.top = rect.top;
        this.selectedEle.left = rect.left;
        this.selectedEle.dom = draggableDOM;
        this.mousePageX = event.pageX;
        this.mousePageY = event.pageY;
    }

    mouseUpHandler(event) {
        this.selectedEle.dom = null;
    }

    getDraggableDOM(dom) {
        while(true) {
            if(dom.dataset.draggable) {
                break;
            }else {
                dom = dom.parentNode;
                if(!dom) {
                    break;
                }
            }
        }

        return dom;
    }

    mouseMoveHandler(event) {
        if(this.selectedEle.dom) {
            const currentPageX = event.pageX;
            const currentPageY = event.pageY;

            const topDelta = currentPageY - this.mousePageY;
            const leftDelta = currentPageX - this.mousePageX;

            this.selectedEle.top += topDelta;
            this.selectedEle.left += leftDelta;

            this.mousePageX = currentPageX;
            this.mousePageY = currentPageY;

            this.selectedEle.dom.style.top = this.selectedEle.top + 'px';
            this.selectedEle.dom.style.left = this.selectedEle.left + 'px';
        }
    }
}