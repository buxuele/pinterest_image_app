@echo off
setlocal EnableDelayedExpansion

:: Activate virtual environment and keep it active
echo Activating virtual environment...
call .\python_api\pinterest_venv\Scripts\activate

echo Script execution completed
:: Run the Python script
python run_all.py


:: Start a new command prompt with the activated virtual environment
cmd /k

