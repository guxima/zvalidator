/**
 * 预定义一组实现了依赖功能的高级验证器构造函数
 * 需要注意的是各个函数内可选调用this.depend方法，但是必须有this.check属性定义验证方法，check接收两个参数：value-被验证表单域的值，opt-可选的通过表单域属性data-validatorvalue传递的值。check方法返回值规则同验证器;
 */
var advancedValidator = {
    //数值范围限制，[min, max]
    rangeLimit: {
        deps: ['numOnly'],
        check: function(value, opt){
            if(utils.isArray(opt) && opt.length===2){
                var ret = true;

                value = parseInt(value, 10) || 0;
                if(utils.type(opt[0]) !== 'undefined'){
                    ret = value>=parseInt(opt[0], 10) ? true : 'RANGE_LIMIT_MIN';
                }
                if(ret===true && utils.type(opt[1]) !== 'undefined'){
                    ret = value<=parseInt(opt[1], 10) ? true : 'RANGE_LIMIT_MAX';
                }

                return ret;
            }
        }
    },
    //手机号码
    cellphoneNo: {
        deps: ['numOnly', ['lengthFixed', 11] ],
        check: function(value){
            return (/^1[0-9]{10}$/).test(value) ? true : 'CELLPHONENO_INVALID';
        }
    },
    //身份证号
    IDCardNo: {
        deps: [['lengthFixed', 18]],
        check: function(value){
            var ret = true;

            if (! (/^\d{17}[\dX]$/ig).test(value)){
                ret = 'IDCARDNO_UNEXPECT_CHAR';
            }else{
                //按照ISO7064:1983.MOD 11-2校验码计算出来的校验码
                var factors = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],
                    count = 17,
                    sum = 0;

                while(count--){
                    sum += value[count] * factors[count];
                }
                sum = (12-sum%11)%11;

                if(sum===10){
                    sum='X';
                }

                if(sum != value.slice(-1).toUpperCase()){
                    ret = 'IDCARDNO_INVALID';
                }
            }

            return ret;
        }
    },


};