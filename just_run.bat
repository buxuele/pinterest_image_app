@echo off
setlocal EnableDelayedExpansion

:: 1. Check and create virtual environment
if exist "venv\" (
    echo Virtual environment already exists, skipping creation
) else (
    echo Creating virtual environment...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo Failed to create virtual environment
        exit /b 1
    )
)

:: Activate virtual environment and keep it active
echo Activating virtual environment...
call venv\Scripts\activate
if !errorlevel! neq 0 (
    echo Failed to activate virtual environment
    exit /b 1
)

:: 2. Check and handle requirements.txt
if exist "requirements.txt" (
    echo Found requirements.txt, installing dependencies...
    pip install -r requirements.txt
    if !errorlevel! neq 0 (
        echo Failed to install dependencies
        exit /b 1
    )
) else (
    echo requirements.txt not found, creating empty file...
    type nul > requirements.txt
    echo Created empty requirements.txt
)

echo Script execution completed


echo Script execution completed
:: Run the Python script
python run_all.py


:: Start a new command prompt with the activated virtual environment
cmd /k

