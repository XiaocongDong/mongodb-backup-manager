const red = '#ed281a';
const green = '#4cd139';
const yellow = '#fff23f';
const grey = '#989ca5';
const blue = '#2a9ced';

const statusColorMap =  {
    'PENDING': yellow,
    'WAITING': blue,
    'RUNNING': green,
    'ABORTED': grey,
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

const colorPicker = {

   getColorWithStatus: (status) => {
        return statusColorMap[status];
   },

   getColorWithKey: (key) => {
        return keyColorMap[key];
   },

   getColorWithResult: (result) => {
        return resultColorMap[result];
   }

};

export default colorPicker;