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

    assign: (key, value, obj) => {
        if(!Array.isArray(key)) {
            obj[key] = value;
            return;
        }

        object.nestedAssign(key, value);
    },
    
    nestedAssign: (keys, value, obj, i=0) => {
        if(i == keys.length - 1) {
            obj[keys[i]] = value;
        }

        object.nestedAssign(keys, value, obj, i + 1);
    }
};

export default object;