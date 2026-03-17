(function () {
  var TOTAL_PAGES = 28;
  var TOTAL_VIDEOS = 14;
  var PAGE_PAUSE = 1000;

  var flipbook = null;
  var bgVideo = null;

  var originalPageWidth = 0;
  var originalPageHeight = 0;

  var autoFlipActive = false;
  var autoFlipTimer = null;
  var internalTurn = false;

  var flipSound = new Audio("start-flip.mp3");
  var endSound = new Audio("end-flip.mp3");

  flipSound.preload = "auto";
  endSound.preload = "auto";

  function shuffle(array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function playFlipSound() {
    try {
      flipSound.pause();
      flipSound.currentTime = 0;
      flipSound.play().catch(function () {});
    } catch (e) {}
  }

  function playEndSound() {
    try {
      endSound.pause();
      endSound.currentTime = 0;
      endSound.play().catch(function () {});
    } catch (e) {}
  }

  function stopAutoFlip() {
    autoFlipActive = false;
    if (autoFlipTimer) {
      clearTimeout(autoFlipTimer);
      autoFlipTimer = null;
    }
  }

  function getScaledBookSize() {
    var viewportW = window.innerWidth;
    var viewportH = window.innerHeight;

    var fullBookW = originalPageWidth * 2;
    var fullBookH = originalPageHeight;

    var marginX = 140;
    var marginY = 110;

    var maxW = Math.max(320, viewportW - marginX);
    var maxH = Math.max(320, viewportH - marginY);

    var scale = Math.min(maxW / fullBookW, maxH / fullBookH, 1);

    return {
      width: Math.round(fullBookW * scale),
      height: Math.round(fullBookH * scale)
    };
  }

  function fitBook() {
    if (!flipbook || !originalPageWidth || !originalPageHeight) return;

    var size = getScaledBookSize();

    $("#book-shell").css({
      width: size.width + "px",
      height: size.height + "px"
    });

    flipbook.turn("size", size.width, size.height);
  }

  function buildPages(callback) {
    var firstImage = new Image();

    firstImage.onload = function () {
      originalPageWidth = firstImage.naturalWidth;
      originalPageHeight = firstImage.naturalHeight;

      var holder = document.getElementById("flipbook");
      holder.innerHTML = "";

      for (var i = 1; i <= TOTAL_PAGES; i++) {
        var page = document.createElement("div");
        page.className = "page";

        var img = document.createElement("img");
        img.src = "imgs/imgs/home_" + i + ".png";
        img.alt = "Page " + i;
        img.draggable = false;

        page.appendChild(img);
        holder.appendChild(page);
      }

      callback();
    };

    firstImage.onerror = function () {
      alert("Could not load imgs/imgs/home_1.png");
    };

    firstImage.src = "imgs/imgs/home_1.png";
  }

  function autoFlipStep() {
    if (!autoFlipActive || !flipbook) return;

    var currentPage = flipbook.turn("page");
    var lastPage = flipbook.turn("pages");

    if (currentPage >= lastPage) {
      playEndSound();
      stopAutoFlip();
      return;
    }

    autoFlipTimer = setTimeout(function () {
      if (!autoFlipActive) return;

      internalTurn = true;
      playFlipSound();
      flipbook.turn("next");
      internalTurn = false;

      var newPage = flipbook.turn("page");

      if (newPage >= lastPage) {
        autoFlipTimer = setTimeout(function () {
          playEndSound();
          stopAutoFlip();
        }, PAGE_PAUSE);
      } else {
        autoFlipStep();
      }
    }, PAGE_PAUSE);
  }

  function startAutoFlip() {
    if (!flipbook || autoFlipActive) return;
    autoFlipActive = true;
    autoFlipStep();
  }

  function initBook() {
    flipbook = $("#flipbook");

    var initialSize = getScaledBookSize();

    flipbook.turn({
      width: initialSize.width,
      height: initialSize.height,
      autoCenter: true,
      gradients: true,
      acceleration: true,
      elevation: 50,
      duration: 1200
    });

    flipbook.bind("turning", function () {
      if (autoFlipActive && !internalTurn) {
        stopAutoFlip();
      }
    });

    flipbook.bind("turned", function () {
      fitBook();
    });

    $(window).bind("mousewheel", function (event, delta) {
      if (!flipbook) return;

      stopAutoFlip();

      if (delta > 0) {
        playFlipSound();
        flipbook.turn("previous");
      } else {
        playFlipSound();
        flipbook.turn("next");
      }

      event.preventDefault();
    });

    fitBook();
  }

  function initKeyboard() {
    document.addEventListener("keydown", function (e) {
      if (!flipbook) return;

      if (e.code === "Space") {
        e.preventDefault();

        if (autoFlipActive) {
          stopAutoFlip();
        } else {
          startAutoFlip();
        }
      }

      if (e.keyCode === 37) {
        e.preventDefault();
        stopAutoFlip();
        playFlipSound();
        flipbook.turn("previous");
      }

      if (e.keyCode === 39) {
        e.preventDefault();
        stopAutoFlip();
        playFlipSound();
        flipbook.turn("next");
      }
    });
  }

  function initBackgroundVideo() {

  bgVideo = document.getElementById("bg-video");
  if (!bgVideo) return;

  /* =========================================
     ORIGINAL MULTI VIDEO ROTATION CODE
     (COMMENTED OUT — DO NOT DELETE)
  ========================================= */

  /*
  var sources = [];
  for (var i = 1; i <= TOTAL_VIDEOS; i++) {
    sources.push("vids/" + i + ".mp4");
  }

  var shuffled = shuffle(sources);
  var index = 0;

  function playCurrent() {
    bgVideo.src = shuffled[index];
    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.volume = 0;
    bgVideo.playsInline = true;

    var promise = bgVideo.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  bgVideo.addEventListener("ended", function () {

    index++;

    if (index >= shuffled.length) {
      shuffled = shuffle(sources);
      index = 0;
    }

    playCurrent();
  });

  playCurrent();
  */

  /* =========================================
     SINGLE VIDEO VERSION
  ========================================= */

  bgVideo.src = "vids/1.mp4"; // your one video
  bgVideo.muted = true;
  bgVideo.defaultMuted = true;
  bgVideo.volume = 0;
  bgVideo.playsInline = true;
  bgVideo.loop = true;

  // once metadata loads we know duration
  bgVideo.addEventListener("loadedmetadata", function () {

    var duration = bgVideo.duration;

    if (duration && duration > 5) {

      // start somewhere random in the video
      var randomStart = Math.random() * (duration - 5);

      bgVideo.currentTime = randomStart;
    }

    var playPromise = bgVideo.play();

    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }

  });

}

  function init() {
    initBackgroundVideo();
    initKeyboard();

    buildPages(function () {
      initBook();
    });

    window.addEventListener("resize", fitBook);
  }

  $(document).ready(init);
})();