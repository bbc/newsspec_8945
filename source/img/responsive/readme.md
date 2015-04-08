Example usage:

```
<div class="delayed-image-load" data-src="<%= pathStatic %>/<%= vocab_dir %>/img/320/testcard.jpg" data-width="320" style="width: 100%;"></div>
```

Configure image sizes in the following two files (make sure you use the same sizes across both files!):

* source/js/lib/news_special/bootstrap.js (in `availableWidths`)
* /tasks/images.js (in the `responsive_images` task)

Run `grunt images` to generate your responsive images.
