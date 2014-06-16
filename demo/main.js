requirejs.config({
    baseUrl: '../',
    paths: {
      'jquery': 'lib/jquery-1.11.0.min.js'
    }
});

require(['zvalidator'], function(qv){
    var form = document.getElementById('regInfo');
    form.addEventListener('submit', function(e){
        var isValid = qv.create().traverseContainer('regInfo');
        console.log(isValid);
        /**
         * traverseContainer()返回验证结果
         * 验证通过时返回 true
         * 不通过时返回
         * Object{
         *     code: "CELLPHONENO_INVALID",//结果标识码
         *     invalidElement: inputElement,//未通过验证的元素节点
         *     msg: "手机号不符合要求",//自定义返回信息
         *     validatorName: "cellphoneNo"//当前的验证方法
         * }
         */
        if(isValid !== true){
            isValid.invalidElement.focus();
            alert(isValid.msg)
        }
    },false);

});