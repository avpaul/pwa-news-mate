// variables and constants
const API_KEY = "53347d537f0143dfb390e4a816c50efa";
const URL_BASE = "https://newsapi.org/v2";

// gets articles from given sources
const getArticle = () => {
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

const renderArticle = () => {
    const parent = document.getElementById("article-container");
  const storyTemplate = ({ title, publishedAt, source, url, urlToImage,content }) => {
    const html = `
    <div class="story-container top-story" href="./article?url=${url}">
              <div class="story-desc">
                <h4 class="story-title">
                  ${title}
                </h4>
                <div>
                  <span class="story-category">life</span>
                  <span class="story-pub-date">${publishedAt}</span>
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

  const article = await getArticle();
    parent.append(storyTemplate(article));
};

(() => {})()