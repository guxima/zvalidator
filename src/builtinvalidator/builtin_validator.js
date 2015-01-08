//把所有和验证器方法封装在一起，builtinValidator提供对内置验证方法的统一调用
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
