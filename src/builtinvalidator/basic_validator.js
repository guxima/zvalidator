//默认提供的基础验证器，通过原型链的方式被用户调用和扩展
//特别需要注意的是验证器的返回值可选，不返回值或者返回true被认为通过验证；返回其它值被当作错误码从errorSet中获取详细信息
var basicValidator = {
    required: function (value) {
        return !utils.isEmpty(value) ? true : 'REQUIRED';
    },
    numOnly: function (value) {
        return (/^[0-9]+$/).test(value) ? true : 'NUM_ONLY';
    },
    //实际返回length值的检测情况
    lengthFixed: function (value, opt) {
        return !utils.isEmpty(value) && value.length === +opt ? true : 'LENGTH_FIXED';
    },
    cnCharacterOnly: function (value) {
        return (/^[\u4E00-\u9FA5]+$/).test(value) ? true : 'CN_CHARACTER_ONLY';
    },
    lengthLimit: function (value, opt) {
        var ret = true;

        if (!utils.isEmpty(value) && utils.isArray(opt) && opt.length > 0) {
            if (!utils.isUndefined(opt[0])) {
                ret = value.length >= opt[0] ? true : 'LENGTH_LIMIT_MIN';
            }
            if (ret === true && !utils.isUndefined(opt[1])) {
                ret = value.length <= opt[1] ? true : 'LENGTH_LIMIT_MAX';
            }
        } else {
            ret = 'LENGTH_LIMIT_UNKNOWN';
        }

        return ret;
    },
    //IPV4
    ip: function (v, opt) {
        return !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v) && 'IPV4_INVALID';
    },
    //email
    email: function(v){
        return !(/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/i).test(v) && 'EMAIL_INVALID';
    },
    //url
    url: function(v){
        return !(/^(https?):\/\/[^\s&<>#;,"\'\?]+(|#[^\s<>;"\']*|\?[^\s<>;"\']*)$/i).test(v) && 'URL_INVALID';
    }
};