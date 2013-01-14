var jsdom = require("jsdom")
  , fs = require("fs")
  , _ = require("underscore")
  , path = require("path")


;(function(global) {

  var scripts = [ __dirname + "/../vendor/jquery.js"
                , __dirname + "/../lib/browser-require.js" ]

    , scriptModules = { "/node_modules/underscore.js": path.resolve(__dirname + "/../node_modules/underscore/underscore.js")
                      , "/lib/inflection.js": path.resolve(__dirname + "/../lib/inflection.js") 
                      , "/node_modules/backbone.js": path.resolve(__dirname + "/../node_modules/backbone/backbone.js") }
    , window
    , projectRoot = path.resolve(__dirname + "/..")

  /* 
   * these scripts get loaded by each test automatically, 
   * since we have not yet loaded a jsdom instance we
   * store the scripts to load once jsdom starts
   */
  global.script = function () {
    var opts = _.last(arguments) 
      , paths

    if(typeof opts === "object") {
      paths = _.initial(arguments)
    } else {
      paths = _.toArray(arguments)
      opts = { module: false }
    }

    if(opts.module) {
      loadModuleScript.apply(this, paths)
    } else {
      loadScript.apply(this, paths)
    }
  }

  function loadScript() {
    scripts.push.apply(scripts, arguments)
  }

  function loadModuleScript() {
    _.each(arguments, function(script) {
      var requirePath = path.resolve(script)
      scriptModules[requirePath] = script
    })
  }

  function wrapWithModule(module, contents) {
    return 'require.register("' + module.replace(projectRoot, "") + '", ' 
         + 'function(module, exports, require, global) {\n' 
         + contents + '})\n'
  }

  beforeEach(function(done) {
    jsdom.env({
      html: "<html><head></head><body></body></html>",
      scripts: scripts,
      src: _(scriptModules).map(function(script, module) {
        var contents = fs.readFileSync(script)

        return wrapWithModule(module, contents)
      }),
      done: jsDomLoaded
    })

    function jsDomLoaded(errors, ctx) {
      window = global.window = ctx
      window.console = console
      if(window.$) {
        global.$ = window.$
      }
      done()

      global.script = function() {
        var opts
          , paths

        if(typeof opts === "object") {
          paths = _.initial(arguments)
          opts =  _.last(arguments) 
        } else {
          paths = _.toArray(arguments)
          opts = { module: false }
        }
 
        _(paths).each(function(file) {
          var features = JSON.parse(JSON.stringify(window.document.implementation._features))

          window.document.implementation.addFeature('FetchExternalResources', ['script'])
          window.document.implementation.addFeature('ProcessExternalResources', ['script'])
          window.document.implementation.addFeature('MutationEvents', ['1.0'])

          script = window.document.createElement("script")
          script.onload = function(argument) {
            window.document.implementation._features = features
          }

          if(opts.module) {
            script.text = wrapWithModule(file, fs.readFileSync(file))
          } else {
            script.text = fs.readFileSync(file)
          }
          window.document.documentElement.appendChild(script)
        })
      }
    }
  })

}(global))
