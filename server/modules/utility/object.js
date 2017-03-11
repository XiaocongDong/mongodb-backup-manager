let object = {};

object.selfish = (target) => {
    const cache = new WeakMap();
    const handler = {
        get (target, key) {
            const value = Reflect.get(target, key);
            if(typeof value != 'function') {
                return value;
            }
            if(!cache.has(value)) {
                cache.set(value, value.bind(target));
            }
            return cache.get(value);
        }
    };
    const proxy = new Proxy(target, handler);
    return proxy;
};


object.deployPromiseFinally = () => {
    Promise.prototype.finally = function (callback) {
    const P = this.constructor;
    return this.then(
        value  => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
    );
    };
};

module.exports = object;
