define(['jquery'], function($) {
    
    /*!
     * jQuery Tiny Pub/Sub - v0.6 - 1/10/2011
     * http://benalman.com/
     *
     * Copyright (c) 2010 "Cowboy" Ben Alman
     * Dual licensed under the MIT and GPL licenses.
     * http://benalman.com/about/license/
     *
     * We purposely use an older version of the Tiny Pub/Sub implementation
     * because we want to keep API parity with existing code.
     * Newer versions meant the 'event' object would be passed as the first
     * argument to the subscriber/callback and this meant changing all our 
     * EventEmitter code. I decided it was best to avoid that issue and use 
     * an older version whose only difference is to strip off the first 
     * argument so as to result in a true refactoring where we don't tamper
     * with the interface, just the implementation.
     */

    // Create a "dummy" jQuery object on which to bind, `off` and `trigger` event handlers. 
    var o = $({});

    /*
        Subscribe to a topic. Works just like `on`, except the passed handler
        is wrapped in a function so that the event object can be stripped out.
        Even though the event object might be useful, it is unnecessary and
        will only complicate things in the future should the user decide to move
        to a non-$.event-based pub/sub implementation.
     */
    $.on = function( topic, fn ) {
        // Call fn, stripping out the 1st argument (the event object).
        function wrapper() {
            return fn.apply(this, Array.prototype.slice.call(arguments, 1));
        }

        // Add .guid property to function to allow it to be easily unbound. Note
        // that $.guid is new in jQuery 1.4+, and $.event.guid was used before.
        wrapper.guid = fn.guid = fn.guid || ($.guid ? $.guid++ : $.event.guid++);

        // Bind the handler.
        o.on( topic, wrapper );
    };

    // Unsubscribe from a topic. Works exactly like unbind.
    $.off = function() {
        o.off.apply( o, arguments );
    };

    // Publish a topic. Works exactly like trigger.
    $.emit = function() {
        o.trigger.apply( o, arguments );
    };
});