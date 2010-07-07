module("Model.Callbacks");

test("class-level", function() {
  var Post = Model('post');
  var results = [];

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });
  var post3 = new Post({ id: 3 });

  Post.bind("add", function() {
    results.push(this);
    results.push("add");
    for (var i = 0; i < arguments.length; i++) {
      results.push(arguments[i]);
    };
  });

  Post.bind("remove", function() {
    results.push(this);
    results.push("remove");
  })

  Post.bind("custom", function() {
    results.push(this);
    results.push("custom");
  }).bind("custom", function() {
    results.push(this);
    results.push("custom-2");
  })

  Post.bind("not-called", function() {
    results.push("not-called");
  });

  Post.add(post1, post2);
  Post.add(post1);
  Post.add(post3);
  Post.remove(1);
  Post.remove(666);
  Post.trigger("custom");

  same(results, [
    Post, "add", post1, post2,
    Post, "add", post3,
    Post, "remove",
    Post, "custom",
    Post, "custom-2"
  ]);
});

test("instance-level", function() {
  var Post = Model("post");
  var results = [];

  var post = new Post({ title: "Foo", body: "..." });

  post.bind("create", function() {
    results.push(this);
    results.push("create");
  }).bind("update", function() {
    results.push(this);
    results.push("update");
  }).bind("custom", function(data1, data2, data3) {
    results.push(this);
    results.push("custom");
    results.push(data1);
    results.push(data2);
    results.push(data3);
  }).bind("custom", function(data1, data2, data3) {
    results.push(this);
    results.push("custom-2");
    results.push(data1);
    results.push(data2);
    results.push(data3);
  }).bind("destroy", function() {
    results.push(this);
    results.push("destroy");
  });

  post.bind("not-called", function() {
    results.push("not-called");
  });

  post.save();
  post.attributes.id = 1;
  post.save();
  post.trigger("custom", [1, 2]);
  post.attr('title', 'changed')
  post.destroy();

  same(results, [
    post, "create",
    post, "update",
    post, "custom", 1, 2, undefined,
    post, "custom-2", 1, 2, undefined,
    post, "destroy"
  ]);
});

test("triggering changed event when an instance changes", function () {
  var Post = Model("post");

  var post = new Post({title: 'blah'})
  var changeFlag = false

  post.bind('change', function () {
    changeFlag = true
  })

  ok(!changeFlag)

  // event should be fired when changing an existing attribute
  changeFlag = false
  post.attr('title', 'qwerty')
  ok(changeFlag, "change callback not fired")

  // event should be fired when adding a new attribute
  changeFlag = false
  post.attr('new_attr', 'still a change')
  ok(changeFlag, "change callback not fired")

  // event should be fired when mass assigning
  changeFlag = false
  post.attr({'mass': 'assignment', 'is': 'fun'})
  ok(changeFlag, "change callback not fired")

  // don't fire change event when not changing attrs
  changeFlag = false
  post.attr()
  ok(!changeFlag, "change callback fired when it shouldn't")

})

test("unbind all callbacks for an event", function() {
  var Post = Model("post");
  var results = [];

  var post = new Post({ title: "Foo", body: "..." });

  post.bind("create", function() {
    results.push("create");
  }).bind("update", function() {
    results.push("update");
  }).bind("custom", function() {
    results.push("custom");
  }).bind("custom", function() {
    results.push("custom-2");
  }).bind("destroy", function() {
    results.push("destroy");
  });

  post.unbind("create");
  post.unbind("update");
  post.unbind("custom");
  post.unbind("destroy");

  post.save();
  post.attributes.id = 1;
  post.save();
  post.trigger("custom");
  post.destroy();

  same(results, []);
});

test("unbind a specific event callback by function", function() {
  var Post = Model("post");
  var results = [];
  var callback = function() {
    results.push("bad");
  };

  var post = new Post();

  post.bind("custom", callback).bind("custom", function() {
    results.push("good");
  });
  post.unbind("custom", callback);
  post.trigger("custom");

  same(results, ["good"]);
});
