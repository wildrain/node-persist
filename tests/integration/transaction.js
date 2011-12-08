
var persist = require("../../lib/persist");
var nodeunit = require("nodeunit");
var testUtils = require("../../test_helpers/test_utils");

exports['Transaction'] = nodeunit.testCase({
  setUp: function(callback) {
    var self = this;

    this.Person = persist.define("Person", {
      "name": persist.String
    });

    testUtils.connect(persist, function(err, connection) {
      self.connection = connection;
      self.connection.runSql("CREATE TABLE Person (id INTEGER PRIMARY KEY, name string);", function() {
        callback();
      });
    });
  },

  tearDown: function(callback) {
    this.connection.close();
    callback();
  },

  "rollback": function(test) {
    var self = this;
    var person1 = new this.Person({ name: "bob" });
    this.connection.tx(function(err, tx) {
      test.ifError(err);
      person1.save(self.connection, function(err, p) {
        tx.rollback(function(err) {
          test.ifError(err);
          self.Person.using(self.connection).all(function(err, items) {
            test.ifError(err);
            test.equals(items.length, 0);
            test.done();
          });
        });
      });
    });
  },

  "commit": function(test) {
    var self = this;
    var person1 = new this.Person({ name: "bob" });
    this.connection.tx(function(err, tx) {
      test.ifError(err);
      person1.save(self.connection, function(err, p) {
        test.ifError(err);
        tx.commit(function(err) {
          test.ifError(err);
          self.Person.using(self.connection).all(function(err, items) {
            test.ifError(err);
            test.equals(items.length, 1);
            test.done();
          });
        });
      });
    });
  }
});