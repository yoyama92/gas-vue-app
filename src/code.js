function doGet() {
  const htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
  return htmlOutput;
}

function doPost(value) {
  const sheet = SpreadsheetApp.getActiveSheet();
  //最終行にデータを追加
  sheet.appendRow([value["name"], value["email"]]);
}