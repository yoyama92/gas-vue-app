function doGet() {
  const htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
  return htmlOutput;
}

function doPost(value) {
  const sheet = SpreadsheetApp.getActiveSheet();

  const now = formatDate(new Date());
  //最終行にデータを追加
  sheet.appendRow([now, value["selected"], value["name"], value["email"]]);
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
