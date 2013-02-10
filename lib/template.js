var Backbone               = require("backbone")
  , inflection             = require("./inflection")
  , Parser                 = require("./parser")
  , util                   = require("./util")
  , path                   = require("path")
  , _                      = require("underscore")

  , findDescendantsAndSelf = util.findDescendantsAndSelf
 
function Template(model, opts) {
  opts = opts || {}
  model = model || {}
  this.elementCache = {}
  this._state = {
    modelStack: [model],
    currentModel: function() {
      return _(this.modelStack).last()
    }
  }

  if(!this.markup) {
    throw new Error("Created template without markup")
  }
  this.template = this.markup.clone(true)
  this.bind()
}

Template.prototype.bind = function() {
  _(this.structure).each(function(node) {
    var type = node.type
      , reaction = node.reaction
      , selector = node.selector
      , el = this.elementCache[selector] || findDescendantsAndSelf(this.template, selector)
      , model = this._state.currentModel()

    this.elementCache[selector] = el

    if(type === "start")
      reaction.start(el, this._state)
    if(type === "end")
      reaction.end(el, this._state)
    if(type === "afterAll")
      reaction.afterAll(el, this)
  }, this)
}

Template.extend = Backbone.Model.extend

module.exports = Template