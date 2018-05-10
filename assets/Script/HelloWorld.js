const http=require('Http');
cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        http.sendGetRequest('/register',(data)=>{
            console.log('http=',data);
        },{aaa:'aaa'});

        http.sendPostRequest('/textPost',(data)=>{
            console.log('http=',data);
        },{aaa:'aaa'});
    },

    // called every frame
    update: function (dt) {

    },
});
