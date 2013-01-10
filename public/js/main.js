require(['config'], function() {
require(['Endo'], function(Endo) {
 
     var TestViewControllerTwoLinks = Endo.ViewController.extend({
        el: '<p><a class="test">Test Link</a> <a class="test2">Test Link2</a></p>',
        events: {
            'click .test': 'nextView',
            'click .test2': 'nextView2'
        },
        nextView: function(events) {
            this.performSegue('segueTest');    
        },
        nextView2: function(events) {
            this.performSegue('segueTest2');    
        }        
    });
   
    var TestViewController = Endo.ViewController.extend({
        el: '<p><a class="test">Test Link</a></p>',
        events: {
            'click .test': 'nextView'
        },
        nextView: function(events) {
            this.performSegue('segueTest');    
        }
    });

    var nextNext = new Endo.ViewController({
        el: "<div>NEXT NEXT PAGE</div>"
    });

    var next = new TestViewController({
        el: '<p><a class="test">Test Link Next</a></p>',
        title: 'NEXT',
        segues: {
            segueTest: nextNext
        }
    });

    var nextAlt = new TestViewController({
        el: '<p><a class="test">Test Link Next Alt</a></p>',
        title: 'NEXT ALT',
        segues: {
            segueTest: nextNext
        }
    });

    var root = new TestViewControllerTwoLinks({
        segues: {
            segueTest: next,
            segueTest2: nextAlt
        }
    });

    var nc = new Endo.NavigationViewController({
        el: document.body,
        rootViewController: root
    });
    nc.render();
});
});