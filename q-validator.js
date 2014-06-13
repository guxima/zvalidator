/**
 * 通用的表单验证类库
 * version: 1.1
 * User: guxima@gmail.com
 * Date: 2014/6/11
 */

define(function(){
    'use strict';

    var _utils = {
        isArray: function(any){
            return this.type(any) === 'array';
        },
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
                tmp.length>0 && ( all=all.concat( Array.prototype.slice.call(tmp, 0) ) );
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
        }
    };
    /**
     * 提供一种机制实现验证器之间的依赖，用于自定义验证器的时候调用基础验证器
     * @type {{create: Function, depend: Function, decorate: Function}}
     */
    var validatorMethodFactory = {
        create: function(){
            var ValidatorMethod = function(){};

            ValidatorMethod.prototype = this;

            var anInstance = new ValidatorMethod();

            anInstance.validatorNameQueue = [];

            return anInstance;
        },
        /**
         * 设定验证器的依赖项
         * @param validatorList {String} 依赖的验证器名称列表，csv分割可以传多个
         * @param opt {String|Number} 可选的参数
         */
        depend: function(validatorList, opt){
            validatorList = ! _utils.isArray(validatorList) ? [validatorList] : validatorList;

            var length = validatorList.length;

            while(length--){
                this.validatorNameQueue.unshift([validatorList[length], opt]);
            }
        },
        /**
         * 自定义验证的装饰方法
         * @param constructor {Function} 自定义的验证方法构造函数
         * @param constrName {String} 构造器名称，主要用于返回debug信息
         * @returns {Function} 装饰后的验证器
         */
        decorate: function(constructor, constrName){
            var factInstance = this;

            constructor.call(this);//调用的目的是为了获取depend依赖和check方法
            if((constructor=this.check)){
                return function(value, limit){
                    var code = true,
                        ctx = this;

                    _utils.each(factInstance.validatorNameQueue, function(idx, item){
                        code = ctx.applyValidator(item[0], value, item[1]||limit);

                        if(_utils.type(code)!=='undefined' && code!==true){
                            return false;//退出队列循环
                        }
                    });
                    //通过了依赖项验证后进行constructor检验
                    if(_utils.type(code)==='undefined' || code===true){
                        code = constructor(value, limit);
                    }else{
                        code = constrName + '_' + code;
                    }

                    return code;
                };
            }
        }
    };

    //默认提供的基础验证器，通过原型链的方式被用户调用和扩展
    //特别需要注意的是验证器的返回值可选，不返回值或者返回true被认为通过验证；返回其它值被当作错误码从errorSet中获取详细信息
    var basicValidator = {
        notNull: function(value){
            return ! _utils.trim(value) ? 'NOT_NULL' : true;
        },
        numOnly: function(value){
            return (/^[0-9]+$/).test(value) ? true : 'NUM_ONLY';
        },
        lengthFixed: function(value, opt){
            return value.length===+opt ? true : 'LENGTH_FIXED';
        },
        cnCharacterOnly: function(value){
            return (/^[\u4E00-\u9FA5]+$/).test(value) ?  true : 'CN_CHARACTER_ONLY';
        },
        lengthLimit: function(value, opt){
            if(opt && (opt=opt.split(',')).length===2){
                var ret = true;

                if(_utils.type(opt[0]) !== 'undefined'){
                    ret = value.length>=opt[0] ? true : 'LENGTH_LIMIT_MIN';
                }
                if(ret===true && _utils.type(opt[1]) !== 'undefined'){
                    ret = value.length<=opt[1] ? true : 'LENGTH_LIMIT_MAX';
                }

                return ret;
            }
        }
    };

    /**
     * 预定义一组实现了依赖功能的高级验证器构造函数
     * 需要注意的是各个函数内可选调用this.depend方法，但是必须有this.check属性定义验证方法，check接收两个参数：value-被验证表单域的值，opt-可选的通过表单域属性data-validatorvalue传递的值。check方法返回值规则同验证器;
     * @type {{rangeLimit: Function, cellphoneNo: Function}}
     */
    var advancedValidator = {
        rangeLimit: function(){
            this.depend('numOnly');
            this.check = function(value, opt){
                if(opt && (opt=opt.split(',')).length===2){
                    var ret = true;

                    value = parseInt(value, 10) || 0;
                    if(_utils.type(opt[0]) !== 'undefined'){
                        ret = value>=parseInt(opt[0], 10) ? true : 'RANGE_LIMIT_MIN';
                    }
                    if(ret===true && _utils.type(opt[1]) !== 'undefined'){
                        ret = value<=parseInt(opt[1], 10) ? true : 'RANGE_LIMIT_MAX';
                    }

                    return ret;
                }
            };
        },
        cellphoneNo: function(){
            this.depend('numOnly, lengthFixed', 11);
            this.check = function(value){
                return (/^1[0-9]{10}$/).test(value) ? true : 'CELLPHONENO_INVALID';
            };
        },
        IDCardNo: function(){
            this.depend('lengthFixed', 18);
            this.check = function(value){
                if (! (/^\d{17}[\dx]$/g).test(value)){
                    return 'IDCARDNO_UNEXPECT_CHAR';
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
                    if(sum !== +value.slice(-1)){
                        return 'IDCARDNO_INVALID';
                    }
                }
            };
        }
    };

    //包装一下advancedValidator各个项，实现验证器依赖功能
    _utils.each(advancedValidator, function(k, v){
        advancedValidator[k] = validatorMethodFactory.create().decorate(v, k);
    });

    //默认提供的错误码，保持在FormValidator的原型上，用户可以自定义扩展它
    var ErrorSetFactory = {
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
        create: function(opt){
            opt = opt||{};
            var ErrorSet = function(){};

            ErrorSet.prototype = this;

            var anErrorSet = new ErrorSet();

            for(var k in opt){
                if(opt.hasOwnProperty(k)){
                    anErrorSet[k] = opt[k];
                }
            }

            return anErrorSet;
        }
    };

    return {
        /**
         * 验证器对象的构造接口，可以通过传入键值对来扩展验证方法
         * @param customValidator {Object} 自定义的验证方法集合{customValidatorName: function(){},...}
         * @returns {FormValidator} {Object} 验证器实例
         */
        create: function(customValidator){
            customValidator = customValidator || {};

            var FormValidator = function(){};

            FormValidator.prototype = this;
            FormValidator.prototype.validator = _utils.extend(basicValidator, advancedValidator);
            FormValidator.prototype.errorSet = ErrorSetFactory.create();

            var anInstance = new FormValidator(),
                validator = anInstance.validator;

            for(var k in customValidator){
                if(customValidator.hasOwnProperty(k)){
                    validator[k] = validatorMethodFactory.create().decorate(customValidator[k], k);
                }
            }

            return anInstance;
        },
        /**
         * 留给自定义验证器设置错误信息的接口，不做任何处理
         * @param errorSet
         */
        setErrorMsg: function(errorSet){
            this.errorSet = ErrorSetFactory.create(errorSet);

            return this;
        },
        /**
         * 调用一个验证器的方法，并返回结果
         * @param validatorName {String} 验证器名称，查找顺序为先customValidator后basicValidator
         * @param value {String} 待验证的值
         * @param limit {String} csv格式的限定值
         * @returns {String|Boolean} 验证器返回的错误码
         */
        applyValidator: function(validatorName, value, limit){//保留参数名维持可读性
            var code = true,
                validator = this.validator[validatorName];

            if(validatorName!=='notNull'){//默认开启非空检查
                code = this.validator.notNull.call(this, value);
            }
            if(code===true && validator){
                code = validator.call(this, value, limit);
            }else if(code !== true){
                code = validatorName + '_' + 'not_Null';
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
            var selector = _utils.$(selector),
                validity = true,
                me = this,
                nameAttr = 'validator',
                valueAttr = 'validatorvalue',
                fields = _utils.getChildByTagName(selector, ['input', 'select', 'textarea']);

            _utils.each(_utils.arrayFilter(fields, function(v){
                return !! _utils.getDataset(v, nameAttr);
            }), function(idx, ele){
                    var validatorName = _utils.getDataset(ele, nameAttr).split(',');

                    _utils.each(_utils.getDataset(ele, nameAttr).split(','), function(idx, item){
                        var code = me.applyValidator(item, _utils.trim(_utils.$(ele).value), _utils.getDataset(ele, valueAttr));

                        if(code && code!==true){
                            code = code.toUpperCase();//统一大写输出
                            validity = {
                                code: code,
                                msg: me.errorSet[code] || me.errorSet[code.slice(code.indexOf('_')+1)] || '',
                                validatorName: item,
                                invalidElement: ele//保存未通过验证的元素，提供debug信息
                            };

                            return false;
                        }
                    });

                    return validity===true;
                });

            return validity;
        }
    };
});

