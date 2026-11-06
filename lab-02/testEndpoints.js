const http = require("http");

const BASE_URL = "http://localhost:3000";

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING ENDPOINT TESTS ===\n");

  // 1. GET ALL BOOKS
  console.log("1. Testing GET /books/...");
  const res1 = await makeRequest("GET", "/books/");
  console.log(`Status: ${res1.status} ${res1.statusText}`);
  console.log(`Total books retrieved: ${res1.data.length}`);
  console.log("First 2 books:", JSON.stringify(res1.data.slice(0, 2), null, 2));
  console.log("-------------------------------------------\n");

  // 2. GET SINGLE BOOK
  console.log("2. Testing GET /books/3/...");
  const res2 = await makeRequest("GET", "/books/3/");
  console.log(`Status: ${res2.status} ${res2.statusText}`);
  console.log("Book details:", JSON.stringify(res2.data, null, 2));
  console.log("-------------------------------------------\n");

  // 3. POST ADD BOOK
  console.log("3. Testing POST /books/...");
  const newBook = {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    price: 899,
    pages: 352,
  };
  const res3 = await makeRequest("POST", "/books/", newBook);
  console.log(`Status: ${res3.status} ${res3.statusText}`);
  console.log("Response:", JSON.stringify(res3.data, null, 2));
  console.log("-------------------------------------------\n");

  // 4. PUT UPDATE BOOK
  console.log("4. Testing PUT /books/3/...");
  const updatePayload = {
    title: "1984 (Special Edition)",
    author: "George Orwell",
    price: 349,
    pages: 335,
  };
  const res4 = await makeRequest("PUT", "/books/3/", updatePayload);
  console.log(`Status: ${res4.status} ${res4.statusText}`);
  console.log("Response:", JSON.stringify(res4.data, null, 2));
  console.log("-------------------------------------------\n");

  // 5. DELETE BOOK
  console.log("5. Testing DELETE /books/5/...");
  const res5 = await makeRequest("DELETE", "/books/5/");
  console.log(`Status: ${res5.status} ${res5.statusText}`);
  console.log("Response:", JSON.stringify(res5.data, null, 2));
  console.log("-------------------------------------------\n");

  // 6. GET 404 NOT FOUND CASE
  console.log("6. Testing GET /books/999/ (Error case)...");
  const res6 = await makeRequest("GET", "/books/999/");
  console.log(`Status: ${res6.status} ${res6.statusText}`);
  console.log("Response:", JSON.stringify(res6.data, null, 2));
  console.log("-------------------------------------------\n");

  // 7. GET ALL BOOKS AFTER MODIFICATIONS
  console.log("7. Final GET /books/ to verify database state...");
  const res7 = await makeRequest("GET", "/books/");
  console.log(`Status: ${res7.status} ${res7.statusText}`);
  console.log(`Total books now: ${res7.data.length}`);
  console.table(res7.data);
  console.log("-------------------------------------------\n");

  console.log("=== ALL ENDPOINT TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(console.error);
