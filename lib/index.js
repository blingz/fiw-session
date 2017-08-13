let kv = require('fib-kv');
let util = require('util');
let uuid = require('uuid');

let utils = require('./utils');

let print = console.warn.bind(console);

function send_error(res, code, msg) {
    res.status = 400;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({
        error: 'Bad Request',
        status: code,
        message: msg,
    }));
    res.end();
}

function session(conn, opts = {}) {
    let store = (function() {
        let kv_db = new kv(conn, opts);
        kv_db.setup();
        let timers = {};
        let cache = new util.LruCache(utils.cache_size(opts), utils.cache_timeout(opts));

        let fetch = sid => {
            let v = cache.get(sid, sid => JSON.parse(kv_db.get(sid)));
            cache.set(sid, v);
            return v;
        };

        let update = (sid, obj) => {
            cache.set(sid, obj);
            if (timers[sid])
                return sid;

            timers[sid] = setTimeout(() => {
                kv_db.set(sid, JSON.stringify(obj));
                delete timers[sid];
            }, utils.cache_delay(opts));

            return sid;
        };

        let remove = (sid) => {
            if (!sid) return false;
            timers[sid] && timers[sid].clear();
            delete timers[sid];
            cache.remove(sid);
            kv_db.remove(sid);
            return true;
        };

        return {
            get: fetch,
            set: update,
            remove: remove,
        };
    }());

    let req = {};

    let handler = {
        set: (target, key, value) => {
            target[key] = value;
            target.sessionid && store.set(target.sessionid, req.session);
            return target.sessionid;
        },
        deleteProperty: (target, key) => {
            delete target[key];
            return target.sessionid && store.set(target.sessionid, target);
        },
    };

    // for test
    this.store = store;

    this.get = sid => store.get(sid);

    this.remove = sid => store.remove(sid);

    this.cookie_filter = (r) => {
        r.sessionid = r.cookies[utils.sid(opts)];

        let obj;
        if ( !r.sessionid || !(obj = store.get(r.sessionid)) ) {
            r.sessionid = uuid.random().hex();
            obj = {sessionid: r.sessionid}
            store.set(r.sessionid, obj);

            r.response.addCookie({
                name: utils.sid(opts),
                value: r.sessionid,
                expire: new Date(Date.now() + (utils.cache_timeout(opts)||900000))
                //domain:
            });
        }
        if(obj) {
            r.session = new Proxy(obj, handler);
        }
    };

    this.api_filter = (r) => {
        // TODO
    };
}

module.exports = session;
