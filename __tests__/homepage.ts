import { expect, describe, it, beforeAll, afterAll } from "@jest/globals";
import { By, Builder, Browser, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
require("chromedriver");

let driver: WebDriver;

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments("--headless");
  options.addArguments("--disable-gpu");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  driver.manage().setTimeouts({ implicit: 5000 });
});

afterAll(async () => {
  await driver.quit();
});

describe("Todo List Component", () => {
  beforeAll(async () => {
    await driver.get("http://localhost:3000");
  });

  it("should be at the root URL", async () => {
    const url = await driver.getCurrentUrl();
    expect(url).toBe("http://localhost:3000/");
  });

  it("should render the homepage with correct title", async () => {
    const title = await driver.findElement(By.css("h1")).getText();
    expect(title).toBe("Welcome to todo!");
  });

  it("should add a new todo", async () => {
    const inputField = await driver.findElement(By.css('input[type="text"]'));
    const addButton = await driver.findElement(By.css("button"));

    await inputField.sendKeys("New Todo Item");
    await addButton.click();

    const todoItems = await driver.findElements(By.css("li"));
    const lastTodoText = await todoItems[todoItems.length - 1].getText();

    expect(lastTodoText).toContain("New Todo Item");
  });

  it("should toggle a todo's completed status", async () => {
    const firstTodoCheckbox = await driver.findElement(
      By.css('li:first-child input[type="checkbox"]')
    );
    const firstTodoText = await driver.findElement(By.css("li:first-child p"));

    await firstTodoCheckbox.click();

    const isCompleted = await firstTodoText.getAttribute("class");
    expect(isCompleted).toContain("line-through");
  });

  it("should delete a todo", async () => {
    const initialTodoCount = (await driver.findElements(By.css("li"))).length;
    const deleteButton = await driver.findElement(
      By.css("li:first-child button")
    );

    await deleteButton.click();

    await driver.wait(async () => {
      const currentTodoCount = (await driver.findElements(By.css("li"))).length;
      return currentTodoCount === initialTodoCount - 1;
    }, 5000);

    const finalTodoCount = (await driver.findElements(By.css("li"))).length;
    expect(finalTodoCount).toBe(initialTodoCount - 1);
  });

  it("should not add an empty todo", async () => {
    const initialTodoCount = (await driver.findElements(By.css("li"))).length;
    const inputField = await driver.findElement(By.css('input[type="text"]'));
    const addButton = await driver.findElement(By.css("button"));

    await inputField.sendKeys("");
    await addButton.click();

    const finalTodoCount = (await driver.findElements(By.css("li"))).length;
    expect(finalTodoCount).toBe(initialTodoCount);
  });
});
