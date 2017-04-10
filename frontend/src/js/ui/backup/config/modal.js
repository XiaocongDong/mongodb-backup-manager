
const modal = {

    create: (type, title, message, buttons, callback) => {
        const modal =  `<div id="modal">
                            <div class="overlay">
                            </div>
                            <div class="wrapper">
                            </div>
                        </div>`;
        document.body.insertAdjacentHTML("beforeend", modal);
    },

    close: () => {
        const element = document.getElementById("modal");
        (element != null) && document.body.removeChild(element);
    }
};

export default modal;