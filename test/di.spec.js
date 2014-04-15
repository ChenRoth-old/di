var modulePath = "../";
$di = require(modulePath)();

var should = require('should');

describe('di',function() {


	beforeEach(function() {
		$di = require(modulePath)().
		register('dep1', { foo: "bar"});				

	});	


	it('should load dependencies from a map file', function() {


		var path = __dirname + "/dep-map";
		require(modulePath)(path);
		var map = require(path);

		for (dep in map)
		{
			($di.has(dep)).should.equal(true, dep + " isn't registered");			
		}
	});

	it('should throw error on missing dependency', function() {

		(function() { $di.inject('not-registered') }).should.throw(new Error("dependency not-registered isn't registered"));		
	});


	it('should inject dependency', function() {

		var dep1 = $di.inject('dep1');
		(dep1.foo).should.equal("bar");

	});

	it('should handle nested dependency', function() {

		$di.
		register('dep2', function() { 

			var $dep1 = $di.inject('dep1');			
			return $dep1.foo;

		}).
		register('dep3', function() { 

			var $dep2 = $di.inject('dep2');
			return $dep2();

		});

		var dep3 = $di.inject('dep3');
		(dep3()).should.equal("bar");

	});


	it('should override dependency',function() {

		$di.override('dep1', { test: "overridden" });
		var dep1 = $di.inject('dep1');		

		(dep1.test).should.equal("overridden");

	})

	it('should merge a dependency', function() {
		$di.override('dep1', {"bar": "foo"}, true);
		var dep1 = $di.inject('dep1');
		
		(dep1.foo).should.equal("bar");
		(dep1.bar).should.equal("foo");
		

	});


	it('should restore a single dependency', function() {

		var dep1, 
				dep2;

		$di.
		register('dep1', 1).override('dep1', 3).		
		register('dep2', 2).override('dep2', 4);

		dep1 = $di.inject('dep1');
		dep2 = $di.inject('dep2');

		(dep1).should.equal(3);
		(dep2).should.equal(4);

		$di.restore('dep1');

		dep1 = $di.inject('dep1');
		dep2 = $di.inject('dep2');

		(dep1).should.equal(1);
		(dep2).should.equal(4);
		
	});

	it('should restore all dependencies', function() {

		var dep1, 
				dep2;

		$di.
		register('dep1', 1).override('dep1', 3).		
		register('dep2', 2).override('dep2', 4);

		dep1 = $di.inject('dep1');
		dep2 = $di.inject('dep2');

		(dep1).should.equal(3);
		(dep2).should.equal(4);
		
		$di.restore();

		dep1 = $di.inject('dep1');
		dep2 = $di.inject('dep2');

		(dep1).should.equal(1);
		(dep2).should.equal(2);
		

	})


});