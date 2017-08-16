let jws = require('fib-jws');

module.exports = function (r, cookie_name) {
  return function (token) {
    if(token && token.header && token.payload && token.key) {
      // header={ alg: 'HS256' }
      // payload={uid: 12345, name: "Frank" }
      // key='FIW8JWT'
      r.response.addCookie({
            name: cookie_name || 'jwt',
            value: jws.sign(token.header, token.payload, token.key),
            //expire: 
            //domain:
        });
    }
  }
}