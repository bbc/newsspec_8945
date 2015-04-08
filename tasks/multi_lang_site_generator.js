module.exports = function (grunt) {

    // *************************************************************************
    // PROJECT FILES
    // Make a list of templates you want converted to files
    // *************************************************************************

    var projectFiles = {
        'index.html':          'index.html.tmpl',
        'index.inc':           'index.inc.tmpl',
        'case-studies.inc':    'case-studies.inc.tmpl',
        'half_wide/index.inc': 'halfwide_index.inc.tmpl',
        'test.html':           'test.html.tmpl'
    };

    // *************************************************************************
    // GRUNT CONFIG
    // You shouldn't need to edit anything below here
    // *************************************************************************

    grunt.config('multi_lang_site_generator', {
        default: {
            options: {
                vocabs:             ['<%= config.services.default %>'],
                vocab_directory:    'source/vocabs',
                template_directory: 'source/tmpl/',
                output_directory:   'content',
                data: {
                    version:             '<%= pkg.version %>',
                    inlineStyleElm:      '<style><%= grunt.file.read("content/" + config.services.default + "/css/inline.css") %></style>',
                    inlineIframeManager: '<%= grunt.file.read("source/js/lib/news_special/iframemanager__host.js") %>',
                    path:                '<%= env[config.whichEnv].domain %>/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content',
                    pathStatic:          '<%= env[config.whichEnv].domainStatic %>/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content',
                    projectNumber:       '<%= config.project_number %>',
                    cpsId:               '<%= config.cps_id || config.project_number %>',
                    istatsName:          '<%= config.istatsName %>',
                    storyPageUrl:        '<%= config.storyPageUrl %>',
                    debug:               '<%= config.debug %>',
                    amdModulePaths:      '<%= JSON.stringify(amdModulePaths) %>'
                }
            },
            files: projectFiles
        },
        build_all_other_sites: {
            options: {
                vocabs:             '<%= config.services.others %>',
                vocab_directory:    'source/vocabs',
                template_directory: 'source/tmpl/',
                output_directory:   'content',
                data: {
                    version:             '<%= pkg.version %>',
                    inlineStyleElm:      '<style><%= grunt.file.read("content/" + config.services.default + "/css/inline.css") %></style>',
                    inlineIframeManager: '<%= grunt.file.read("source/js/lib/news_special/iframemanager__host.js") %>',
                    path:                '<%= env[config.whichEnv].domain %>/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content',
                    pathStatic:          '<%= env[config.whichEnv].domainStatic %>/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content',
                    projectNumber:       '<%= config.project_number %>',
                    cpsId:               '<%= config.cps_id || config.project_number %>',
                    istatsName:          '<%= config.istatsName %>',
                    storyPageUrl:        '<%= config.storyPageUrl %>',
                    debug:               '<%= config.debug %>',
                    amdModulePaths:      '<%= JSON.stringify(amdModulePaths) %>'
                }
            },
            files: projectFiles
        }
    });
};
