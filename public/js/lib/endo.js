define(['backbone'], function(Backbone) {
	
	var Endo = {};

	// Base View Controller	
	Endo.ViewController = Backbone.View.extend({
	});

	// Navigation View Controller
	//
	// Based on iOS UINavigationViewController
	//
	// Manage navigating from different views using 
	// a stack based approach.
	//
	// This works best for linear navigation.
	Endo.NavigationViewController = Endo.ViewController.extend({
		
		// Save the root view controller
		rootViewController: null,

		// Array of view controllers on the stack
		viewControllers: [],
		
		// Delegate to handle the following events
		//
		// - willShowViewController(viewController)
		// - didShowViewController(viewController)
		//
		// Not implemented yet. 
		delegate: null,

		// Initializes the navigation view
		//
		// Either the rootViewController or viewControllers property must be set in
		// the options parameter. If both are set, the rootViewController will take 
		// precedence and overwrite the viewControllers array.
		//
		// If only the viewControllers array is set, then the first view controller 
		// becomes the rootViewController.
		initialize: function(options) {
			this.rootViewController = options.rootViewController || this.rootViewController;
			this.viewControllers = options.viewControllers || this.viewControllers;
			if (!this.rootViewController && this.viewControllers.length === 0) {
				throw new Error("The EndoNavigationViewController needs to be initialized with a root view controller");
			}

			if (!this.rootViewController) {
				this.rootViewController = this.viewControllers[0];
			} else {
				this.viewControllers = [this.rootViewController];
			}
		},
		
		// Render view controller on top of stack
		render: function() {

		},

		// Get the view controller at the top of stack
		topViewController: function() {
			var top = null;
			var len = this.viewControllers.length;
			if (len > 0) {
				top = this.viewControllers[len - 1];
			}
			return top;
		},

		// Add a new view to top of stack
		pushViewController: function(controller) {
			this.viewControllers.push(controller);
		},

		// Remove view from top of stack
		popViewController: function() {
			if (this.viewControllers.length > 1) {
				this.viewControllers.pop();
			}
		},

		// Remove all views except the root
		popToRootViewController: function() {
			if (this.viewControllers.length > 1) {
				this.viewControllers = [this.rootViewController];
			}
		}
	});

	return Endo;
});
