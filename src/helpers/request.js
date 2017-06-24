import http from 'http';
import https from 'https';

/**
 * Checks if str is a valid JSON string
 *
 * @param {String} str Input string that should be a valid JSON
 * @returns Boolean
 */
export const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};


/**
 * Checks if a object attribute is valid for an url
 *
 * @param {any} param Attribute to check
 * @returns Boolean
 */
export const isValidType = (param) => {
  switch (typeof param) {
    case 'string':
      return true;
    case 'number':
      return true;
    case 'boolean':
      return true;
    default:
      return false;
  }
};

/**
 * Parses an object to a query string url format
 *
 * @param {Object} obj object to parse
 * @returns String
 */
export const objectToQueryString = (obj) => {
  const strArray = Object.keys(obj).map((key) => {
    if (isValidType(obj[key])) {
      return `${key}=${obj[key].toString()}`;
    }
    return null;
  });
  return strArray.length ? `?${strArray.filter(pair => pair !== null).join('&')}` : '';
};

/**
 * Makes an http request
 *
 * @param {String} opts.protocol HTTP or HTTPS
 * @param {Object} opts Request connection options
 * @param {String} opts.method HTTP verb or method
 * @param {String} opts.host Host address
 * @param {String} opts.path URL path
 * @param {String} opts.port Server port
 * @param {Object} opts.headers HTTP headers
 * @param {Object} data Object to send
 * @returns Promise
 */
export const request = (protocol, opts, data) =>
  new Promise((resolve, reject) => {
    try {
      const _protocol = protocol.toUpperCase() && protocol.toUpperCase() === 'HTTPS' ? https : http;
      let _opts = JSON.parse(JSON.stringify(opts));
      if (_opts.method.toUpperCase() === 'GET' && data) {
        _opts = Object.assign({}, _opts, { path: `${_opts.path}${objectToQueryString(data)}` });
      }
      const req = _protocol.request(_opts, (res) => {
        let str = '';
        res.on('data', (chunk) => {
          str += chunk;
        });
        res.on('end', () => {
          resolve(isJson(str) ? JSON.parse(str) : str);
        });
        res.on('error', (e) => {
          reject(e);
        });
      });
      if ((_opts.method.toUpperCase() === 'PUT' || _opts.method.toUpperCase() === 'POST') && data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
