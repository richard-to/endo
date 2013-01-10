define(['backbone'], function(Backbone) {
    
    var Endo = {};

    // Mixins
    // ------

    // Set custom view options to be merged with property list   
    Endo.MixinConfigureProps = function(options, propList) {
        if (this.options) options = _.extend({}, _.result(this, 'options'), options);
        _.extend(this, _.pick(options, propList));
    };


    // Constants
    // ---------
    Endo.SEGUE_STYLE_PUSH = 'push';
    Endo.SEGUE_STYLE_MODAL = 'modal';


    // NavigtionItem
    // -------------

    // Display by the NavigationBar.
    //
    // The NavigationItem contains the actual buttons
    // and title to be displayed.
    // 
    // The NavigatioBar mostly manages which NavigationItem
    // should be rendered.

    // Create an Endo.ViewController.
    Endo.NavigationItem = function(options) {
        var propList = ['title', 'leftBarButtonItems', 'rightBarButtonItems', 'backBarButtonItem', 'hideBackButton'];
        options = options || {};
        this._configureProps(options || {}, propList);

        if (_.isObject(this.leftBarButtonItems)) {
            this.leftBarButtonItems = [this.leftBarButtonItems];
        }

        if (_.isObject(this.rightBarButtonItems)) {
            this.rightBarButtonItems = [this.rightBarButtonItems];
        }
        this.template = options['template'] || this.template;

        Backbone.View.apply(this, [options]);       
    };

    _.extend(Endo.NavigationItem.prototype, Backbone.View.prototype, {
        template: null,
        title: null,
        leftBarButtonItems: [],
        rightBarButtonItems: [],
        backBarButtonItem: null,
        hideBackButton: false,       
        _configureProps: Endo.MixinConfigureProps
    });


    // NavigationBar
    // ------------
    
    // Used by the NavigationViewController to change the 
    // navigation bar items depending on the view
    Endo.NavigationBar = Backbone.View.extend({

        // A stack of navigation items for navigation bar to render.
        items: [],

        // Get the item current on the top of the item stack.
        topItem: function() {
            var topItem = null;
            var len = this.items.length;

            if (len > 0) {
                topItem = this.items[len - 1];
            }
            return topItem;
        },
        // Gets the item right below the top item.
        backItem: function() {
            var backItem = null;
            var len = this.items.length;

            if (len > 1) {
                backItem = this.items[len - 2];
            }
            return backItem;
        },

        // Push a navigation item onto the stack.
        pushNavigationItem: function(navigationItem) {
            this.items.push(navigationItem);
        },

        // Remove a navigation item from the stack.
        popNavigationItem: function() {
            this.items.pop();
        }
    });


    // Endo.ViewController
    // -------------------
    
    // The view controller that all other Endo views will inherit from.
    //
    // *Based on iOS ViewController.*

    // Create an Endo.ViewController.
    Endo.ViewController = function(options) {
        var propList = ['title', 'segues'];
        options = options || {};
        this._configureProps(options || {}, propList);
        this.template = options['template'] || this.template;
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

        // This will be displayed by the navigation bar by the navigation bar controller.
        navigationItem: null,

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
        //
        // Modal style segue not implemented yet.
        performSegue: function(identifier) {
            var segue = this.segues[identifier];
            if (this.navigationController && segue) {
                if (_.isObject(segue) && segue.destinationViewController) {
                    segue.style = segue.style || Endo.SEGUE_STYLE_PUSH;
                } else {
                    segue = {
                        identifier: identifier,
                        style: Endo.SEGUE_STYLE_PUSH,
                        destinationViewController: segue
                    };
                }
                this.prepareSegue(segue);
                this.navigationController.pushViewController(segue.destinationViewController);
            }
        },

        // Override this method to setup destination view controller
        // before it gets pushed onto Navigation controller.
        prepareSegue: function(segue) {

        },

        _configureProps: Endo.MixinConfigureProps
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

        if (!this.rootViewController) {
            throw new Error("The EndoNavigationViewController needs to be initialized with a root view controller");
        }

        this.rootViewController.parentViewController = this;
        this.rootViewController.navigationController = this;
        this.viewControllers = options.viewControllers || this.viewControllers;
        this.viewControllers = [this.rootViewController];

        Endo.ViewController.apply(this, [options]);
    };
    
    _.extend(Endo.NavigationViewController.prototype, Endo.ViewController.prototype, {

        // Default template for navigation controller
        template: '<div class="navigation-bar"></div><div class="view"></div>',
        
        // Save the root view controller.
        rootViewController: null,

        // NavigationBar view
        navigationBar: new Endo.NavigationBar(),
        
        // Delegate to handle the following events.
        //
        // - willShowViewController(viewController)
        // - didShowViewController(viewController)
        //
        // Not implemented yet. 
        delegate: null,

        // Render view controller on top of stack.
        render: function() {
            this.navigationBar.remove();
            this.$el.html(this.template);
            $('.navigation-bar', this.el).append(this.navigationBar.render().el);
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
                _.each(this.viewControllers, function(element, index, list) {
                    if (element != this.rootViewController) {
                        element.parentViewController = null;
                        element.navigationController = null;
                    }
                }, this);

                top = this.topViewController();
                this.viewControllers = [this.rootViewController];
                top.remove();
                this.render();
            }
        }
    });

    // Add back the extend method
    Endo.ViewController.extend = Endo.NavigationViewController.extend = Backbone.View.extend;

    return Endo;
});
