define(['backbone'], function(Backbone) {
	
	var Endo = {};

	// Base View Controller	
	Endo.ViewController = Backbone.View.extend({
	// Constants
	// ---------
	Endo.SEGUE_STYLE_PUSH = 'push';
	Endo.SEGUE_STYLE_MODAL = 'modal';


	// Endo.ViewController
	// -------------------
	
	// The view that all other Endo views inherit from.
	//
	// *Based on iOS ViewController.*

	// Create an Endo.ViewController.
	Endo.ViewController = function(options) {
		var propList = ['title', 'segues'];
		options = options || {};
		this._configureProps(options || {}, propList);
		this.template = options['template'] || null;
		Backbone.View.apply(this, [options]);		
	};

	_.extend(Endo.ViewController.prototype, Backbone.View.prototype, {

		// Title of view.
		//
		// May be used for navigation back button text.
		// Another use may be the title bar in browser.
		title: null,

		// If this is a nested view, we can get the parent view controller.
		parentViewController: null,

		// If this is a navigation view controller, we can get a reference.
		navigationController: null,

		// A dictionary of views we can transition to.
		// Currently only works with Navigation Controller.
		//
		// Examples:
		//
		// segues: {
		//     identifier: {
		//         style: Endo.SEGUE_STYLE_PUSH,
		//         destinationViewController: controller	
		//	   }	
		// }
		//
	    // segues: {
		//     identifier: controller
		// }
		segues: {},
		
		// Performs the transition to the next view if there is a
		// navigation controller.
		performSegue: function(identifier) {
			var segue = this.segues[identifier];

			if (this.navigationController && segue) {
				if (_.isObject(segue) && segue.destinationViewController) {
					segue.style = segue.style || Endo.SEGUE_STYLE_PUSH;
				} else {
					segue = {
						style: Endo.SEGUE_STYLE_PUSH,
						destinationViewController: segue
					};
				}
				this.prepareSegue(segue);
				this.navigationController.pushViewController(segue);
			}
		},

		// Override this method to setup destination view controller
		// before it gets pushed onto Navigation controller.
		prepareSegue: function(segue) {

		},

		// Set custom view options to be merged with property list
		_configureProps: function(options, propList) {
      		if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      		_.extend(this, _.pick(options, propList));			
		}
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
