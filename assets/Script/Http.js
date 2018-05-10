// const conf = require('./Conf');
const URL = 'http://127.0.0.1:3000';
// const fetch = require('./lib/fetch');
/**
 * 返回是否合法
 * @param {*} response 
 */
function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText)
        error.response = response
        // console.log();
        throw error
    }
}

/**
 * 返回一个Json数据
 * @param {*} response 
 */
function parseJSON(response) {
    return response.json()
}

/**
 * 设置Then
 * @param {*} fetch 
 * @param {*} handler 
 */
function setThen(fetch, handler) {

    try {
        fetch.then(checkStatus)
            .then(parseJSON)
            .then(function (json) {
                console.log('parsed json', json)
                if (handler) handler({ type: 1, data: json });
            }).catch(function (ex) {
                console.log('parsing failed', ex)
                if (handler) handler({ type: -1, data: ex });

            })
    } catch (error) {
        console.log('setThen error=', error);
        if (handler) handler({ type: -1, data: error });
    }
}

const Http = {
    url: URL,

    /**
     * 发送http命令
     * @param {*} path 
     * @param {*} handler 
     */
    sendRequest(path, handler) {
        setThen(fetch(this.url + '/' + path), handler);
    },

    /**
     * 发送http命令
     * data为Json
     */
    sendRequest(path, handler, data, type = 'GET', url = this.url) {
        setThen(fetch(url + '/' + path, {
            method: type,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }), handler);

    },

    sendGetRequest(path, handler, data, type, url = this.url) {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;

        if (data == null) {
            data = {};
        }
        //解析请求路由以及格式化请求参数
        var sendpath = path;
        var sendtext = '?';
        for (var k in data) {
            if (sendtext != "?") {
                sendtext += "&";
            }
            sendtext += (k + "=" + data[k]);
        }
        //组装完整的URL
        var requestURL = url + sendpath + encodeURI(sendtext);
        //发送请求
        // console.log("RequestURL:" + requestURL);
        xhr.open("GET", requestURL, true);
        //设置发送数据的请求格式
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.onreadystatechange = function () {
            console.log("onreadystatechange");
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                cc.log("request from [" + xhr.responseURL + "] data [", ret, "]");
                var respText = xhr.responseText;
                var ret = null;
                try {
                    ret = JSON.parse(respText);
                } catch (e) {
                    console.log("err:" + e);
                    ret = {
                        errcode: -10001,
                        errmsg: e
                    };
                }
                if (handler) {
                    handler(ret);
                }
                handler = null;
            }
            else if (xhr.readyState === 4) {
                if (xhr.hasRetried) {
                    return;
                }
                console.log('other readystate == 4' + ', status:' + xhr.status);
            }
            else {
                console.log('other readystate:' + xhr.readyState + ', status:' + xhr.status);
            }
        };
        try {
            xhr.send();
        }
        catch (e) {
            console.log('send error', e);
        }
        return xhr;
    },

    sendPostRequest(path, handler, data, type, url = this.url) {
        console.log('sendRequest');
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        //使用HTTP POST请求与服务器交互数据
        xhr.open('POST', url + path, true);
        //超时重连
        var timer = setTimeout(function () {
            xhr.hasRetried = true;
            xhr.abort();
            console.log('http timeout');
            retryFunc();
        }, 5000);
        //重连
        var retryFunc = function () {
            this.sendPostRequest(path, handler, data, url);
        };
        //设置发送数据的请求格式
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.onreadystatechange = function () {
            clearTimeout(timer);
            if (xhr.readyState == 4) {
                //根据服务器的响应内容格式处理响应结果
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    // if (xhr.getResponseHeader('content-type') === 'application/json') {
                    // console.log('xhr', xhr);
                    var result = JSON.parse(xhr.responseText);
                    handler(result);
                } else {
                    console.log(xhr.responseText);
                }
            }
        }
        try {
            //将用户输入值序列化成字符串
            xhr.send(JSON.stringify(data));
        } catch (error) {
            retryFunc();
        }

    },
};

module.exports = Http;