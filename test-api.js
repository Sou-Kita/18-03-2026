const http = require("http");

const BASE_URL = "http://localhost:3000/api/v1";
const ROLE_ID = "69b0ddec842e41e8160132b8";

function httpRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
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
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAPI() {
  try {
    console.log("=".repeat(50));
    console.log("NNPTUD-S4 API Testing with RS256 JWT");
    console.log("=".repeat(50));
    console.log();

    // Step 1: Register
    console.log("Step 1: Registering a new user...");
    let registerData = {
      username: "testuser" + Date.now(),
      password: "Test@12345",
      email: "testuser" + Date.now() + "@example.com",
      role: ROLE_ID,
    };
    console.log("Username:", registerData.username);
    console.log("Email:", registerData.email);
    console.log();

    let registerRes = await axios.post(
      `${BASE_URL}/auth/register`,
      registerData,
    );
    console.log("✓ User registered successfully");
    console.log("User ID:", registerRes.data._id);
    console.log();

    // Step 2: Login
    console.log("Step 2: Logging in...");
    let loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: registerData.password,
    });
    console.log("✓ Login successful");
    let token = loginRes.data;
    console.log("Token (RS256 JWT):", token.substring(0, 50) + "...");
    console.log();

    // Step 3: Test /me endpoint
    console.log("Step 3: Testing /me endpoint...");
    let meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✓ /me endpoint working");
    console.log("Current User:", {
      _id: meRes.data._id,
      username: meRes.data.username,
      email: meRes.data.email,
    });
    console.log();

    // Step 4: Test changepassword endpoint
    console.log("Step 4: Testing changepassword endpoint...");
    console.log("Old Password: Test@12345");
    console.log("New Password: NewTest@54321");
    console.log();

    let changePassRes = await axios.post(
      `${BASE_URL}/auth/changepassword`,
      {
        oldpassword: registerData.password,
        newpassword: "NewTest@54321",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("✓ Password changed successfully");
    console.log("Response:", changePassRes.data);
    console.log();

    // Step 5: Try logging in with new password
    console.log("Step 5: Verifying new password by logging in...");
    let loginRes2 = await axios.post(`${BASE_URL}/auth/login`, {
      username: registerData.username,
      password: "NewTest@54321",
    });
    console.log("✓ Login with new password successful");
    console.log("New Token:", loginRes2.data.substring(0, 50) + "...");
    console.log();

    console.log("=".repeat(50));
    console.log("All tests passed successfully! ✓");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
