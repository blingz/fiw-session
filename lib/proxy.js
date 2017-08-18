var util = require('util');
var jwt = require('./jwt');

module.exports = (store, o, sessionid, tmp, jwt=false) => {
    return new Proxy(o || {}, {
        set: (target, key, value) => {
            if (jwt && !util.isEmpty(target)) {
                throw new Error("Can't modify the JSON Web Token.");
            }
            if (target[key] !== value) {
                target[key] = value;
                if (!tmp && store)
                    store.set(sessionid, target);
            }
            return value;
        },
        deleteProperty: (target, key) => {
            if (jwt && !util.isEmpty(target)) {
                throw new Error("Can't modify the JSON Web Token.");
            }
            delete target[key];
            if (!tmp && store)
                store.set(sessionid, target);
        },
    });
}