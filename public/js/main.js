require(['config'], function() {
require(['Endo'], function(Endo) {
    
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


    var root = new TestViewController({
        segues: {
            segueTest: next
        }
    });

    var nc = new Endo.NavigationViewController({
        el: document.body,
        rootViewController: root
    });
    nc.render();
});
});