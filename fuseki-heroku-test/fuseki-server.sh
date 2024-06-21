#!/bin/sh
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Run fuseki as a standalone server
# Check if Java is installed
# shellcheck disable=SC2039
if ! command -v java &> /dev/null
then
    echo "Java is not installed on your system."
    echo "Please install Java (JDK) from https://www.oracle.com/java/technologies/javase-jdk11-downloads.html"
    echo "Once installed, make sure to add Java to your PATH environment variable."
    exit 1
fi

# Set the server jar name
SERVER_JAR="fuseki-server.jar"

# Run the server with specified memory settings
java -Xmx1200M -jar "$SERVER_JAR" "$@"

# Adding custom code to the Fuseki server:
#
# It is also possible to launch Fuseki using
#   java ..jvmarsg... -cp $JAR org.apache.jena.fuseki.cmd.FusekiCmd "$@"
#
# In this way, you can add custom java to the classpath:
#
#  java ... -cp fuseki-server.jar:MyCustomCode.jar org.apache.jena.fuseki.cmd.FusekiCmd "$@"
