module.exports = function (grunt) {

    var fontsLookup = {
        "afrique": "standard",
        "azeri": "standard",
        "bengali": "standard",
        "portuguese": "standard",
        "english": "standard",
        "gahuza": "standard",
        "hausa": "standard",
        "indonesia": "standard",
        "kyrgyz": "standard",
        "mundo": "standard",
        "rusian": "standard",
        "russian": "standard",
        "somali": "standard",
        "swahili": "standard",
        "tajik": "standard",
        "turkce": "standard",
        "ukrainian": "standard",
        "uzbek": "standard",
        "vietnamese": "standard",

        "arabic": "ar-ur",
        "pashto": "ar-ur",
        "persian": "ar-ur",
        "urdu": "ar-ur",

        "burmese": "my",
        "chinese": "zh-hans",
        "hindi": "hi",
        "nepali": "ne",
        "sinhala": "si",
        "tamil": "ta",
        "ukchina": "zh-hans_simp"
    };

    grunt.registerTask('lang_font:default', function () {
        var service = grunt.config.get('config').services.default,
            fontstackStr = fontsLookup[service],
            outputCssFilePaths = ['content/' + service + '/css/main.css', 'content/' + service + '/css/legacy-ie.css']
            cssToPrependStr = grunt.file.read('source/scss/news_special/fonts/' + fontstackStr + '_fonts.css'),
            sourceCssStr = null;

        for (var a = 0;  a < outputCssFilePaths.length; a++) {
            sourceCssStr = grunt.file.read(outputCssFilePaths[a]);
            grunt.file.write(outputCssFilePaths[a], cssToPrependStr + sourceCssStr);
        }
    });

    grunt.registerTask('lang_font:others', function () {
        
        var services = grunt.config.get('config').services.others;

        services.forEach(function (service) {
            var fontstackStr = fontsLookup[service];

            if (fontstackStr) {
                var outputCssFilePaths = ['content/' + service + '/css/main.css', 'content/' + service + '/css/legacy-ie.css'],
                    cssToPrependStr = grunt.file.read('source/scss/news_special/fonts/' + fontstackStr + '_fonts.css'),
                    sourceCssStr;

                for (var a = 0;  a < outputCssFilePaths.length; a++) {
                    sourceCssStr = grunt.file.read(outputCssFilePaths[a]);
                    grunt.file.write(outputCssFilePaths[a], cssToPrependStr + sourceCssStr);
                }
            }
            else {
                grunt.log.writeln('couldn\'t find any font information for: ' + service);
            }
        });
    });
};
