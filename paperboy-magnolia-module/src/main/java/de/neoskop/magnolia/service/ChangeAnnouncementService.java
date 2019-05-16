package de.neoskop.magnolia.service;

import de.neoskop.magnolia.PaperboyModule;
import de.neoskop.magnolia.model.Change;
import de.neoskop.magnolia.model.Message;
import info.magnolia.cms.beans.config.ServerConfiguration;
import info.magnolia.objectfactory.Components;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import javax.inject.Inject;
import javax.inject.Singleton;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author Arne Diekmann
 * @since 18.12.17
 */
@Singleton
public class ChangeAnnouncementService {
  private static final Logger LOG = LogManager.getLogger(ChangeAnnouncementService.class);
  private static final String USER_AGENT = "Paperboy Magnolia Module";
  private static final MediaType CONTENT_TYPE = MediaType.parse("application/json");
  private final PaperboyModule module;
  private final OkHttpClient client = new OkHttpClient.Builder().build();
  private String source;

  @Inject
  public ChangeAnnouncementService(PaperboyModule module) {
    this.module = module;
    this.source =
        "magnolia-"
            + (Components.getComponent(ServerConfiguration.class).isAdmin() ? "admin" : "public");

    try {
      this.source = InetAddress.getLocalHost().getHostName();
    } catch (UnknownHostException e) {
      LOG.error("Determining local hostname for source failed", e);
    }
  }

  public boolean announce(final Change change) {
    if (!module.isEnabled()) {
      LOG.debug("Dropping change since Paperboy is disabled");
      return true;
    }

    final Request.Builder requestBuilder = module.getWebhookConfig().prepareRequest();
    final Message message = new Message(this.source, change);
    final Request request =
        requestBuilder
            .post(RequestBody.create(CONTENT_TYPE, message.toJson()))
            .header("User-Agent", USER_AGENT)
            .build();

    try (final Response response = client.newCall(request).execute()) {
      if (!response.isSuccessful()) {
        LOG.warn("Web hook responded to the announcement with status code " + response.code());
        return false;
      }
    } catch (IOException e) {
      LOG.error("Announcing change to web hook failed", e);
    }

    return true;
  }
}
