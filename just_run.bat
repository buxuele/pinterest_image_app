@echo off
setlocal EnableDelayedExpansion

:: Activate virtual environment and keep it active
echo Activating virtual environment...
call .\python_api\pinterest_venv\Scripts\activate
if !errorlevel! neq 0 (
    echo Failed to activate virtual environment
    exit /b 1
)

:: 2. Check and handle requirements.txt
echo Script execution completed


echo Script execution completed
:: Run the Python script
python run_all.py


:: Start a new command prompt with the activated virtual environment
cmd /k


