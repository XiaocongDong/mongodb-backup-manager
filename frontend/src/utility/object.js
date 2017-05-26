import input from './input';


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

    cloneWithKeysFilter: (obj, keys) => {
        let removedKeys = [];
        let ret = object.clone(obj);

        for(let k in obj) {
            if (!keys.includes(k)) {
                removedKeys.push(k);
            }
        }


        for(let rmKey of removedKeys) {
            delete ret[rmKey];
        }

        return ret;
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

        if(input.isEmpty(obj)) {
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
    },

    prettifyArr(arr) {
        let ret = "";

        if(!arr) {
            return
        }

        for(let e of arr) {
            ret += JSON.stringify(e, undefined, 8) + '\n'
        }

        if(ret.length !== 0) {
            ret = ret.substring(0, ret.length - 1);
        }

        return ret;
    },

    sortArrByKey(arr, key, order) {
        if(!key || !order) {
            return arr;
        }

        return arr.sort((a, b) => {
            let ret;
            
            ret = a[key] > b[key]? 1: a[key] < b[key]? -1: 0;   

            if(order === 'desc') {
                ret = -ret
            }

            return ret;
        })
    }
};

export default object;
