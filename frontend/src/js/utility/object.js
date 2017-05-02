const object = {

    filterArrWithKeyValue: (key, value, arr) => {
        if(typeof key == "string") {
            key = [key];
        }

        return arr.filter(d => {
                    for(let i = 0; i < key.length; i++) {
                        d = d[key[i]];
                        if(d == undefined) {
                            return false;
                        }
                    }

                    return d == value;
                })
    },

    clone: (obj) => {
       return JSON.parse(JSON.stringify(obj))
    },

    assign: (key, value, obj) => {
        if(!Array.isArray(key)) {
            obj[key] = value;
            return;
        }

        object.nestedAssign(key, value, obj);
    },
    
    nestedAssign: (keys, value, obj, i=0) => {
        if(i == keys.length - 1) {
            obj[keys[i]] = value;
            return;
        }

        object.nestedAssign(keys, value, obj[keys[i]], i + 1);
    },

    isValuesEmpty: (obj) => {

        if(typeof obj !== "object") {
            return obj == null;
        }

        for(const k in obj) {
            if(obj[k] != null) {
                return false;
            }
        }
        return true;
    },

    updateArrWithKeyValue: (key, value, arr, obj) => {
        const filteredArr = arr.filter(o => {
            return o[key] != value
        });

        if(obj == null) {
            return filteredArr;
        }

        if(Array.isArray(obj)) {
            for(const k in obj ) {
                filteredArr.push(obj[k])
            }
        }else {
            filteredArr.push(obj)
        }

        return filteredArr;
    }
};

export default object;

