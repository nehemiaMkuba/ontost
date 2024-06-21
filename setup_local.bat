@echo off

rem This script can be used to setup AOAME locally.
rem Prerequisites: git ( https://git-scm.com/downloads ), Node.js ( https://nodejs.org )

rem ----------------------------------

rem Change these variable if you want to use a branch other than the master branch.
set webapp_branch=master
set webservice_branch=master
set fuseki_branch=master

rem --------------It is not recommended to change things below this line.---------------------

echo AOAME local setup script started.

set base_dir=%cd%\aoame

mkdir aoame

rem check if commands exist

where git
if %ERRORLEVEL% neq 0 (
	echo Git is required for this script to work. You can download it from https://git-scm.com/downloads
	pause
	goto end
)

where node
if %ERRORLEVEL% neq 0 (
	echo The webapp requires Node.js for it to work. You can download it from https://nodejs.org/en/
	pause
	goto end
)

where npm
if %ERRORLEVEL% neq 0 (
	echo The webapp requires npm for it to work. Make sure to also install npm while installing node.js from https://nodejs.org/en/
	pause
	goto end
)

:check_angular
where ng
if %ERRORLEVEL% neq 0 (
	echo Installing angular...
	npm install -g @angular/cli
	
	goto check_angular
)

rem clone and deploy fuseki
set git_name=fuseki-heroku-test
set git_repository=https://github.com/BPaaSModelling/fuseki-heroku-test.git
set branch=%fuseki_branch%

call :clone_repository

rem clone and deploy webservice
set git_name=OntologyBasedModellingEnvironment-WebService
set git_repository=https://github.com/BPaaSModelling/OntologyBasedModellingEnvironment-WebService.git
set branch=%webservice_branch%

call :clone_repository

rem clone and deploy webapp
set git_name=OntologyBasedModellingEnvironment-WebApp
set git_repository=https://github.com/BPaaSModelling/OntologyBasedModellingEnvironment-WebApp.git
set branch=%webapp_branch%

call :clone_repository

:setup_webapp
cd %base_dir%\%git_name%
npm install
ng build

pause
goto end

rem Clone a repository if it does not exist already.
:clone_repository

cd %base_dir%

if not exist %git_name% (
	
	echo Cloning %git_name% repository from %git_repository%
	
	call git clone %git_repository%
	
	if not exist %git_name% (
		echo Failed to clone repository %git_name% from %git_repository%
		pause
		exit
	)
)
goto end

:end
