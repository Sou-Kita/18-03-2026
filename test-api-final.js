const http = require("http");

const BASE_URL = "http://localhost:3000/api/v1";
const ROLE_ID = "69b0ddec842e41e8160132b8";

function httpRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
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

    let registerRes = await httpRequest(
      "POST",
      "/api/v1/auth/register",
      registerData,
    );
    if (registerRes.status !== 200) {
      // If duplicate key error, retry with different username
      if (
        registerRes.data.message &&
        registerRes.data.message.includes("E11000")
      ) {
        console.log(
          "⚠️  Username already exists. Retrying with new username...",
        );
        registerData.username =
          "testuser_" +
          Math.random().toString(36).substring(2, 7) +
          "_" +
          Math.floor(Date.now() / 1000);
        registerData.email = registerData.username + "@example.com";
        registerRes = await httpRequest(
          "POST",
          "/api/v1/auth/register",
          registerData,
        );
        if (registerRes.status !== 200) {
          throw new Error(
            "Register failed: " + JSON.stringify(registerRes.data),
          );
        }
      } else {
        throw new Error("Register failed: " + JSON.stringify(registerRes.data));
      }
    }
    console.log("✓ User registered successfully");
    console.log("User ID:", registerRes.data._id);
    console.log();

    // Step 2: Login
    console.log("Step 2: Logging in...");
    let loginRes = await httpRequest("POST", "/api/v1/auth/login", {
      username: registerData.username,
      password: registerData.password,
    });
    if (loginRes.status !== 200) {
      throw new Error("Login failed: " + JSON.stringify(loginRes.data));
    }
    console.log("✓ Login successful");
    let token = loginRes.data;
    console.log("Token (RS256 JWT):", token.substring(0, 50) + "...");
    console.log();

    // Step 3: Test /me endpoint
    console.log("Step 3: Testing /me endpoint...");
    let meRes = await httpRequest("GET", "/api/v1/auth/me", null, {
      Authorization: `Bearer ${token}`,
    });
    if (meRes.status !== 200) {
      throw new Error("/me endpoint failed: " + JSON.stringify(meRes.data));
    }
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

    let changePassRes = await httpRequest(
      "POST",
      "/api/v1/auth/changepassword",
      {
        oldpassword: registerData.password,
        newpassword: "NewTest@54321",
      },
      {
        Authorization: `Bearer ${token}`,
      },
    );
    if (changePassRes.status !== 200) {
      throw new Error(
        "Change password failed: " + JSON.stringify(changePassRes.data),
      );
    }
    console.log("✓ Password changed successfully");
    console.log("Response:", changePassRes.data);
    console.log();

    // Step 5: Try logging in with new password
    console.log("Step 5: Verifying new password by logging in...");
    let loginRes2 = await httpRequest("POST", "/api/v1/auth/login", {
      username: registerData.username,
      password: "NewTest@54321",
    });
    if (loginRes2.status !== 200) {
      throw new Error("Login with new password failed");
    }
    console.log("✓ Login with new password successful");
    console.log("New Token:", loginRes2.data.substring(0, 50) + "...");
    console.log();

    console.log("=".repeat(50));
    console.log("All tests passed successfully! ✓");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testAPI();
