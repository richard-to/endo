(function(window, undefined) {
    
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


    // Endo.ButtonItem
    // ---------------

    // ButtonItem's are used by NavigationItems.
    // ButtonItem's have a one event, which is a click event.
    // A controller item can hook into this event using the target property.

    // Create button item.
    Endo.ButtonItem = function(options) {
        var propList = ['title'];
        options = options || {};
        this._configureProps(options || {}, propList);
        this.template = options['template'] || this.template;
        this.target = options['target'] || null;
        Backbone.View.apply(this, [options]); 
    };

    _.extend(Endo.ButtonItem.prototype, Backbone.View.prototype, {
        
        // Render button item.
        render: function() {
            this.$el.html(this.template);
            this.$('.button-item').html(this.title);
            this.delegateEvents();
            return this;       
        },

        title: null,

        // Button item template.
        template: '<button class="button-item"></button>',

        // Listen for click action on button item.
        events: {
            'click .button-item': '_action'
        },

        // Delegate to handle the following events.
        //
        // - willShowViewController(viewController)
        // - didShowViewController(viewController)
        //
        // Not implemented yet. 
        delegate: null,

        // Dispatch click event to target controller function
        // We could use the Backbone.Event listeners, but this is 
        // only a 1-to-1 action.
        _action: function(event) {
            if (_.isFunction(this.target)) this.target(this, event);
        },

        _configureProps: Endo.MixinConfigureProps
    });

    Endo.ButtonItem.extend = Backbone.View.extend;


    // Endo.BackButtonItem
    // -------------------

    // Custom BackButtonItem with a way to set default title for button if none is supplied.
    Endo.BackButtonItem = Endo.ButtonItem.extend({

        // Button item template.
        template: '<button class="back-button-item button-item"></button>',        
        
        // Default title to use if none is set.
        defaultTitle: 'Back',

        // Render button item.
        render: function() {
            var title = this.title || this.defaultTitle;
            this.$el.html(this.template);
            this.$('.button-item').html(title);
            this.delegateEvents();
            return this;       
        },
    });

    // Endo.NavigtionItem
    // -------------

    // Display by the NavigationBar.
    //
    // The NavigationItem contains the actual buttons
    // and title to be displayed.
    // 
    // The NavigatioBar mostly manages which NavigationItem
    // should be rendered.

    // Create an Endo.NavigationItem.
    Endo.NavigationItem = function(options) {
        var propList = ['title', 'leftBarButtonItems', 'rightBarButtonItems', 'backBarButtonItem', 'hideBackButton'];
        options = options || {};
        this._configureProps(options || {}, propList);

        if (!_.isObject(this.backBarButtonItem)) {
            this.backBarButtonItem = new Endo.BackButtonItem();
        }

        if (!_.isArray(this.leftBarButtonItems)) {
            this.leftBarButtonItems = [this.leftBarButtonItems];
        }

        if (!_.isArray(this.rightBarButtonItems)) {
            this.rightBarButtonItems = [this.rightBarButtonItems];
        }

        this.template = options['template'] || this.template;

        Backbone.View.apply(this, [options]);       
    };

    _.extend(Endo.NavigationItem.prototype, Backbone.View.prototype, {
        
        // Template for navigation bar. Still need to define basic template areas
        template: '<div class="back-bar-button-item"></div>' +
            '<div class="left-bar-button-items"></div>' +
            '<div class="title"></div>' +
            '<div class="right-bar-button-items"></div>',

        // Title that is displayed on navigation bar
        title: null,

        // Button items displayed to left of title
        leftBarButtonItems: [],

        // Button items displayed to right of title
        rightBarButtonItems: [],

        // Back button displayed on left of title
        backBarButtonItem: null,

        // Hide/Show the back button
        hideBackButton: false,

        // Configure properties
        _configureProps: Endo.MixinConfigureProps,

        // Render Navigation item
        render: function() {

            this.$el.html(this.template);

            if (!this.hideBackButton) {
                this.$('.back-bar-button-item').append(this.backBarButtonItem.render().el); 
            }  

            _.each(this.leftBarButtonItems, function(element, index, list) {
                this.$('.left-bar-button-items').append(element.render().el);
            }, this);

            this.$('.title').append(this.title); 

            _.each(this.rightBarButtonItems, function(element, index, list) {
                this.$('.right-bar-button-items').append(element.render().el);
            }, this);

            this.delegateEvents();

            return this;
        },

        // Change the title of the BackBarButtonItem.
        setBackBarButtonItemTitle: function(title) {
            if (this.backBarButtonItem) this.backBarButtonItem.title = title;
        },

        // Change the target of the BackBarButtonItem.
        setBackBarButtonItemTarget: function(target) {
            if (this.backBarButtonItem) this.backBarButtonItem.target = target;
        }        
    });

    Endo.NavigationItem.extend = Backbone.View.extend;


    // Endo.NavigationBar
    // ------------------

    // Used by the NavigationViewController to change the 
    // navigation bar items depending on the view
    Endo.NavigationBar = Backbone.View.extend({

        // Render navigation bar at top of stack
        render: function() {
            var top = this.topItem();
            if (top) this.$el.html(top.render().el);
            this.delegateEvents();            
            return this;
        },

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
            var top;
            if (_.isObject(navigationItem)) {
                top = this.topItem();
                if (top) top.remove();
                this.items.push(navigationItem);
            }
        },

        // Remove a navigation item from the stack.
        popNavigationItem: function() {
            var top = this.items.pop();
            if (top) top.remove();
        },

        // Clear all navigation items from stack.
        clear: function() {
            var top = this.topItem();
            if (top) top.remove();
            this.items = [];
        }
    });


    // Endo.ViewController
    // -------------------

    // The view controller that all other Endo views will inherit from.
    //
    // *Based on iOS ViewController.*

    // Create an Endo.ViewController.
    Endo.ViewController = function(options) {
        var propList = ['title', 'segues', 'navigationItem'];
        options = options || {};
        this._configureProps(options || {}, propList);
        this.template = options['template'] || this.template;
        this.navigationItem = this.navigationItem || new Endo.NavigationItem({title:this.title});
        Backbone.View.apply(this, [options]);       
    };

    _.extend(Endo.ViewController.prototype, Backbone.View.prototype, {

        render: function() {
            this.delegateEvents();
            return this;
        },

        // Template for view
        template: null,

        // Title of view.
        //
        // May be used for navigation back button text.
        // Another use may be the title bar in browser.
        title: null,

        // If this is a nested view, we can get the parent view controller.
        parentViewController: null,

        // If this is a navigation view controller, we can get a reference.
        navigationController: null,

        // If this is a layout view controller, we can get a reference.
        layoutViewController: null,

        // This will be displayed by the navigation bar controller.
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
        
        // Set layout view controller.
        setLayoutViewController: function(layoutViewController) {            
            // Only set layout controller as parent if no navigation controller.
            if (this.navigationController == null) {
                this.parentViewController = layoutViewController;
            }
            this.layoutViewController = layoutViewController;
        },

        // Unset layout view controller.
        unsetLayoutViewController: function() {            
            // Only set layout controller as parent if no navigation controller.
            if (this.navigationController == null) {
                this.parentViewController = null;
            }
            this.layoutViewController = null;
        },

        // Set navigation view controller.
        setNavigationViewController: function(navigationViewController) {
            this.parentViewController = navigationViewController;
            this.navigationController = navigationViewController;
        },

        // Unset navigation view controller.
        unsetNavigationViewController: function() {
            this.parentViewController = null;
            this.navigationController = null;
        },

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

    Endo.ViewController.extend = Backbone.View.extend;


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

        this.rootViewController.navigationItem.hideBackButton = true;
        this.rootViewController.setNavigationViewController(this);
        this.rootViewController.setLayoutViewController(this.layoutViewController);

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
            this.$('.navigation-bar').append(this.navigationBar.render().el);
            this.$('.view').append(this.topViewController().render().el);
            this.delegateEvents();            
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

            controller.setNavigationViewController(this);
            controller.setLayoutViewController(this.layoutViewController);

            this.viewControllers.push(controller);

            controller.navigationItem.setBackBarButtonItemTitle(top.navigationItem.title);
            controller.navigationItem.setBackBarButtonItemTarget(this._didPressBackButtonItem());

            this.navigationBar.pushNavigationItem(controller.navigationItem);

            top.remove();
            this.render();
        },

        // Remove view from top of stack and render previous controller.
        popViewController: function() {
            var controller;
            
            if (this.viewControllers.length > 1) {
                controller = this.viewControllers.pop();

                controller.unsetNavigationViewController();
                controller.unsetLayoutViewController();
                this.navigationBar.popNavigationItem();

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
                        element.unsetNavigationViewController();
                        element.unsetLayoutViewController();
                    }
                }, this);

                top = this.topViewController();
                this.viewControllers = [this.rootViewController];

                this.navigationBar.clear();
                this.navigationBar.pushNavigationItem(
                    this.rootViewController.navigationItem);

                top.remove();
                this.render();
            }
        },

        // Clean up child view controllers as well as itself.
        remove: function() {
          this.popToRootViewController();
          this.rootViewController.remove();
          
          this.$el.remove();
          this.stopListening();

          return this;
        },

        // Set layout view controller itself and for child controllers.
        setLayoutViewController: function(layoutViewController) {            
            this.parentViewController = layoutViewController;
            this.layoutViewController = layoutViewController;
            _.each(this.viewControllers, function(element, index, list) {
                controller.setLayoutViewController(layoutViewController);
            }, this);
        },

        // Not the best thing to do, but needed for keeping scope of function.
        _didPressBackButtonItem: function() {
            var view = this;
            return function(sender, event) {
                view.popViewController();
            }
        }
    });

    Endo.NavigationViewController.extend = Backbone.View.extend;


    // Layout View Controller
    // ----------------------

    // The Layout View Controller basically creates a bunch of divs.
    // and renders View Controllers in the divs.
    // This can be useful for a sidebar with a main view for instance.
    // Layout View Controllers can be nested for more complex layouts.

    // Creates an Endo.LayoutViewController.
    Endo.LayoutViewController = function(options) {
        var propList = ['wrapperEl'];
        options = options || {};
        this._configureProps(options || {}, propList);

        if (_.isObject(options['layout'])) {
            this.layout = options['layout'] || {};
            _.each(this.layout, function(element, index, list) {
                element.setLayoutViewController(this);
            }, this);
        }

        Endo.ViewController.apply(this, [options]);
    };

    _.extend(Endo.LayoutViewController.prototype, Endo.ViewController.prototype, {

        // Element to wrap child view controllers in.
        wrapperEl: '<div>',

        // Render layout view controller.
        render: function() {
            var div;
            this.$el.empty();

            _.each(this.layout, function(element, key, list) {
                div = $(this.wrapperEl);
                div.addClass(key);
                div.append(element.render().el);
                this.$el.append(div);
            }, this);

            this.delegateEvents();
            return this;
        },

        // Layout contains a dictionary of ViewControllers.
        // Dictionary key defines the class of the wrapper div that the view controller
        // will be rendered in.
        layout: {},

        // Clean up child view controllers in layout as well as itself.
        remove: function() {
            _.each(this.layout, function(element, index, list) {
                element.remove();
            }, this);

          this.$el.remove();
          this.stopListening();

          return this;
        }
    });

    Endo.LayoutViewController.extend = Backbone.View.extend;

    window.Endo = Endo;

    if (typeof define === "function" && define.amd && define.amd.Endo) {
        define( "endo", [], function () { return Endo; } );
    }

})(window);
