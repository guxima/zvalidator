/*! 2015-01-09 | (c) 2014, 2015 guxima@gmail.com */
!(function(){
'use strict';
/**
 * Desc: 自定义方法工具
 * Date: 2015/1/8
 */
var utils = {
    trim: function(str, rep){
        return str.replace(/^\s+|\s+$/g, rep||'');
    },
    type: function(any){
        return Object.prototype.toString.call(any).match(/^\[object\s+([^\]]+)\]$/i)[1].toLowerCase();
    },
    each: function(any, fn, ctx){
        for(var k in any){
            if(any.hasOwnProperty(k) && (ctx ? fn.call(ctx, k, any[k]) : fn(k, any[k]) ) === false) {
                break;
            }
        }
    },
    extend: function(first, second){
        for(var k in second){
            second.hasOwnProperty(k) && (first[k]=second[k]);
        }
        return first;
    },
    $: function(any){
        return this.type(any) === 'string' ? document.getElementById(any) : any;
    },
    getChildByTagName: function(ele, tag){
        var all = [],
            tmp;

        this.type(tag) !== 'array' && (tag=[tag]);
        for(var i= 0, len=tag.length; i<len;){
            tmp = ele.getElementsByTagName(tag[i++]);
            if(tmp.length>0){
                for (var k=0, ken=tmp.length; k<ken; k++){
                    all.push(tmp[k]);
                }
            }
        }
        return all;
    },
    arrayFilter: function(arr, fn){
        var ret = [],
            len = arr.length;

        while(len--){
            fn(arr[len], len) && ret.push(arr[len]);
        }
        return ret;
    },
    getDataset: function(ele, dataName){
        return ele.dataset ? ele.dataset[dataName] : ele.getAttribute('data-' + dataName);
    },
    bind: function(fn, ctx){
        return function(){
            return fn.apply(ctx, arguments);
        }
    },
    //null, undefined, '', 这些返回真
    isEmpty: function(any){
        return this.isNull(any) || this.isUndefined(any) || (utils.isString(any) && this.trim(any)==='');
    }
};

utils.each(['Object', 'Array', 'Number', 'String', 'Boolean', 'Null', 'Undefined'], function(idx, value){
    this['is'+value] = function(any){
        return this.type(any) === value.toLowerCase();
    };
}, utils);
/**
 * Desc: 处理返回的错误码，保持在FormValidator的原型上，用户可以自定义扩展它
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
/**
 * 把所有和验证器方法封装在一起，builtinValidator提供对内置验证方法的统一调用
 */
var builtinValidator = function(basicValidator, advancedValidator){
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
            var length = validatorList.length;

            while(length--){
                this.depValidatorQueue.unshift(validatorList[length]);
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
                utils.isArray(config.deps) && config.deps.length>0 && this.depend(config.deps);

				if(this.check=config.check){
					return function(){
						return decorateValidate.apply(this, arguments);
					}
				}
			}
        })()
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
}(basicValidator, advancedValidator);

/**
 * 校验失败信息的提示bootstrap
 * 载入所有的语言文件到内存中，根据浏览器ua的语言标识确定使用哪个配置
 */
var ErrorConfig = function(){
    var langConf = {};

    return {
        setLangConf: function(lang, map){
            langConf[lang] = map;
        },
        getConfByLang: function(lang){
            lang = lang  || (typeof window !== 'undefined' ? (navigator.language||navigator.userLanguage).toLowerCase() : 'zh-cn');

            return langConf[lang] || null;
        }
    };
}();
ErrorConfig.setLangConf('zh-cn', {
    UNKNOWN: '未知错误',
    REQUIRED: '不能为空',
    CN_CHARACTER_ONLY: '只能为汉字',
    NUM_ONLY: '只能为数字',
    LENGTH_FIXED: '长度和限定长度不一致',
    LENGTH_LIMIT_MIN: '长度小于最小长度',
    LENGTH_LIMIT_MAX: '长度大于最大长度',
    LENGTH_LIMIT_UNKNOWN: '未知的长度限制错误',
    RANGE_LIMIT_MIN: '值小于最小限制',
    RANGE_LIMIT_MAX: '值大于最大限制',
    CELLPHONENO_INVALID: '手机号不符合要求',
    IDCARDNO_UNEXPECT_CHAR: '身份证号码中有不能识别的字符',
    IDCARDNO_INVALID: '身份证信息错误',
    IPV4_INVALID: 'IP格式错误',
    EMAIL_INVALID: '邮件格式错误',
    URL_INVALID: 'url格式错误'
});

ErrorConfig.setLangConf('en-us', {
    UNKNOWN: '未知错误',
    NOT_NULL: '不能为空',
    CN_CHARACTER_ONLY: '只能为汉字',
    NUM_ONLY: '只能为数字',
    LENGTH_FIXED: '长度和限定长度不一致',
    LENGTH_LIMIT_MIN: '长度小于最小长度',
    LENGTH_LIMIT_MAX: '长度大于最大长度',
    RANGE_LIMIT_MIN: '值小于最小限制',
    RANGE_LIMIT_MAX: '值大于最大限制',
    CELLPHONENO_INVALID: '手机号不符合要求',
    IDCARDNO_UNEXPECT_CHAR: '身份证号码中有不能识别的字符',
    IDCARDNO_INVALID: '身份证信息错误',
    IPV4_INVALID: 'IP格式不对',
    EMAIL_INVALID: '邮件格式错误',
    URL_INVALID: 'url格式错误'
});

