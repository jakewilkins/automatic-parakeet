const BASE_URL = "https://github.com";

// Provide help text to the user.
browser.omnibox.setDefaultSuggestion({
  description: `Jump directly to GitHub Repo
    (e.g. "resque/resque" | "rails/rails")`
});

// Update the suggestions whenever the input is changed.
browser.omnibox.onInputChanged.addListener((text, addSuggestions) => {
  // let headers = new Headers({"Accept": "application/json"});
  let init = {method: 'HEAD'};
  let url = buildSearchURL(text);
  let request = new Request(url, init);

  fetch(request)
    .then(createSuggestionsFromResponse)
    .then(addSuggestions);
});

// Open the page based on how the user clicks on a suggestion.
browser.omnibox.onInputEntered.addListener((text, disposition) => {
  console.log(text);
  let url = ""
  let parts = text.split(' ');
  let repo = parts[0];
  if (!text.startsWith(BASE_URL)) {
    // Update the url if the user clicks on the default suggestion.
    url = `${BASE_URL}/${text}`;
  }

  // Hop to the file finder page instead of the index page.
  if (parts[1] == "t") {
    url = `${url}/find/master`
  }

  switch (disposition) {
    case "currentTab":
      browser.tabs.update({url});
      break;
    case "newForegroundTab":
      browser.tabs.create({url});
      break;
    case "newBackgroundTab":
      browser.tabs.create({url, active: false});
      break;
  }
});

function buildSearchURL(text) {
  let parts = text.split(' ');

  return `${BASE_URL}/${parts[0]}`;
}

function createSuggestionsFromResponse(response) {
  return new Promise(resolve => {
    let suggestions = [];
    let suggestionsOnEmptyResults = [{
      content: response.url,
      description: "That URL doesn't exist."
    }];
    console.log(response);
    if (!response.ok) {
      return resolve(suggestionsOnEmptyResults);
    }
    return resolve([
      {
        content: response.url,
        description: `Go to ${response.url}`
      }
    ]);
  });
}

