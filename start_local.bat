
set base_dir=%cd%\aoame


set git_name=fuseki-heroku-test
cd %base_dir%\%git_name%
start fuseki-server.bat

set git_name=OntologyBasedModellingEnvironment-WebService
cd %base_dir%\%git_name%
start "" "start webserver.bat"

set git_name=OntologyBasedModellingEnvironment-WebApp
cd %base_dir%\%git_name%
start node server.js