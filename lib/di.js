var util = require('util');
var _ = require('lodash');

module.exports = function(path) {

	var self = this;

	_.extend(self, {
		deps: path ? require(path) : {},
		buffer: {},

		resolve: function(name) {

			if (!deps[name])
				throw new Error(util.format("dependency %s isn't registered", name));

			var reference = deps[name];

			if (typeof(reference) === "string")
				return require(reference);
			else
				return (function() { return reference; })();

		}

	});

	return {
		
		has: function(name) {
		
			return typeof(deps[name]) !== "undefined";
		},
		
		register: function(name, implementation) {
			
			if (deps[name])
				return this.override(name, implementation);
			
			deps[name] = implementation;			
			return this;			
		},
		
		override: function(name, implementation, merge) {

			merge = merge || false;

			if (self.deps[name])
				buffer[name] = _.cloneDeep(deps[name]);

			if (merge)
				_.extend(deps[name], implementation);
			else
				deps[name] = implementation;

			return this;
		},		

		restore: function(name) {
			
			if (!!arguments.length) 
				self.deps[name] = buffer[name];
			else
				_.extend(self.deps, buffer);			

			buffer = {};

		},

		stub: function(name) {

			if (!self.deps[name])
				throw new Error(util.format("dependency %s isn't registered", name));

			var dep = resolve(name);
			var mock = {};
			for (prop in dep)
				mock[prop] = {};

			return mock;
		},

		inject: function(names) {

			if (util.isArray(names))
			{
				for (n in names)
				{
					var name = names[n];
					if (!deps[name])
						throw new Error(util.format("dependency %s isn't registered", name));
				}

				var modules = [];
				for (n in names)
				{
					name = names[n];
					modules.push(resolve(name));
				}
				return modules;
			}
			else
			{
				return resolve(names);

			}

			return this;

		}


	};

};