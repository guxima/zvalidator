/**
 * Desc: 内置的验证器集合
 * User: guxima@gmail.com
 * Date: 2014/6/12
 */
'use strict';

define(['utils'], function(utils){
	/**
     * 提供一种机制实现验证器之间的依赖，用于自定义验证器的时候调用基础验证器
     * @type {{create: Function, depend: Function, decorate: Function}}
     */
    var validatorMethodFactory = {
        create: function(){
            var ValidatorMethod = function(){};

            ValidatorMethod.prototype = this;

            var anInstance = new ValidatorMethod();

            anInstance.depValidatorQueue = [];

            return anInstance;
        },
        /**
         * 设定验证器的依赖项
         * @param validatorList {Array} 依赖的验证器名称和可选值列表，csv分割可以传多个
         */
        depend: function(validatorList){
			if(utils.isArray(validatorList) && validatorList.length>0){
				var length = validatorList.length;

				while(length--){
					this.depValidatorQueue.unshift(validatorList[length]);
				}
			}
        },
        /**
         * 自定义验证的装饰方法
         * @param constrName {String} 构造器名称，主要用于返回debug信息
		 * @param config {Object} 自定义的验证方法的配置，
								  注意：config.deps 值格式为[validatorA, [validatorB, param1, param2]...]
										config.check 若无返回值，则校验通过；若有有返回值，则除显性的返回“true”外，的其它返回值都将作为错误标识！！！
         * @returns {Function} 装饰后的验证器
         */
        decorate: (function(){
			function decorateValidate(value, option){
				var code = true;

				utils.each(this.depValidatorQueue, function(idx, item){
					var validatorName = item,
						validatorOpt = [];

					if(utils.isArray(item)){
						validatorName = item[0];
						validatorOpt = item.slice(1);
					}

					var args = validatorOpt.length === 0 ? [validatorName, value] : [validatorName, value].concat(validatorOpt);
					var validator = advancedValidator[validatorName] || basicValidator[validatorName];

					code = validator ? validator(value, validatorOpt) : true;

					if(utils.type(code)!=='undefined' && code!==true){
						return false;//退出队列循环
					}
				}, this);

				//通过了依赖项验证后进行constructor检验
				if(utils.type(code)==='undefined' || code===true){
					code = this.check(value, option);
				}else{
					code = this.constrName + '_' + code;
				}

				return code;
			}

			return function(constrName, config){
				this.constrName = constrName;
				//处理构造器依赖项
				this.depend(config.deps);

				if(this.check=config.check){
					return function(){
						return decorateValidate.apply(this, arguments);
					}
				}
			}
        })()
    };

    //默认提供的基础验证器，通过原型链的方式被用户调用和扩展
    //特别需要注意的是验证器的返回值可选，不返回值或者返回true被认为通过验证；返回其它值被当作错误码从errorSet中获取详细信息
    var basicValidator = {
        required: function(value){
            return ! utils.isEmpty(value) ? true : 'REQUIRED';
        },
        numOnly: function(value){
            return (/^[0-9]+$/).test(value) ? true : 'NUM_ONLY';
        },
		//实际返回length值的检测情况
        lengthFixed: function(value, opt){
            return ! utils.isEmpty(value) && value.length === +opt ? true : 'LENGTH_FIXED';
        },
        cnCharacterOnly: function(value){
            return (/^[\u4E00-\u9FA5]+$/).test(value) ?  true : 'CN_CHARACTER_ONLY';
        },
        lengthLimit: function(value, opt){
			var ret = true;

            if(! utils.isEmpty(value) && utils.isArray(opt) && opt.length>0){
                if(! utils.isUndefined(opt[0])){
                    ret = value.length>=opt[0] ? true : 'LENGTH_LIMIT_MIN';
                }
                if(ret===true && ! utils.isUndefined(opt[1])){
                    ret = value.length<=opt[1] ? true : 'LENGTH_LIMIT_MAX';
                }
            }else{
				ret = 'LENGTH_LIMIT_UNKNOWN';
			}

			return ret;
        }
    };

    /**
     * 预定义一组实现了依赖功能的高级验证器构造函数
     * 需要注意的是各个函数内可选调用this.depend方法，但是必须有this.check属性定义验证方法，check接收两个参数：value-被验证表单域的值，opt-可选的通过表单域属性data-validatorvalue传递的值。check方法返回值规则同验证器;
     * @type {{rangeLimit: Function, cellphoneNo: Function}}
     */
    var advancedValidator = {
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
        cellphoneNo: {
            deps: ['numOnly', ['lengthFixed', 11] ],
            check: function(value){
                return (/^1[0-9]{10}$/).test(value) ? true : 'CELLPHONENO_INVALID';
            }
        },
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
        }
    };

    //包装一下advancedValidator各个项，实现验证器依赖功能
    utils.each(advancedValidator, function(k, v){
		var method = validatorMethodFactory.create();

        advancedValidator[k] = utils.bind(method.decorate(k, v), method);
    });

	return {
		factory: validatorMethodFactory,
		basic: basicValidator,
		advance: advancedValidator
	};
});
