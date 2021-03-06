// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
// variables and constants
const API_KEY = "53347d537f0143dfb390e4a816c50efa";
const URL_BASE = "https://newsapi.org/v2";

const hideArticle = () => {
  document.querySelector(".container-back").remove();
}; // get a single article


const showArticle = ({
  title,
  publishedAt,
  source,
  url,
  urlToImage,
  content
}) => {
  const parent = document.querySelector(".app-container");
  const template = `
<div class="container-back">
        <div class="full-story-container">
          <button class="action-btn">
              <span>&#10005;</span>
          </button>
          <h4 class="story-title">${title}</h4>

          <div class="story-img">
            <img src=${urlToImage} alt="${title}" />
          </div>
          <div class="story-content">${content || "content not available"}</div>
          <div class="story-desc">
              <div class="story-category">life</div>
              <div class="story-pub-date">${Math.round((new Date() - new Date(publishedAt)) / 3600000)} mins ago</div>
              <div class="story-source">from ${source.name}</div>
          </div>
        </div>
      </div>
`;
  const node = document.createElement("template");
  node.innerHTML = template;
  node.content.children[0].children[0].children[0].addEventListener("click", () => {
    hideArticle();
  });
  parent.append(node.content);
}; // get top articles


const getTopArticles = async (preferredCategories = ["entertainment", "business", "technology"]) => {
  const request = new Request(`${URL_BASE}/top-headlines?country=us&category=${preferredCategories[0]}&apiKey=${API_KEY}`, {
    method: "GET"
  });
  return fetch(request).then(response => response.json()).then(data => data.articles);
};

const renderArticles = async () => {
  const parent = document.getElementById("user-stories-group");

  const storyTemplate = ({
    title,
    publishedAt,
    urlToImage
  }) => {
    const html = `
    <div class="story-container top-story">
              <div class="story-desc">
                <h4 class="story-title">
                  ${title}
                </h4>
                <div>
                  <span class="story-category">life</span>
                  <span class="story-pub-date">${Math.round((new Date() - new Date(publishedAt)) / 3600000)} mins ago</span>
                </div>
              </div>
              <div class="story-img">
                <img src=${urlToImage} alt=${title} />
              </div>
            </div>
    `;
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content;
  };

  const articles = await getTopArticles();
  articles.forEach(article => {
    const node = storyTemplate(article);
    node.children[0].addEventListener("click", () => {
      showArticle(article);
    });
    parent.append(node);
  });
};

(async function init() {
  // check if service worker API is supported
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceWorker.js", {}).then(registration => {
      console.log(`serviceWorker registered successfully with scope ${registration.scope}`);
    }).catch(error => {
      console.log(`ServiceWorker registration failed with error ${error}`);
    });
  } // listen to beforeinstallprompt on window object to use a custom install banner for PWA


  let deferredPrompt;
  self.addEventListener("beforeinstallprompt", evt => {
    evt.preventDefault(); // Stash the event so it can be triggered later.

    deferredPrompt = evt;
    document.querySelector("#installBtn").addEventListener("click", () => {
      document.querySelector("#installBanner").style.display = "none";
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        deferredPrompt = null;
      });
    });
    document.querySelector("#cancel").addEventListener("click", () => {
      document.querySelector("#installBanner").style.display = "none";
    });
    document.querySelector("#installBanner").style.display = "block";
  }); //Request for notification permission

  const ID1 = setTimeout(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(result => {
        if (result = "denied") {
          return;
        }

        if (result = "default") {
          return;
        }
      });
    }

    clearTimeout(ID1);
  }, 5000); //send a push notification
  // const ID2 = setTimeout(() => {
  //   if ("Notification" in window && Notification.permission === "granted") {
  //     // navigator.serviceWorker.getRegistration().then()
  //     const notification = new Notification(
  //       "Welcome to the finest news in town!"
  //     );
  //   }
  //   clearTimeout(ID2);
  // }, 10000);
  // add event listeners for the offline and online events
  // so that we can notify the user that the content is cached

  if (navigator.onLine !== true) {
    document.querySelector(".toast").style.display = "block";
    setTimeout(() => {
      document.querySelector(".toast").style.display = "none";
    }, 5000);
  }

  self.addEventListener("offline", () => {
    document.querySelector(".toast").style.display = "block";
    const timeoutID = setTimeout(() => {
      document.querySelector(".toast").style.display = "none";
      clearTimeout(timeoutID);
    }, 5000);
  });
  await renderArticles();
})();
},{"/Users/avpaul/code/news-mate/src/serviceWorker.js":[["serviceWorker.js","serviceWorker.js"],"serviceWorker.js.map","serviceWorker.js"]}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61061" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map