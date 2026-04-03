@echo off
REM Testing Script for NNPTUD-S4 API with RS256 JWT

setlocal enabledelayedexpansion

REM Set variables
set BASE_URL=http://localhost:3000/api/v1
set USERNAME=testuser
set EMAIL=testuser@example.com
set PASSWORD=Test@12345
set NEW_PASSWORD=NewTest@54321
set ROLE_ID=69b0ddec842e41e8160132b8

echo ============================================
echo NNPTUD-S4 API Testing with RS256 JWT
echo ============================================
echo.

REM Step 1: Register a user
echo Step 1: Registering a new user...
echo Username: %USERNAME%
echo Email: %EMAIL%
echo Password: %PASSWORD%
echo.

curl -X POST "%BASE_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%USERNAME%\",\"password\":\"%PASSWORD%\",\"email\":\"%EMAIL%\",\"role\":\"%ROLE_ID%\"}" 

echo.
echo.

REM Step 2: Login
echo Step 2: Logging in with the user...
echo.
for /f "tokens=*" %%i in ('curl -s -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%USERNAME%\",\"password\":\"%PASSWORD%\"}"') do set TOKEN=%%i

echo Token received (RS256 format): %TOKEN%
echo.
echo.

REM Step 3: Test /me endpoint
echo Step 3: Testing /me endpoint with RS256 JWT...
echo.
curl -X GET "%BASE_URL%/auth/me" ^
  -H "Authorization: Bearer %TOKEN%"

echo.
echo.

REM Step 4: Test changepassword endpoint
echo Step 4: Testing changepassword endpoint...
echo Old Password: %PASSWORD%
echo New Password: %NEW_PASSWORD%
echo.
curl -X POST "%BASE_URL%/auth/changepassword" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"oldpassword\":\"%PASSWORD%\",\"newpassword\":\"%NEW_PASSWORD%\"}"

echo.
echo.
echo ============================================
echo Testing Complete!
echo ============================================

endlocal
