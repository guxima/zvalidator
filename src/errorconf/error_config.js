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