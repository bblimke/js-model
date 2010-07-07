Model.InstanceMethods = {
  attr: function(name, value) {
    var self = this;
    var setAttr = function (name, value) {
      // Don't write to attributes yet, store in changes for now.
      if (_.isEqual(self.attributes[name], value)) {
        // Clean up any stale changes.
        delete self.changes[name];
      } else {
        self.changes[name] = value;
      }
    };
    
    if (arguments.length === 0) {
      // Combined attributes/changes object.
      return jQuery.extend({}, this.attributes, this.changes);
    } else if (arguments.length === 2) {
      setAttr(name, value);
      this.trigger("change");
      return this;
    } else if (typeof name === "object") {
      // Mass-assign attributes.
      for (var key in name) {
        setAttr(key, name[key]);
      }
      this.trigger("change");
      return this;
    } else {
      // Changes take precedent over attributes.
      return (name in this.changes) ?
        this.changes[name] :
        this.attributes[name];
    }
  },

  callPersistMethod: function(method, callback) {
    var self = this;

    // Automatically manage adding and removing from the model's Collection.
    var manageCollection = function() {
      if (method === "create") {
        self.constructor.add(self);
      } else if (method === "destroy") {
        self.constructor.remove(self.id());
      }
    };

    // Wrap the existing callback in this function so we always manage the
    // collection and trigger events from here rather than relying on the
    // persistence adapter to do it for us. The persistence adapter is
    // only required to execute the callback with a single argument - a
    // boolean to indicate whether the call was a success - though any
    // other arguments will also be forwarded to the original callback.
    var wrappedCallback = function(success) {
      if (success) {
        // Merge any changes into attributes and clear changes.
        self.merge(self.changes).reset();

        // Add/remove from collection if persist was successful.
        manageCollection();

        // Trigger the event before executing the callback.
        self.trigger(method);
      }

      // Store the return value of the callback.
      var value;

      // Run the supplied callback.
      if (callback) value = callback.apply(self, arguments);

      return value;
    };

    if (this.constructor.persistence) {
      this.constructor.persistence[method](this, wrappedCallback);
    } else {
      wrappedCallback.call(this, true);
    }
  },

  destroy: function(callback) {
    this.callPersistMethod("destroy", callback);
    return this;
  },

  id: function() {
    return this.attributes.id || null;
  },

  merge: function(attributes) {
    jQuery.extend(this.attributes, attributes);
    return this;
  },

  newRecord: function() {
    return this.id() === null;
  },

  reset: function() {
    this.errors.clear();
    this.changes = {};
    return this;
  },

  save: function(callback) {
    if (this.valid()) {
      var method = this.newRecord() ? "create" : "update";
      this.callPersistMethod(method, callback);
    } else if (callback) {
      callback(false);
    }

    return this;
  },

  update: function(attributes) {
    this.merge(attributes).trigger("update");
    return this;
  },

  valid: function() {
    this.errors.clear();
    this.validate();
    return this.errors.size() === 0;
  },

  validate: function() {
    return this;
  }
};
