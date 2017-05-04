const dom = {

    removeDOMById: (id) => {
        const modal = document.getElementById(id);
        if(modal) {
            document.body.removeChild(modal);
        }
    },

    createDiv: (className, innerHTML) => {
        const div = document.createElement('div');
        div.className = className;
        div.innerHTML = innerHTML;
        return div;
    }

};

export default dom;