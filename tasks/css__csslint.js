module.exports = function (grunt) {
    grunt.config('csslint', {
        options: {
            'known-properties'              : false,
            'box-sizing'                    : false,
            'box-model'                     : false,
            'compatible-vendor-prefixes'    : false,
            'regex-selectors'               : false,
            'duplicate-background-images'   : false,
            'gradients'                     : false,
            'fallback-colors'               : false,
            'font-sizes'                    : false,
            'font-faces'                    : false,
            'floats'                        : false,
            'star-property-hack'            : false,
            'outline-none'                  : false,
            'import'                        : false,
            'underscore-property-hack'      : false,
            'rules-count'                   : false,
            'qualified-headings'            : false,
            'shorthand'                     : false,
            'text-indent'                   : false,
            'unique-headings'               : false,
            'unqualified-attributes'        : false,
            'vendor-prefix'                 : false,
            'universal-selector'            : false,
            'force'                         : true,
            'important'                     : false
        },
        src: ['./content/<%= config.services.default %>/css/main.css']
    });
};