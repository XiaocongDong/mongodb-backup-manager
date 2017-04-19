const statusColorMap =  {
    'PENDING': '#fff23f',
    'WAITING': '#2a9ced',
    'RUNNING': '#4cd139',
    'ABORTED': '#1e1f21',
    'STOP': '#ed281a'
};

const keyColorMap = {
    "total": "#2a9ced",
    "success": "#4cd139",
    "failures": "#ed281a"
};

const colorPicker = {

   getColorWithStatus: (status) => {
        return statusColorMap[status];
   },

   getColorWithKey: (key) => {
        return keyColorMap[key];
   }

};

export default colorPicker;