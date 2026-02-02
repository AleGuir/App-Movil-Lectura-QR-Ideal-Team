@echo off
setlocal
echo ======================================================
echo Iniciando Event Validator App (Modo Tunel)...
echo ======================================================
echo.
echo Este modo permite conectar sin estar en la misma red WiFi.
echo Puede ser un poco mas lento que la conexion LAN.
echo.

REM Try to find npm in PATH
where npm >nul 2>nul
if %errorlevel% equ 0 (
    set "NPM_CMD=npm"
) else (
    if exist "C:\Program Files\nodejs\npm.cmd" (
        set "NPM_CMD=call "C:\Program Files\nodejs\npm.cmd""
    ) else (
        echo [ERROR] No se pudo encontrar Node.js.
        pause
        exit /b 1
    )
)

echo Iniciando servidor en modo Tunel...
echo Si es la primera vez, puede pedirte instalar @expo/ngrok.
echo Presiona 'y' y Enter si te lo pide.
echo.

cmd /c "npx expo start --tunnel -c"

pause
