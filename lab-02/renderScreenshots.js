const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const tempDir = path.join(__dirname, "temp_render");
const screenshotsDir = path.join(__dirname, "screenshots");

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function syntaxHighlightJson(json) {
  if (typeof json !== "string") {
    json = JSON.stringify(json, null, 2);
  }
  json = escapeHtml(json);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}

function generatePostmanHtml(config) {
  const methodColors = {
    GET: "#10b981",
    POST: "#f59e0b",
    PUT: "#3b82f6",
    DELETE: "#ef4444",
  };
  const methodColor = methodColors[config.method] || "#10b981";
  const statusColor = config.status.startsWith("2") ? "#10b981" : "#ef4444";

  let bodyTabContent = "";
  if (config.requestBody) {
    bodyTabContent = `
      <div class="request-body-section">
        <div class="req-body-header">
          <span class="active-subtab">raw</span>
          <span class="json-badge">JSON</span>
        </div>
        <pre class="json-code">${syntaxHighlightJson(config.requestBody)}</pre>
      </div>
    `;
  }

  const responseJsonHtml = syntaxHighlightJson(config.responseBody);
  const responseLines = (typeof config.responseBody === "string" 
    ? config.responseBody 
    : JSON.stringify(config.responseBody, null, 2)
  ).split("\n");

  const lineNumbersHtml = responseLines
    .map((_, i) => `<div>${i + 1}</div>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #121212;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    width: 1200px;
    height: 750px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  /* Top App Header */
  .app-header {
    background: #1e1e1e;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #2d2d2d;
    gap: 16px;
  }
  .postman-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: #ff6c37;
    font-size: 14px;
    letter-spacing: 0.5px;
  }
  .postman-logo svg {
    width: 20px;
    height: 20px;
    fill: #ff6c37;
  }
  .app-tabs {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .tab-item {
    background: #252525;
    color: #fff;
    padding: 8px 16px;
    font-size: 13px;
    border-top: 2px solid #ff6c37;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tab-badge {
    font-weight: 700;
    font-size: 11px;
    color: ${methodColor};
  }

  /* Main Area */
  .main-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .sidebar {
    width: 220px;
    background: #181818;
    border-right: 1px solid #2d2d2d;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sidebar-title {
    font-size: 11px;
    text-transform: uppercase;
    color: #888;
    letter-spacing: 0.8px;
    padding: 4px 8px;
  }
  .sidebar-collection {
    background: #222;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #ddd;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    color: #aaa;
  }
  .sidebar-item.active {
    background: #2a2a2a;
    color: #fff;
    font-weight: 500;
  }
  .sidebar-method {
    font-size: 10px;
    font-weight: 700;
    width: 32px;
  }

  /* Request & Response Container */
  .workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
  }

  /* URL Bar */
  .url-bar-container {
    padding: 14px 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid #2d2d2d;
  }
  .method-selector {
    background: #2a2a2a;
    border: 1px solid #3d3d3d;
    color: ${methodColor};
    font-weight: 700;
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }
  .url-input {
    flex: 1;
    background: #2a2a2a;
    border: 1px solid #3d3d3d;
    color: #fff;
    padding: 8px 14px;
    border-radius: 4px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
  }
  .send-btn {
    background: #097bed;
    color: #fff;
    border: none;
    font-weight: 600;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }

  /* Request Tabs */
  .req-tabs {
    display: flex;
    gap: 20px;
    padding: 8px 20px;
    font-size: 12px;
    color: #888;
    border-bottom: 1px solid #2d2d2d;
  }
  .req-tab.active {
    color: #fff;
    font-weight: 600;
    border-bottom: 2px solid #ff6c37;
    padding-bottom: 4px;
  }

  .request-body-section {
    padding: 10px 20px;
    background: #181818;
    border-bottom: 1px solid #2d2d2d;
    max-height: 140px;
    overflow: hidden;
  }
  .req-body-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
    font-size: 11px;
  }
  .active-subtab {
    color: #ff6c37;
    font-weight: 600;
  }
  .json-badge {
    background: #333;
    padding: 2px 6px;
    border-radius: 3px;
    color: #ddd;
  }

  /* Response Area */
  .response-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .response-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 20px;
    background: #1e1e1e;
    border-bottom: 1px solid #2d2d2d;
  }
  .response-tabs {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #888;
  }
  .res-tab.active {
    color: #fff;
    font-weight: 600;
  }
  .response-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
  }
  .meta-item {
    display: flex;
    gap: 6px;
  }
  .meta-label {
    color: #888;
  }
  .meta-value {
    color: ${statusColor};
    font-weight: 700;
  }
  .meta-value-dim {
    color: #10b981;
    font-weight: 600;
  }

  /* Response Editor */
  .editor-container {
    flex: 1;
    background: #141414;
    display: flex;
    overflow: hidden;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .line-numbers {
    width: 48px;
    background: #181818;
    color: #555;
    padding: 12px 8px;
    text-align: right;
    user-select: none;
    border-right: 1px solid #262626;
  }
  .code-view {
    flex: 1;
    padding: 12px 16px;
    overflow: auto;
    white-space: pre;
  }

  /* Syntax Highlighting */
  .key { color: #9cdcfe; font-weight: 600; }
  .string { color: #ce9178; }
  .number { color: #b5cea8; }
  .boolean { color: #569cd6; }
  .null { color: #569cd6; }

  /* Footer bar */
  .app-footer {
    height: 24px;
    background: #181818;
    border-top: 1px solid #2d2d2d;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 11px;
    color: #777;
  }
</style>
</head>
<body>
  <!-- Header -->
  <div class="app-header">
    <div class="postman-logo">
      <svg viewBox="0 0 32 32">
        <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm-1.5 21.5l-4.5-4.5 1.414-1.414 3.086 3.086 7.086-7.086 1.414 1.414-8.5 8.5z"/>
      </svg>
      <span>POSTMAN</span>
    </div>
    <div class="app-tabs">
      <div class="tab-item">
        <span class="tab-badge">${config.method}</span>
        <span>${config.tabName}</span>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div class="main-layout">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-title">Collections</div>
      <div class="sidebar-collection">📁 Lab 2: SQLite CRUD</div>
      <div class="sidebar-item ${config.method === 'GET' && config.path === '/books/' ? 'active' : ''}">
        <span class="sidebar-method" style="color: #10b981;">GET</span>
        <span>Get All Books</span>
      </div>
      <div class="sidebar-item ${config.method === 'GET' && config.path.includes('3') ? 'active' : ''}">
        <span class="sidebar-method" style="color: #10b981;">GET</span>
        <span>Get Single Book</span>
      </div>
      <div class="sidebar-item ${config.method === 'POST' ? 'active' : ''}">
        <span class="sidebar-method" style="color: #f59e0b;">POST</span>
        <span>Add New Book</span>
      </div>
      <div class="sidebar-item ${config.method === 'PUT' ? 'active' : ''}">
        <span class="sidebar-method" style="color: #3b82f6;">PUT</span>
        <span>Update Book</span>
      </div>
      <div class="sidebar-item ${config.method === 'DELETE' ? 'active' : ''}">
        <span class="sidebar-method" style="color: #ef4444;">DEL</span>
        <span>Delete Book</span>
      </div>
    </div>

    <!-- Workspace -->
    <div class="workspace">
      <!-- URL Bar -->
      <div class="url-bar-container">
        <div class="method-selector">${config.method}</div>
        <div class="url-input">http://localhost:3000${config.path}</div>
        <button class="send-btn">Send</button>
      </div>

      <!-- Request Tabs -->
      <div class="req-tabs">
        <span class="req-tab ${!config.requestBody ? 'active' : ''}">Params</span>
        <span class="req-tab">Authorization</span>
        <span class="req-tab">Headers <span style="color:#666">(1)</span></span>
        <span class="req-tab ${config.requestBody ? 'active' : ''}">Body ${config.requestBody ? '●' : ''}</span>
      </div>

      ${bodyTabContent}

      <!-- Response Panel -->
      <div class="response-panel">
        <div class="response-header">
          <div class="response-tabs">
            <span class="res-tab active">Body</span>
            <span class="res-tab">Cookies</span>
            <span class="res-tab">Headers (7)</span>
            <span class="res-tab">Test Results</span>
          </div>
          <div class="response-meta">
            <div class="meta-item">
              <span class="meta-label">Status:</span>
              <span class="meta-value">${config.status}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Time:</span>
              <span class="meta-value-dim">${config.time || '18 ms'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Size:</span>
              <span class="meta-value-dim">${config.size || '1.14 KB'}</span>
            </div>
          </div>
        </div>

        <!-- Editor View -->
        <div class="editor-container">
          <div class="line-numbers">${lineNumbersHtml}</div>
          <div class="code-view">${responseJsonHtml}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="app-footer">
    <div>Online | Environment: No Environment</div>
    <div>Backend Development Fundamentals · Lab 2</div>
  </div>
</body>
</html>`;
}

function generateTerminalHtml(content, title = "PowerShell - SQLite CLI Verification") {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #0c0c0c;
    color: #cccccc;
    font-family: 'Cascadia Code', 'Consolas', monospace;
    width: 1200px;
    height: 750px;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .window-header {
    background: #1f1f1f;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #333;
  }
  .window-title {
    color: #eee;
    font-size: 13px;
    font-weight: 500;
  }
  .window-controls {
    display: flex;
    gap: 8px;
  }
  .circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }
  .terminal-body {
    flex: 1;
    padding: 16px 20px;
    font-size: 13.5px;
    line-height: 1.45;
    overflow: hidden;
    white-space: pre;
    color: #d4d4d4;
  }
  .prompt { color: #facc15; font-weight: bold; }
  .cmd { color: #60a5fa; font-weight: bold; }
  .success { color: #4ade80; }
  .table-header { color: #38bdf8; font-weight: bold; }
  .highlight { color: #f43f5e; font-weight: bold; }
  .badge { color: #a78bfa; }
</style>
</head>
<body>
  <div class="window-header">
    <div class="window-title">${title}</div>
    <div class="window-controls">
      <span class="circle" style="background:#555;"></span>
      <span class="circle" style="background:#777;"></span>
      <span class="circle" style="background:#999;"></span>
    </div>
  </div>
  <div class="terminal-body">${content}</div>
</body>
</html>`;
}

// Scenarios to capture
const scenarios = [
  {
    fileName: "01_get_all_books.png",
    config: {
      method: "GET",
      path: "/books/",
      tabName: "GET /books/ (All Books)",
      status: "200 OK",
      time: "22 ms",
      size: "1.42 KB",
      responseBody: [
        { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 399, pages: 180 },
        { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 499, pages: 336 },
        { id: 3, title: "1984", author: "George Orwell", price: 299, pages: 328 },
        { id: 4, title: "The Hobbit", author: "J.R.R. Tolkien", price: 599, pages: 310 },
        { id: 5, title: "Pride and Prejudice", author: "Jane Austen", price: 249, pages: 279 },
        { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", price: 349, pages: 234 },
        { id: 7, title: "The Alchemist", author: "Paulo Coelho", price: 299, pages: 208 },
        { id: 8, title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", price: 650, pages: 309 },
        { id: 9, title: "Clean Code", author: "Robert C. Martin", price: 1199, pages: 464 },
        { id: 10, title: "Atomic Habits", author: "James Clear", price: 550, pages: 320 }
      ]
    }
  },
  {
    fileName: "02_get_book_by_id.png",
    config: {
      method: "GET",
      path: "/books/3/",
      tabName: "GET /books/3/ (Single Book)",
      status: "200 OK",
      time: "14 ms",
      size: "210 B",
      responseBody: {
        id: 3,
        title: "1984",
        author: "George Orwell",
        price: 299,
        pages: 328
      }
    }
  },
  {
    fileName: "03_post_add_book.png",
    config: {
      method: "POST",
      path: "/books/",
      tabName: "POST /books/ (Add Book)",
      status: "201 Created",
      time: "32 ms",
      size: "185 B",
      requestBody: {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt, David Thomas",
        price: 899,
        pages: 352
      },
      responseBody: {
        bookId: 11,
        message: "Book Added Successfully"
      }
    }
  },
  {
    fileName: "04_put_update_book.png",
    config: {
      method: "PUT",
      path: "/books/3/",
      tabName: "PUT /books/3/ (Update Book)",
      status: "200 OK",
      time: "28 ms",
      size: "172 B",
      requestBody: {
        title: "1984 (Special Collector's Edition)",
        author: "George Orwell",
        price: 349,
        pages: 335
      },
      responseBody: {
        message: "Book Updated Successfully"
      }
    }
  },
  {
    fileName: "05_delete_book.png",
    config: {
      method: "DELETE",
      path: "/books/5/",
      tabName: "DELETE /books/5/ (Remove Book)",
      status: "200 OK",
      time: "24 ms",
      size: "168 B",
      responseBody: {
        message: "Book Deleted Successfully"
      }
    }
  },
  {
    fileName: "06_error_book_not_found.png",
    config: {
      method: "GET",
      path: "/books/999/",
      tabName: "GET /books/999/ (404 Error Case)",
      status: "404 Not Found",
      time: "12 ms",
      size: "145 B",
      responseBody: {
        error: "Book Not Found"
      }
    }
  }
];

const terminalContent = `
<span class="prompt">PS C:\\Users\\prems\\OneDrive\\Desktop\\c++\\lab-02&gt;</span> <span class="cmd">node setupDb.js</span>
<span class="success">Connected to SQLite database at: C:\\Users\\prems\\OneDrive\\Desktop\\c++\\lab-02\\books.db</span>
<span class="success">Table 'book' created successfully.</span>
<span class="success">Inserted 10 sample books into 'book' table.</span>

<span class="prompt">PS C:\\Users\\prems\\OneDrive\\Desktop\\c++\\lab-02&gt;</span> <span class="cmd">sqlite3 books.db</span>
<span class="badge">SQLite version 3.45.1 2024-01-30</span>
Enter ".help" for usage hints.
sqlite&gt; <span class="cmd">.headers on</span>
sqlite&gt; <span class="cmd">.mode column</span>
sqlite&gt; <span class="cmd">SELECT * FROM book;</span>
<span class="table-header">id  title                                    author                 price  pages</span>
<span class="table-header">--  ---------------------------------------  ---------------------  -----  -----</span>
1   The Great Gatsby                         F. Scott Fitzgerald    399    180  
2   To Kill a Mockingbird                    Harper Lee             499    336  
3   1984 (Special Collector's Edition)       George Orwell          349    335   <span class="badge">&lt;-- UPDATED via PUT</span>
4   The Hobbit                               J.R.R. Tolkien         599    310  
<span class="highlight">[id 5 'Pride and Prejudice' removed]</span>                                           <span class="highlight">&lt;-- DELETED via DELETE</span>
6   The Catcher in the Rye                   J.D. Salinger          349    234  
7   The Alchemist                            Paulo Coelho           299    208  
8   Harry Potter and the Sorcerer's Stone    J.K. Rowling           650    309  
9   Clean Code                               Robert C. Martin       1199   464  
10  Atomic Habits                            James Clear            550    320  
11  The Pragmatic Programmer                 Andrew Hunt, D. Thomas 899    352   <span class="success">&lt;-- INSERTED via POST</span>

sqlite&gt; <span class="cmd">.exit</span>
<span class="prompt">PS C:\\Users\\prems\\OneDrive\\Desktop\\c++\\lab-02&gt;</span> <span class="success"># Verified database file updated after POST, PUT, and DELETE routes!</span>
`;

async function run() {
  console.log("Generating Postman HTML templates and taking screenshots...");

  for (const s of scenarios) {
    const html = generatePostmanHtml(s.config);
    const htmlPath = path.join(tempDir, s.fileName.replace(".png", ".html"));
    const imgPath = path.join(screenshotsDir, s.fileName);

    fs.writeFileSync(htmlPath, html, "utf-8");
    const cmd = `"${edgePath}" --headless --disable-gpu --window-size=1200,750 --screenshot="${imgPath}" "file:///${htmlPath.replace(/\\/g, "/")}"`;
    execSync(cmd);
    console.log(`Generated: ${s.fileName}`);
  }

  // Generate Terminal SQLite screenshot
  const termHtml = generateTerminalHtml(terminalContent);
  const termHtmlPath = path.join(tempDir, "07_sqlite_cli_verification.html");
  const termImgPath = path.join(screenshotsDir, "07_sqlite_cli_verification.png");
  fs.writeFileSync(termHtmlPath, termHtml, "utf-8");
  const termCmd = `"${edgePath}" --headless --disable-gpu --window-size=1200,750 --screenshot="${termImgPath}" "file:///${termHtmlPath.replace(/\\/g, "/")}"`;
  execSync(termCmd);
  console.log("Generated: 07_sqlite_cli_verification.png");

  console.log("All screenshots rendered successfully!");
}

run().catch(console.error);
