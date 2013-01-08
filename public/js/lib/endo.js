define(['backbone'], function(Backbone) {
    
    var Endo = {};

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
        //     }    
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
    // --------------------------

    // Manage navigating from different views using 
    // a stack based approach.
    //
    // This works best for linear navigation.
    //
    // *Based on iOS UINavigationViewController.*

    // Create an Endo.NavigationViewController.
    Endo.NavigationViewController = function(options) {     

        options = options || {};

        // Initializes the navigation view.
        //
        // Either the rootViewController or viewControllers property must be set in
        // the options parameter. If both are set, the rootViewController will take 
        // precedence and overwrite the viewControllers array.
        //
        // If only the viewControllers array is set, then the first view controller 
        // becomes the rootViewController.
        var len;
        this.rootViewController = options.rootViewController || this.rootViewController;
        this.viewControllers = options.viewControllers || this.viewControllers;
        if (!this.rootViewController && this.viewControllers.length === 0) {
            throw new Error("The EndoNavigationViewController needs to be initialized with a root view controller");
        }

        if (!this.rootViewController) {
            this.rootViewController = this.viewControllers[0];
            len = this.viewControllers.length;
            for (var i = 0; i < len; i++) {
                this.viewControllers[i].parentViewController = this;
                this.viewControllers[i].navigationController = this;
            }
        } else {
            this.viewControllers = [this.rootViewController];
        }


        // If no custom toolbar view is specified, create a default one.
        this.toolbarView = options['toolbarView'] || new Endo.ViewController();

        Endo.ViewController.apply(this, [options]);
    };
    
    _.extend(Endo.NavigationViewController.prototype, Endo.ViewController.prototype, {

        // Default template for navigation controller
        template: '<div class="toolbar"></div><div class="view"></div>',
        
        // Save the root view controller.
        rootViewController: null,

        // Toolbar view
        toolbarView: null,

        // Array of view controllers on the stack.
        viewControllers: [],
        
        // Delegate to handle the following events.
        //
        // - willShowViewController(viewController)
        // - didShowViewController(viewController)
        //
        // Not implemented yet. 
        delegate: null,

        // Render view controller on top of stack.
        render: function() {
            this.toolbarView.remove();
            $('.toolbar', this.el).append(this.toolbarView.render().el);
            $('.view', this.el).append(this.topViewController().render().el);
            return this;
        },

        // Get the view controller at the top of stack.
        topViewController: function() {
            var top = null;
            var len = this.viewControllers.length;
            if (len > 0) {
                top = this.viewControllers[len - 1];
            }
            return top;
        },

        // Add a new view to top of stack and render.
        pushViewController: function(controller) {
            var top = this.topViewController();
            controller.parentViewController = this;
            controller.navigationController = this;
            this.viewControllers.push(controller);
            
            top.remove();
            this.render();
        },

        // Remove view from top of stack and render previous controller.
        popViewController: function() {
            var controller;
            
            if (this.viewControllers.length > 1) {
                controller = this.viewControllers.pop();
                controller.parentViewController = null;
                controller.navigationController = null;
                controller.remove();
                this.render();
            }
        },

        // Remove all views except the root and render.
        popToRootViewController: function() {
            var top;
            if (this.viewControllers.length > 1) {
                top = this.topViewController();
                this.viewControllers = [this.rootViewController];
                top.remove();
                this.render();
            }
        }
    });

    return Endo;
});
