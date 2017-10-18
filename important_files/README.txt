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



Services running on the machine -

1. WebGME (8888)
2. Jupyter (9000)
3. Ontoloy service (8890)
4. Influxdb (8088 and 8086 by default, configuration in /etc/influxdb/influxdb.conf)

