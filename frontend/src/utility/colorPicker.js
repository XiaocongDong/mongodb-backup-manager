const red = '#ed281a';
const green = '#4cd139';
const yellow = '#fff23f';
const blue = '#2a9ced';

const statusColorMap =  {
    'PENDING': yellow,
    'WAITING': blue,
    'RUNNING': green,
    'STOP': red
};

const keyColorMap = {
    "total": blue,
    "success": green,
    "failures": red
};

const resultColorMap = {
    "SUCCEED": green,
    "FAILED": red
};

const modalTypeColorMap = {
    'ok': green,
    'info': blue,
    'caution': yellow,
    'error': red
};

const colorPicker = {

   getColorWithStatus: (status) => {
        return statusColorMap[status];
   },

   getColorWithKey: (key) => {
        return keyColorMap[key];
   },

   getColorWithResult: (result) => {
        return resultColorMap[result];
   },

   getColorWithType: (type) => {
        return modalTypeColorMap[type];
   }

};

export default colorPicker;