const dom = {

    removeDOMById: (id) => {
        const modal = document.getElementById(id);
        if(modal) {
            document.body.removeChild(modal);
        }
    }

};

export default dom;