const http = require("http");

const BASE_URL = "http://localhost:3000";

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
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
  console.log("Starting Lab 3 API Tests...\n");

  const res1 = await makeRequest("GET", "/books/");
  console.log("1. GET /books/ (Default):", res1.status, `Retrieved ${res1.data.length} books`);

  const res2 = await makeRequest("GET", "/books/?search_q=the");
  console.log("2. GET /books/?search_q=the:", res2.status, `Found ${res2.data.length} matches`);

  const res3 = await makeRequest("GET", "/books/?min_price=300&max_price=600");
  console.log("3. GET /books/?min_price=300&max_price=600:", res3.status, `Found ${res3.data.length} matches`);

  const res4 = await makeRequest("GET", "/books/?order_by=price&order=DESC&limit=4&offset=0");
  console.log("4. GET /books/?order_by=price&order=DESC&limit=4:", res4.status, `Top expensive:`, res4.data.map(b => `${b.title} (Rs.${b.price})`));

  const res5 = await makeRequest("GET", "/books/3/");
  console.log("5. GET /books/3/:", res5.status, res5.data.title);

  const res6 = await makeRequest("POST", "/books/", {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    price: 899,
    pages: 352
  });
  console.log("6. POST /books/ (Valid):", res6.status, res6.data);

  const res7 = await makeRequest("POST", "/books/", {
    author: "Unknown Author",
    price: 499
  });
  console.log("7. POST /books/ (Missing title):", res7.status, res7.data);

  const res8 = await makeRequest("POST", "/books/", {
    title: "Invalid Price Book",
    author: "Test Author",
    price: "not-a-number"
  });
  console.log("8. POST /books/ (Non-numeric price):", res8.status, res8.data);

  const res9 = await makeRequest("PUT", "/books/3/", {
    title: "1984 (Collector Edition)",
    author: "George Orwell",
    price: 349,
    pages: 335
  });
  console.log("9. PUT /books/3/ (Valid):", res9.status, res9.data);

  const res10 = await makeRequest("PUT", "/books/999/", {
    title: "Non Existent Book",
    author: "Ghost",
    price: 500,
    pages: 100
  });
  console.log("10. PUT /books/999/ (Not Found):", res10.status, res10.data);

  const res11 = await makeRequest("DELETE", "/books/5/");
  console.log("11. DELETE /books/5/ (Valid):", res11.status, res11.data);

  const res12 = await makeRequest("DELETE", "/books/999/");
  console.log("12. DELETE /books/999/ (Not Found):", res12.status, res12.data);

  const res13 = await makeRequest("GET", "/books/999/");
  console.log("13. GET /books/999/ (Not Found):", res13.status, res13.data);

  console.log("\nAll Lab 3 API Tests Completed Successfully!");
}

runTests().catch(console.error);
