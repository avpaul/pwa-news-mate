// variables and constants
const API_KEY = "53347d537f0143dfb390e4a816c50efa";
const URL_BASE = "https://newsapi.org/v2";

const hideArticle = () => {
  document.querySelector(".container-back").remove();
};
// get a single article
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
              <div class="story-pub-date">${Math.round(
                (new Date() - new Date(publishedAt)) / 3600000
              )} mins ago</div>
              <div class="story-source">from ${source.name}</div>
          </div>
        </div>
      </div>
`;
  const node = document.createElement("template");
  node.innerHTML = template;
  node.content.children[0].children[0].children[0].addEventListener(
    "click",
    () => {
      hideArticle();
    }
  );
  parent.append(node.content);
};

// get top articles
const getTopArticles = async (
  preferredCategories = ["entertainment", "business", "technology"]
) => {
  const request = new Request(
    `${URL_BASE}/top-headlines?country=us&category=${
      preferredCategories[0]
    }&apiKey=${API_KEY}`,
    {
      method: "GET"
    }
  );

  return fetch(request)
    .then(response => response.json())
    .then(data => data.articles);
};

const renderArticles = async () => {
  const parent = document.getElementById("user-stories-group");
  const storyTemplate = ({
    title,
    publishedAt,
    source,
    url,
    urlToImage,
    content
  }) => {
    const html = `
    <div class="story-container top-story">
              <div class="story-desc">
                <h4 class="story-title">
                  ${title}
                </h4>
                <div>
                  <span class="story-category">life</span>
                  <span class="story-pub-date">${Math.round(
                    (new Date() - new Date(publishedAt)) / 3600000
                  )} mins ago</span>
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
    navigator.serviceWorker
      .register("/serviceWorker.js", {})
      .then(registration => {
        console.log(
          `serviceWorker registered successfully with scope ${
            registration.scope
          }`
        );
      })
      .catch(error => {
        console.log(`ServiceWorker registration failed with error ${error}`);
      });
  }

  // listen to beforeinstallprompt on window object to use a custom install banner for PWA
  let deferredPrompt;
  self.addEventListener("beforeinstallprompt", evt => {
    evt.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = event;
    document.querySelector("#installBtn").addEventListener("click", () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        deferredPrompt = null;
      });
    });
    document.querySelector("#cancel").addEventListener("click", () => {
      document.querySelector("#installBanner").style.display = "none";
    });
    document.querySelector("#installBanner").style.display = "block";
  });

  // add event listeners for the offline and online events
  // so that we can notify the user that the content is cached
  // self.addEventListener("online", () => {
  //   document.querySelector('.toast').style.display = 'block';
  //   setTimeout(()=>{
  //   document.querySelector('.toast').style.display = 'none';
  //   },5000);
  // });
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
