@echo off
echo Setting up Android development environment...

:: Set JAVA_HOME to Android Studio's bundled JDK
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo JAVA_HOME set to: %JAVA_HOME%

:: Set ANDROID_HOME (you'll need to update this path after SDK installation)
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo ANDROID_HOME set to: %ANDROID_HOME%

:: Add to PATH
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%ANDROID_HOME%\platform-tools;%PATH%

:: Test Java installation
echo.
echo Testing Java installation:
"%JAVA_HOME%\bin\java.exe" -version

echo.
echo Environment variables set for this session.
echo To make permanent, add these to your system environment variables:
echo   JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo   ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo   Add to PATH: %%JAVA_HOME%%\bin;%%ANDROID_HOME%%\tools;%%ANDROID_HOME%%\tools\bin;%%ANDROID_HOME%%\platform-tools

pause