/**
 * Desc: 通用的表单验证类库
 * version: 2.0.1
 * Date: 2015/1/9
 */

window.ZValidator = function(){
	var validatorMethodFactory = builtinValidator.factory,
		defaultValidator = utils.extend(builtinValidator.basic, builtinValidator.advance),
        errConf = ErrorConfig.getConfByLang();

	return {
        /**
         * 验证器对象的构造接口，可以通过传入键值对来扩展验证方法
         * @param opt {Object} 自定义的验证方法集合及自定义回调,，忽略其它类型参数
         *                      {
         *                          onValid: function(){},
         *                          onInvalid: function(){},
         *                          customValidatorName: {},...
         *                      }
         * @returns {FormValidator} {Object} 验证器实例
         */
        create: function(opt){
            opt = opt || {};

            var FormValidator = function(){};

            FormValidator.prototype = this;

            var anInstance = new FormValidator(),
                validator = anInstance.validator||(anInstance.validator={});

			anInstance.errorSet = ErrorSetFactory.create(errConf);

            if(opt.onValid){
                anInstance.onValid = opt.onValid;
                delete opt.onValid;
            }
            if(opt.onInvalid){
                anInstance.onInvalid = opt.onInvalid;
                delete opt.onInvalid;
            }

            for(var k in opt){
                //含有check方法的都认为是自定义的验证器
                if(opt.hasOwnProperty(k) && typeof opt[k].check==='function'){
					var vm = validatorMethodFactory.create();
                    validator[k] = utils.bind(vm.decorate(k, opt[k]), vm);
                }
            }

            return anInstance;
        },
        /**
         * 留给自定义验证器设置错误信息的接口，不做任何处理
         * @param errorSet
         */
        setErrorMsg: function(errorSet){
			this.errorSet.setErrMsg(errorSet);

            return this;
        },
        /**
         * 调用一个验证器的方法，并返回结果
         * @param validatorName {String} 验证器名称，查找顺序为先customValidator后basicValidator
         * @param value {String} 待验证的值
         * @param opt {String} 验证器的可选参数
         * @returns {String|Boolean} 验证器返回的错误码
         */
        applyValidator: function(validatorName, value, opt){
            var code = true,
                validator = this.validator[validatorName] || defaultValidator[validatorName];

                if(validator){
					code = validator.call(this, value, opt);
				}else{
					console.log('invalid validator name => ' + validatorName);
					code = 'UNKNOWN';
				}

            return code;
        },
        /**
         * 遍历一个selector容器内的所有input，textarea
         * 按照data-validator、data-validatorvalue指定的验证器和可选参数进行验证
         * @param selector {String|Object} querySelector or HTMLElement
         * @returns validity {Boolean|Object} 验证的结果信息，验证通过返回true，否则返回{code:'', msg:'', validatorName:'', invalidElement:''}
         */
        traverseContainer: function(selector){
            var selector = utils.$(selector),
                validity = true,
                me = this,
                nameAttr = 'validator',
                fields = utils.getChildByTagName(selector, ['input', 'select', 'textarea']);

            utils.each(utils.arrayFilter(fields, function(v){
                return !! utils.getDataset(v, nameAttr);
            }), function(idx, ele){
                    var validatorMap = {},
						dataset = utils.getDataset(ele, nameAttr);

					try{
						validatorMap = new Function('return ' + dataset)();
					}
					catch (e){
						throw('invalid data-validator values => ' + dataset);
					}

					//validatorMap支持两种形式：[validatora, [validatorb, param1, param2...]] or {validatora:'', validatorb:[param1, param2]}
                    utils.each(validatorMap, function(idx, item){
						var validatorName = item,
							validatorOpt;

						if(utils.isObject(validatorMap)){
							validatorName = idx;
							validatorOpt = item;
						}else if(utils.isArray(item)){
							validatorName = item[0];
							validatorOpt = item.slice(1);
						}

                        var code = me.applyValidator(validatorName, utils.trim(utils.$(ele).value), validatorOpt);

                        if(code && code!==true){
                            code = code.toUpperCase();//统一大写输出
                            validity = {
                                code: code,
                                msg: me.errorSet.getErrMsg(code) || me.errorSet.getErrMsg(code.slice(code.indexOf('_')+1)) || me.errorSet.getErrMsg('UNKNOWN'),
                                validatorName: validatorName,
                                element: ele//保存未通过验证的元素，提供debug信息
                            };

                            return false;
                        }
                    });

                    return validity===true;
                });

            //版本兼容，回调不返回结果时，默认返回校验结果
            return validity===true ? (this.onValid && this.onValid()) : (this.onInvalid && this.onInvalid(validity)) || validity;
        }
    };
}();
})();