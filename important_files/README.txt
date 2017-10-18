Important commands (as super-user)

To enable service for the first time and to make a service start at the startup (possibly after changing the
config files, as well - who knows) 
    # systemctl daemon-reload
    # systemctl enable <service name>

To start/stop/restart a service
    # systemctl start/stop/restart/status <service name>

To see the output printed of a service
    # journalctl -u <service name>

-----------------------------------------------------------------------------------------------------------
Important files for the project

1. Service files
    - webgme.service
    - jupyter.service
Instructions as to how to use these files can be found inside the files.

2. .jupyter directory
    - The directory which includes the config files for jupyter service/server
    - The path of this directory is given in jupyter.service file as an environment variable
    - Further instructions as to how to create this directory inside your home directory can be found at -
        http://jupyter-notebook.readthedocs.io/en/latest/config.html

3. Grafana config file
    - grafana.ini
    - grafana service should start at the startup, check with
        # systemctl status grafana-server
    - Config file goes in /etc/grafana/grafana.ini

-----------------------------------------------------------------------------------------------------------
Nginx is running as the reverse proxy server 
    - /etc/nginx/sites-available/default has all the configuration
    - Contents of the file "nginx-default" should go in that file
    - After changing the contents, restart the nginx service by giving the commands mentioned above

-----------------------------------------------------------------------------------------------------------
Services running on the machine -

1. WebGME (8888)
2. Jupyter (9000)
3. Ontoloy service (8890)
4. Influxdb (8088 and 8086 by default, configuration in /etc/influxdb/influxdb.conf)
5. grafana (3000)

