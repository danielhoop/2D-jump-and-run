import $ from 'jquery';

export const load_defer_img = (source) => {
  'use strict';
  return $.Deferred(function(task) {
    var image = new Image();
    image.onload = function() {
      task.resolve(image);
    };
    image.onerror = function() {
      task.reject();
    };
    image.src = source;
  }).promise();
}

export const loadlater = () => {
  'use strict';
  $('[data-defer]').each(function() {
    var t = $(this),
      pre = t.data('pre'),
      img = t.data('defer');
    $.when(load_defer_img(img)).done(function(image) {
      t.removeAttr('data-defer');
      if(t.is('img')) {
        t.prop('src', img);
      } else {
        if(t.has('> img:not([data-defer])').length > 0) {
          return;
        }
        if(typeof pre !== 'undefined') {
          t.prepend(image);
        } else {
          t.append(image);
        }
      }
    });
  });
}