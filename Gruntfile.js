module.exports = function(grunt) {
	'use strict';

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>;' +
      ' Licensed <%= pkg.license %> */\n',

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/ocky.js'],
        dest: 'ocky.js'
      }
    }, 

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },

      ocky: ['src/ocky.js'],
      tests: ['tests/*.js']
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'ocky.min.js'
      }
    },

    mocha: {
      index: ['tests/index.html']
    }
  });

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', ['jshint', 'mocha']);
};