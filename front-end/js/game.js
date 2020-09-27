(function($) {
    main = function() {
        //         mapLength, mapWidth, trailWidth, multiplier, dir, stone, animal, food
        mapCreator( 40,       10,       2,          20,         0.3, 0.0,   0.0,    0.0);
    }
    $(document).ready(main);
})(jQuery);