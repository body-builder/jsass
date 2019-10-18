let i = 0;

function myLoop(files) {
  require(files[i]);

  i++;
  if (i < files.length) {
    setTimeout(function() {
      myLoop(files);
    }, 3000);
  }
}

module.exports = {
  myLoop
};