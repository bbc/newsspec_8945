module.exports = function (grunt) {
    
    grunt.loadNpmTasks('grunt-svgstore');

    grunt.config(['svgstore'], {
		options: {
			prefix : 'icon-'
		},
		default : {
			files: {
				'source/tmpl/includes/svgstore.svg': ['source/svgs/*.svg']
			},
		}
    });

};