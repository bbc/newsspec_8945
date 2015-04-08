module.exports = function (grunt) {
    grunt.registerTask('deploy_checklist', function () {

        var config = grunt.config.get('config');

        if (config.debug !== 'false') {
            grunt.log.warn('"debug" in package.js is set to true, do not deploy to live with this setting!');
        }

        propertiesToCheck = [
            {
                value:         config.project_number,
                invalidValues: ['', '0000'],
                errMessage:    '"project_number" in package.json not set!'
            },
            {
                value:         config.storyPageUrl,
                invalidValues: ['', '--REPLACEME--'],
                errMessage:    '"storyPageUrl" in package.json not set, sharetools will not work properly!'
            }
        ];

        propertiesToCheck.forEach(function (property) {
            checkProperty(
                property.value,
                property.invalidValues,
                property.errMessage
            );
        });

        function checkProperty(value, invalidValues, errMessage) {
            if (valueIsInvalid(value, invalidValues)) {
                grunt.log.warn(errMessage);
            }
        }
        function valueIsInvalid(value, invalidValues) {
            return invalidValues.indexOf(value) > -1;
        }
    });
};