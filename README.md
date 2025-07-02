# desi-flavors-hub

## Optimization Notes

### Video Optimization

Video files in `public/HomeCarousel` can significantly impact page load times. Consider the following optimizations:

1.  **Compression:** Use video compression tools to reduce file size without significant quality loss.
2.  **Format:** Consider using more efficient video formats like WebM, which often provides better compression than MP4.
3.  **Lazy Loading:** Implement lazy loading for videos so they only load when they are in the viewport.
4.  **Streaming:** For very large videos, consider using a streaming service.