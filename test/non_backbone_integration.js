require('./support/helper');

var path = require("path")
  , expect = require("expect.js")
  , fs = require("fs")
  , generateTemplate = require("./support/generate_template")
  , Backbone = require('Backbone')
  , modelReaction = require('../lib/reactions/model')

delete require.cache[require.resolve('Backbone')]
var BackboneClone = require('Backbone') // To Test Bug. EndDash module might have a different Backbone then a client's
                                        // main application. Internally we use !(model instanceof Backbone.Model || ... instanceof Backbone.Collection)
                                        // this test is intended to check that our code now handles this case

describe("With a backbone model from a different backbone object", function(){
  it("Should still work properly", function(){
    var model = new BackboneClone.Model({persisted: "Chelsa Piers"})
      , template = generateTemplate({user: model}, "<div class='user-'><div class='persisted-'></div></div>")

    expect($('.persisted-').html()).to.be('Chelsa Piers')
    model.set('persisted', 'Changed')
    expect($('.persisted-').html()).to.be('Changed')
  })
})

describe("With a backbone model", function(){
  beforeEach(function(){
    var backModel = new Backbone.Model()
  })
  it("Should work as normal", function(){
    var model = new Backbone.Model({persisted: "Chelsa Piers"})
      , template = generateTemplate({user: model}, "<div class='user-'><div class='persisted-'></div></div>")

    expect($('.persisted-').html()).to.be('Chelsa Piers')
    model.set('persisted', 'Changed')
    expect($('.persisted-').html()).to.be('Changed')
  })
})

describe("With a backbone collection from a different backbone object", function(){
  beforeEach(function(){
    this.collection = new BackboneClone.Collection()
    this.templateString = "<div class='users-'><div class ='user-'><div class=' #{hook} persisted-'></div></div></div>"
  })

  describe("With models from a different backbone object", function(){
    it("Should still work properly", function(){
      var model1 = new BackboneClone.Model({persisted: "Chelsa Piers", hook: '1'})
        , model2 = new BackboneClone.Model({persisted: "Columbus circle", hook: '2'})
        , model3 = new BackboneClone.Model({persisted: "Soho", hook: '3'})
      this.collection.add([model1, model2, model3])
      var template = generateTemplate({users: this.collection}, this.templateString)
      expect($('.1').html()).to.be(model1.get('persisted'))
      expect($('.2').html()).to.be(model2.get('persisted'))
      expect($('.3').html()).to.be(model3.get('persisted'))
      model1.set('persisted', 'Changed1')
      model2.set('persisted', 'Changed2')
      model3.set('persisted', 'Changed3')
      expect($('.1').html()).to.be(model1.get('persisted'))
      expect($('.2').html()).to.be(model2.get('persisted'))
      expect($('.3').html()).to.be(model3.get('persisted'))
    })
  })

  describe("With anonymous models", function(){
    it("Should still interpolate values but changes will not be updated", function(){
      var model1 = {persisted: "Chelsa Piers", hook: '1'}
        , model2 = {persisted: "Columbus circle", hook: '2'}
        , model3 = {persisted: "Soho", hook: '3'}
      this.collection.add([model1, model2, model3])
      var template = generateTemplate({users: this.collection}, this.templateString)
      expect($('.1').html()).to.be(model1.persisted)
      expect($('.2').html()).to.be(model2.persisted)
      expect($('.3').html()).to.be(model3.persisted)
      model1.persisted = 'Changed1'
      model2.persisted = 'Changed2'
      model3.persisted = 'Changed3'
      expect($('.1').html()).to.be("Chelsa Piers")
      expect($('.2').html()).to.be("Columbus circle")
      expect($('.3').html()).to.be("Soho")
    })
  })

})
