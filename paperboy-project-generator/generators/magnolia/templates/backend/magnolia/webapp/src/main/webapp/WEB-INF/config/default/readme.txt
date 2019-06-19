Default configuration directory used with info.magnolia.cms.servlets.MgnlServletContextListener.

Using the Magnolia PropertyInitializer you can easily bundle in the same webapp different set of configurations
which are automatically applied dependending on the server name or the webapp name.
By default the initializer will try to search for the file in different location with different combination of
<code>servername</code> and <code>webapp</code>: the <code>default</code> fallback directory will be used if
no other environment-specific directory has been added.

This is the list of location where the initializer will try to find a configuration file (can be overridden using the
magnolia.initialization.file context parameter in WEB.xml);

 *      WEB-INF/config/${servername}/${webapp}/magnolia.properties,
 *      WEB-INF/config/${servername}/magnolia.properties,
 *      WEB-INF/config/${webapp}/magnolia.properties,
 *      WEB-INF/config/default/magnolia.properties,
 *      WEB-INF/config/magnolia.properties

