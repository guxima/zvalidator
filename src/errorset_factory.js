/**
 * Desc: 处理返回的错误码，保持在FormValidator的原型上，用户可以自定义扩展它
 * User: guxima@gmail.com
 * Date: 2015/1/8
 */

var ErrorSetFactory = function(){
	//用errorSet对象的guid为键值存储自定义错误配置
	var errorMsg = {};

	return {
        create: function(opt){
            opt = opt||{};

			var ErrorSet = function(){};

            ErrorSet.prototype = this;

            var anErrorSet = new ErrorSet();

			anErrorSet.guid = +new Date;
			anErrorSet.setErrMsg(opt);

            return anErrorSet;
        },

		//用户可以自己定义错误提示，扩展到默认的提示中
		setErrMsg: function (config){
			var guid = this.guid;

			for(var k in config){
                if(config.hasOwnProperty(k)){
                    (errorMsg[guid]=errorMsg[guid]||{}, errorMsg[guid][k.toUpperCase()]=config[k]);
                }
            }
		},

		//根据错误码返回错误信息，若无返回默认错误信息，并提示用户修改
		getErrMsg: function (errCode){
			errCode = errCode.toUpperCase();
			//不能直接取对象errorMsg[this.guid]的errCode属性，该对象可能不存在！
			return (errorMsg[this.guid] && errorMsg[this.guid][errCode]);
		}
    };
}();
