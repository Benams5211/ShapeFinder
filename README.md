I worked on a copy of the https://github.com/Benams5211/ShapeFinder/tree/feature/shape-finder-mel branch, as it was helpful to have the image object that needed to appear on the "Wanted" poster.

I just did the changes in the sketch.js file.

- Mainly modified the drawPosterBuffer() function.
- posterBackground variable is holding the path of the poster background image, which is located in the assets folder.
- The image is loaded from the path after the canvas is rendered to avoid the delay of waiting for the image to load.

The implementation could be moved to the updated codebase in the future when we have a stable codebase altogether.
