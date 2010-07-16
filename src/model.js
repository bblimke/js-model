var Model = function(name, class_methods, instance_methods) {
  class_methods = class_methods || {};
  instance_methods = instance_methods || {};

  // The model constructor.
  var model = function(attributes) {
    this.attributes = attributes || {};
    this.callbacks = {}
    this.changes = {};
    this.callbacks = [];
    this.errors = new Model.Errors(this);
  };

  model.callbacks = {}

  // Apply class methods and extend with any custom class methods. Make sure
  // vitals are added last so they can't be overridden.
  jQuery.extend(model, Model.Callbacks, Model.ClassMethods, class_methods, {
    _name: name,
    collection: [],

    // Convenience method to allow a simple method of chaining class methods.
    chain: function(collection) {
      return jQuery.extend({}, this, { collection: collection });
    }
  });

  // Add default and custom instance methods.
  jQuery.extend(model.prototype, Model.Callbacks, Model.InstanceMethods,
    instance_methods);

  return model;
};
