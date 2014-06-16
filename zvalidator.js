/**
 * Desc: 验证器统一的对外使用接口
 * User: guxima@gmail.com
 * Date: 2014/6/12
 */
'use strict';
define(['utils', 'builtinvalidator', 'errorSet'], function(utils, builtinValidator, ErrorSetFactory){
	var validatorMethodFactory = builtinValidator.factory,
		defaultValidator = utils.extend(builtinValidator.basic, builtinValidator.advance);

	return {
        /**
         * 验证器对象的构造接口，可以通过传入键值对来扩展验证方法
         * @param customValidator {Object} 自定义的验证方法集合{customValidatorName: {},...}
         * @returns {FormValidator} {Object} 验证器实例
         */
        create: function(customValidator){
            customValidator = customValidator || {};

            var FormValidator = function(){};

            FormValidator.prototype = this;

            var anInstance = new FormValidator(),
                validator = anInstance.validator||(anInstance.validator={});

			anInstance.errorSet = ErrorSetFactory.create();
            for(var k in customValidator){
                if(customValidator.hasOwnProperty(k)){
					var vm = validatorMethodFactory.create();
                    validator[k] = utils.bind(vm.decorate(k, customValidator[k]), vm);
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

                code = validator ? validator.call(this, value, opt) : 'UNKOWN';

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

                    utils.each(validatorMap, function(idx, item){
						var validatorName = item,
							validatorOpt;

						if(utils.isArray(item)){
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
