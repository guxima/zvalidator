/**
默认提供的基础验证器，通过原型链的方式被用户调用和扩展
特别需要注意的是验证器的返回值将被当作错误码从errorSet中获取详细信息，不返回值代表通过验证
**/
var basicValidator = {
    required: function (value) {
        if(utils.isEmpty(value) ){
            return 'REQUIRED';
        }
    },
    numOnly: function (value) {
        if(! (/^[0-9]+$/).test(value) ){
            return 'NUM_ONLY';
        }
    },
    //实际返回length值的检测情况
    lengthFixed: function (value, opt) {
        if(utils.isEmpty(value) || value.length !== +opt){
            return 'LENGTH_FIXED';
        }
    },
    cnCharacterOnly: function (value) {
        if(! (/^[\u4E00-\u9FA5]+$/).test(value) ){
            return 'CN_CHARACTER_ONLY';
        }
    },
    lengthLimit: function (value, opt) {
        if (!utils.isEmpty(value) && utils.isArray(opt) && opt.length === 2) {
            if (!utils.isUndefined(opt[0]) && value.length < opt[0]) {
                return 'LENGTH_LIMIT_MIN';
            }
            if (!utils.isUndefined(opt[1]) && value.length > opt[1]) {
                return 'LENGTH_LIMIT_MAX';
            }
        } else {
            return 'LENGTH_LIMIT_UNKNOWN';
        }
    },
    //IPV4
    ip: function (v, opt) {
        if(!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v) ){
            return 'IPV4_INVALID';
        }
    },
    //email
    email: function(v){
        if(!(/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/i).test(v) ){
            return 'EMAIL_INVALID';
        }
    },
    //url
    url: function(v){
        if(!(/^(https?):\/\/[^\s&<>#;,"\'\?]+(|#[^\s<>;"\']*|\?[^\s<>;"\']*)$/i).test(v)){
            return 'URL_INVALID';
        }
    }
};