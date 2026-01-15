@echo off
setlocal EnableDelayedExpansion

echo Activating virtual environment...
call .\backend_python_api\pinterest_venv\Scripts\activate

echo Script execution completed
python run_all.py

:: Start a new command prompt with the activated virtual environment
cmd /k

