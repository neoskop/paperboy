package de.neoskop.magnolia.service;

import de.neoskop.magnolia.PaperboyModule;
import de.neoskop.magnolia.model.Change;
import java.io.IOException;
import javax.inject.Inject;
import javax.inject.Singleton;
import okhttp3.*;
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

  @Inject
  public ChangeAnnouncementService(PaperboyModule module) {
    this.module = module;
  }

  public boolean announce(final Change change) {
    final Request.Builder requestBuilder = module.getWebhookConfig().prepareRequest();
    final Request request =
        requestBuilder
            .post(RequestBody.create(CONTENT_TYPE, change.toJson()))
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
