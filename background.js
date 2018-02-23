const BASE_URL = "https://github.com";

// Provide help text to the user.
browser.omnibox.setDefaultSuggestion({
  description: `Jump directly to a GitHub Repo (e.g. "gh resque/resque" | "rails/rails")`
});

// Open the page based on how the user clicks on a suggestion.
browser.omnibox.onInputEntered.addListener((text, disposition) => {
  let url = ""
  let parts = text.split(' ');
  let repo = parts[0];
  if (!text.startsWith(BASE_URL)) {
    url = `${BASE_URL}/${repo}`;
  }

  //Hop to things within repo, e.g. file finder, pulls, issues, or path.
  if (parts.length > 1) {
    if (parts[1] == "t") {
      url = `${url}/find/master`
    } else if (parts[1][0] == "i" && parts[1][0].length == 1) {
      url = `${url}/${formatPullOrIssueSearch(parts, "issues", "is:issue")}`
    } else if (parts[1][0] == "p" && parts[1][0].length == 1) {
      url = `${url}/${formatPullOrIssueSearch(parts, "pulls", "is:pr")}`
    } else {
      let pathPart = "";
      if (parts[1][0] == "/") { pathPart = parts[1] } else { pathPart = `/${parts[1]}` }
      url = `${url}/tree/master${pathPart}`
    }
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

function formatPullOrIssueSearch(parts, type, defaultq) {
  if (parts[2] === undefined) {
    return type;
  }

  let string = parts.slice(2, parts.length + 1).join(" ");
  if (string.includes("is:open") === false && string.includes("is:closed") === false ) {
    string = `${string} is:open`
  }

  return `${type}?q=${encodeURIComponent(`${defaultq} ${string}`)}`;
};

