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
