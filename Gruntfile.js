module.exports = function(grunt) {

  // View how long tasks take to run
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Paths
  var config = {
    dev: '_source/',
    tmp: '.tmp/',
    build: '_build/'
  };

  // Default Banner
  var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> - built: ' +
    '<%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %> */\n';

	// Project configuration
	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),

	    mkdir: {
	      all: {
	        options: {
	          mode: 0700,
	          create: ['.tmp']
	        },
	      },
	    },

	    // Set Node Environment
	    env: {
	      dev: {
	        NODE_ENV: 'development'
	      },
	      build: {
	        NODE_ENV: 'production'
	      }
	    },
	    // Clean directories
	    clean: {
	      dev: config.tmp,
	      build: config.build
	    },
	    // Sync files
	    sync: {
	      dev: {
	        files: [
	          //Layout files
	          {cwd: config.dev + 'layout/', src: ['**/*'], dest: config.tmp},
	          //Asset files
	          {cwd: config.dev + 'assets/', src: ['**/*'], dest: config.tmp + 'i'},
	          //Swf files
	          {cwd: config.dev + 'swf/', src: ['**/*.{swf,fla}'], dest: config.tmp + 'swf'},
	        ],
	        verbose: true,
	        updateOnly: true
	      },
	      build: {
	        files: [
	          //Layout files
	          {cwd: config.dev + 'layout/', src: ['**/*'], dest: config.tmp},
	          //Asset files
	          {cwd: config.dev + 'assets/', src: ['**/*'], dest: config.tmp + 'i'},
	          //Swf files
	          {cwd: config.dev + 'swf/', src: ['**/*.{swf,fla}'], dest: config.tmp + 'swf'},
	        ],
	        verbose: true,
	        updateOnly: true
	      }
	    },
		concat: {
			options: {
				separator: '\n'
			},
			dev: {
				src: [
					config.dev + 'js/avatar/utils.js',
					config.dev + 'js/avatar/WebcamController.js',
					config.dev + 'js/*'
				],
				dest: config.tmp + 'scripts/compiled_all.js'
			},
			build: {
				src: [
					config.dev + 'js/avatar/utils.js',
					config.dev + 'js/avatar/WebcamController.js',
					config.dev + 'js/*'
				],
				dest: config.build + 'scripts/compiled_all.js'
			}
		},
	    sass: {
	      options: {
	        banner: banner,
	        compass: true,
	        quiet: true
	      },
	      dev: {
	        options: {
	          style: 'nested'
	        },
	        files: {
	          '.tmp/style.css': '_source/css/main.scss'
	        }
	      },
	      build: {
	        options: {
	          style: 'compressed'
	        },
	        files: {
	          '_build/css/main.css': '_source/css/main.scss'
	        }
	      }
	    },
	    uglify: {
	      options: {
	        banner: banner,
	        compress: {
	          drop_console: true
	        }
	      },
	      dev: {
	        files: {
	          '.tmp/scripts/compiled_all.js': [config.tmp + 'scripts/compiled_all.js']
	        }
	      },
	      build: {
	        files: {
	          '_build/scripts/compiled_all.min.js': [config.build + 'scripts/compiled_all.min.js']
	        }
	      }
	    },
	    watch: {
	      grunt: { files: ['Gruntfile.js'] },
	      sass: {
	        files: [config.dev + 'css/*.scss']
	      },
	      js: {
	        files: [
	        	config.dev+'js/*.js',
	            config.dev+'js/**/*.js',
	            ],
	        tasks: ['concat:dev']
	      },
	      layout: {
	        files: [config.dev+'layout/*.*'],
	        tasks: ['sync:dev']
	      },
	      images: {
	        files: [config.dev+'assets/*.*'],
	        tasks: ['sync:dev']
	      },
	      swf: {
	        files: [config.dev+'swf/*.swf'],
	        tasks: ['sync:dev']
	      }

	    },
	      php: {
	          dev: {
	              options: {
	                  hostname: '127.0.0.1',
	                  port: 8010,
	                  base: '.tmp/'
	              }
	          }
	     },
	    // Browser Sync!
	     browserSync: {
	        options: {
	          watchTask: true,
	          proxy: "<%= php.dev.options.hostname %>:<%= php.dev.options.port %>",
	          // server: { baseDir: '.tmp' }
	        },
	        default_options: {
	          bsFiles: {
	            src: [
	              ".tmp/**/*"
	            ]
	          },
	          ghostMode: {
	              clicks: true,
	              scroll: true,
	              links: true,
	              forms: true
	          }
	        }
	      }


	});
	
	// Default task(s).
	  grunt.registerTask('default', ['clean:dev', 'concat:dev', 'sass:dev', 'sync:dev','php:dev','browserSync', 'watch']);
  	  grunt.registerTask('build', ['clean:build', 'concat:build', 'uglify:build', 'sass:build', 'googlespreadsheetexporter:build', 'sync:build']);

};