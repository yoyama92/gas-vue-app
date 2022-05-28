function doGet() {
  const htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
  return htmlOutput;
}

function doPost(value) {
  const sheet = SpreadsheetApp.getActiveSheet();

  const now = formatDate(new Date());
  //最終行にデータを追加
  sheet.appendRow([now, value["selected"], value["name"], value["email"]]);

  const postText = JSON.stringify({
    "date": now,
    "selected": value["selected"],
    "name": value["name"],
    "email": value["email"]
  }, null, 4);

  postToSlack(postText)
}

function postToSlack(text) {
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify({
      "text": `form data\n${text}`
    }),
    "muteHttpExceptions": true
  };

  const url = getSlackUrl();
  UrlFetchApp.fetch(url, options);
}

function getSlackUrl() {
  const properties = PropertiesService.getScriptProperties();
  const url = properties.getProperty('WEBHOOK_URL');

  return url;
}

function formatDate(dt) {
  dt.setTime(dt.getTime() - dt.getTimezoneOffset() * 60 * 1000);
  const formattedDate = dt
    .toISOString()
    .replace("T", " ")
    .substr(0, 19)
    .replaceAll("-", "/");
  return formattedDate;
}
