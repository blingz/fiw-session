exports.cache_size = opts => opts.session_cache_size !== undefined ? opts.session_cache_size : 65536;

exports.cache_timeout = opts => opts.session_cache_timeout !== undefined ? opts.session_cache_timeout : 900000;

exports.cache_delay = opts => opts.session_cache_delay !== undefined ? opts.session_cache_delay : 100;

exports.sid = opts => opts.session_id_name !== undefined ? opts.session_id_name : 'sessionID';

// jwt config
exports.jwt_enabled = opts => opts.session_jwt_enabled===true ? true : false;
exports.jwt_sid = opts => opts.session_jwt_id_name !== undefined ? opts.session_jwt_id_name : 'jwt';
exports.jwt_verify = opts => require('util').isFunction(opts.session_jwt_verify) ? opts.session_jwt_verify : null;