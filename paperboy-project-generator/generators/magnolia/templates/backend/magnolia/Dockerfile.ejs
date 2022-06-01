FROM maven:3.6.3-jdk-13
COPY --from=neoskop/mgnl-deps:6.1 /root/.m2 /root/.m2
<% if (enterpriseEdition || maintenanceReleases) { %>
RUN echo "<settings><servers><server><id><% if (enterpriseEdition) { %>magnolia.enterprise.releases<% } else { %>magnolia.public.maintenance.releases<% } %></id><username><%= enterpriseEditionUsername %></username><password><%= enterpriseEditionPassword %></password></server></servers></settings>" > /mvn-settings.xml
<% } else { %>
RUN echo "<settings></settings>" > /mvn-settings.xml
<% } %>
COPY pom.xml ./
COPY webapp/pom.xml ./webapp/
RUN mvn -s /mvn-settings.xml -T 1C compile
COPY . ./
RUN mvn -s /mvn-settings.xml -T 1C package

FROM neoskop/mgnl-runtime-env:9.0.20-jre<%= javaVersion %>-slim
LABEL maintainer="devops@neoskop.de"
ENV JAVA_OPTS="-Xms1024m -Xmx2048m \
    -Dneoskop.magnolia.superuser.unlock=true \
    -Djava.awt.headless=true -Dfile.encoding=UTF-8 \
    -Dmagnolia.webapp.dir=/home/tomcat/repo/src/main/webapp -Xshare:off"
COPY --from=0 --chown=tomcat /webapp/target/webapp.war /usr/local/tomcat/webapps/ROOT.war
COPY --chown=tomcat light-modules /home/tomcat/repo/light-modules