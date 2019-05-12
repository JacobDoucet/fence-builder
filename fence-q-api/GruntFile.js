module.exports = function(grunt) {
    grunt.initConfig({
      ts: {
        default : {
          tsconfig: './tsconfig.json'
        }
      },

      clean: {
        dist: [
            'dist'
        ]
      },

      watch: {
        files: ['./src/**/*{.ts,.json}'],
        tasks: [ 'clean:dist', 'ts' ],
        options: {
          atBegin: true
        }
      },

      copy: {
        types: {
          cwd: 'src/types',
          src: '*',
          dest: '../fence-q-mobile/src/types',
          expand: true
        }
      }

    });
    
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', [
      'clean:dist',
      'ts'
    ]);

    grunt.registerTask('copy-types', [
      'copy:types'
    ]);

  };
