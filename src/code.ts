interface FormService {
  saveValue(value: FormValue): void;
}

class FormServiceImpl implements FormService {
  private slackClient: SlackClient;
  private spreadSheetClient: SpreadsheetClient;

  constructor(slackClient: SlackClient, spreadSheetClient: SpreadsheetClient) {
    this.slackClient = slackClient;
    this.spreadSheetClient = spreadSheetClient;
  }

  saveValue(value: FormValue): void {
    // スプレッドシートにデータを追加
    this.spreadSheetClient.appendRow(value.toRow());

    // Slackにメッセージを送信
    this.slackClient.post(value.toMessage());
  }
}

interface FormValue {
  toRow(): string[];
  toMessage(): string;
}

class FormValueImpl implements FormValue {
  private date: Date;
  private selected: string;
  private name: string;
  private email: string;

  constructor(date: Date, selected: string, name: string, email: string) {
    this.date = date;
    this.selected = selected;
    this.name = name;
    this.email = email;
  }

  toRow(): string[] {
    return [formatDate(this.date), this.selected, this.name, this.email];
  }

  toMessage(space: number = 4): string {
    const text: string = JSON.stringify(
      {
        date: formatDate(this.date),
        selected: this.selected,
        name: this.name,
        email: this.email,
      },
      null,
      space
    );
    return `form data\n${text}`;
  }
}

class SpreadsheetClient {
  private sheet;
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;
  }

  appendRow(row: string[]) {
    this.sheet.appendRow(row);
  }
}

class SlackClient {
  private webhookUrl: string;
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  post(text: string) {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        text: text,
      }),
      muteHttpExceptions: true,
    };

    UrlFetchApp.fetch(this.webhookUrl, options);
  }
}

function formatDate(dt: Date) {
  dt.setTime(dt.getTime() - dt.getTimezoneOffset() * 60 * 1000);
  const formattedDate = dt
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)
    .replaceAll("-", "/");
  return formattedDate;
}

function getSlackUrl(): string {
  const properties = PropertiesService.getScriptProperties();
  const url = properties.getProperty("WEBHOOK_URL") ?? "";

  return url;
}

/**
 * main
 */

const webhookUrl: string = getSlackUrl();
const slackClient = new SlackClient(webhookUrl);

const sheet = SpreadsheetApp.getActiveSheet();
const spreadSheetClient = new SpreadsheetClient(sheet);

const serive: FormService = new FormServiceImpl(slackClient, spreadSheetClient);

function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  const htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
  return htmlOutput;
}

function doPost(e: { selected: string; name: string; email: string }) {
  const now = new Date();
  const value: FormValue = new FormValueImpl(now, e.email, e.name, e.email);

  serive.saveValue(value);
}
