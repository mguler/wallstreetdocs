module.exports = function (grunt) {

    grunt.initConfig({
        browserify: {
            default: {
                files: {
                    './public/scripts/index.js': ['./src/public/scripts/index.js'],
                    './public/scripts/details.js': ['./src/public/scripts/details.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['browserify']);

};


